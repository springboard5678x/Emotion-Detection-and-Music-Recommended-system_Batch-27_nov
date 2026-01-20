
from fastapi import FastAPI , Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from tensorflow.keras.models import load_model,Model
from tensorflow.keras.preprocessing.image import img_to_array
import cv2
import numpy as np
import os
import time
import asyncio
import pandas as pd
import xgboost as xgb
import joblib
import threading
import sqlite3
from fastapi.staticfiles import StaticFiles
import hashlib # For basic hashing


# ---------------------------------------------------------
# APP SETUP
# ---------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Add this line near your app setup in main.py
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------------------------------------------------
# LOAD MODELS
# ---------------------------------------------------------
try:
    model = load_model('../models/best_model100.h5')
    print("✅ Emotion Model Loaded")
except Exception as e:
    print("❌ Error loading emotion model:", e)

# Convert CNN → Feature Extractor (second last layer)

# # ---- FIX: Trigger model call so input is initialized ----
# dummy_input = np.zeros((1, 48, 48, 1), dtype=np.float32)
# _ = model.predict(dummy_input)

feature_model = Model(
    inputs=model.layers[0].input,
    outputs=model.layers[-2].output
)

# Load XGBoost classifier
# xgb_model = xgb.XGBClassifier()
xgb_model = xgb.Booster()
xgb_model.load_model("../models/xgb_model.json")
print("✅ XGBoost Model Loaded")

# Load label encoder
encoder = joblib.load("../models/label_encoder.pkl")
print("✅ Label Encoder Loaded")

# Restore ORIGINAL Haar Cascade
face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

class_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# ---------------------------------------------------------
# LOAD MUSIC DATA
# ---------------------------------------------------------
try:
    music_df = pd.read_csv('../dataset/musicdata.csv')
    print("🎵 Music Data Loaded:", len(music_df), "tracks")
    # CLEAN THE DATA — Critical!
    music_df = music_df.dropna(subset=['energy', 'valence', 'id', 'song_name'])  # Drop bad rows
    music_df = music_df[(music_df['energy'].between(0, 1)) & (music_df['valence'].between(0, 1))]  # Valid range
    music_df['id'] = music_df['id'].astype(str).str.strip()  # Clean Spotify IDs

    print(f"Cleaned music database: {len(music_df)} valid tracks")  # Debug print
except:
    print("❌ musicdata.csv missing")
    music_df = pd.DataFrame()

# ---------------------------------------------------------
# GLOBAL STATE
# ---------------------------------------------------------
current_emotion = "Neutral"
emotion_buffer = []
session_history = []
start_time = time.time()
last_recommendation_time = 0
current_song = {"title": "Waiting...", "artist": "", "spotify_id": ""}
# Add these globals at top
last_song_change_time = 0
MIN_SONG_DURATION = 300  # 3 minutes in seconds — adjust to 240 or 300 if needed
previous_mode = "match"
previous_emotion = "Neutral"
# Add globals
positive_mood_hold_time = 300  # 5 minutes
last_positive_time = 0
locked_mood = None

# Mood score mapping for improvement calculation
moodScoreMap = {
    "Angry": 20,
    "Disgust": 25,
    "Fear": 30,
    "Sad": 35,
    "Neutral": 50,
    "Surprise": 65,
    "Happy": 80
}
# ---------------------------------------------------------
# VIDEO FRAME GENERATOR
# ---------------------------------------------------------

# --- 1. GLOBAL HARDWARE SETUP ---
# Open the camera once and leave it open
cap = None
output_frame = None
lock = threading.Lock()
camera_initialized = False # Flag to ensure we only start one thread

def start_camera_hardware():
    """ Initializes the camera and starts the background thread only once. """
    global cap, camera_initialized
    if not camera_initialized:
        print("🚀 Initializing Camera Hardware for Dashboard...")
        cap = cv2.VideoCapture(0)
        # Only start the background thread now
        threading.Thread(target=background_emotion_tracker, daemon=True).start()
        camera_initialized = True

def background_emotion_tracker():
    """ Runs 24/7 in the background. Does detection even if no one is watching. """
    global current_emotion, emotion_buffer, output_frame
    
    while True:
        if cap is None or not cap.isOpened():
            time.sleep(0.1)
            continue
        success, frame = cap.read()
        if not success:
            continue

        # Convert to gray for detector
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detector.detectMultiScale(gray, 1.2, 5)

        for (x, y, w, h) in faces:
            # Process ROI
            roi_gray = cv2.resize(gray[y:y+h, x:x+w], (48, 48))
            roi = roi_gray.astype("float") / 255.0
            roi = np.expand_dims(img_to_array(roi), axis=0)

            # Detect Emotion (Using your feature_model + xgb_model)
            features = feature_model.predict(roi, verbose=0)
            xgb_pred = xgb_model.predict(xgb.DMatrix(features))
            label = class_labels[np.argmax(xgb_pred, axis=1).ravel()[0]]

            # Update Global State
            emotion_buffer.append(label)
            if len(emotion_buffer) > 3: emotion_buffer.pop(0)
            current_emotion = max(set(emotion_buffer), key=emotion_buffer.count)

            # Draw Box
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
            cv2.putText(frame, current_emotion, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (50, 255, 255), 2)

        # Safely update the frame for the UI
        with lock:
            output_frame = frame.copy()
        
        time.sleep(0.01) # Prevent CPU overheating

# Start the background brain immediately
threading.Thread(target=background_emotion_tracker, daemon=True).start()

@app.get("/video_feed")
async def video_feed():
    """ Triggers camera start only when this endpoint is called by the UI. """
    start_camera_hardware() # Trigger the hardware power-on
    """ This only reads the LATEST frame. It never touches the camera hardware. """
    async def stream():
        while True:
            with lock:
                if output_frame is None:
                    continue
                _, buffer = cv2.imencode('.jpg', output_frame)
            
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            await asyncio.sleep(0.04) # ~25 FPS
    return StreamingResponse(stream(), media_type="multipart/x-mixed-replace; boundary=frame")
# async def generate_frames():
#     global current_emotion, emotion_buffer

#     cam = cv2.VideoCapture(0)

#     while True:
#         success, frame = cam.read()
#         if not success:
#             break

#         gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

#         faces = face_detector.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)

#         for (x, y, w, h) in faces:
#             roi_gray = gray[y:y+h, x:x+w]

#             try:
#                 roi_gray = cv2.resize(roi_gray, (48, 48))
#             except:
#                 continue

#             roi = roi_gray.astype("float") / 255.0
#             roi = img_to_array(roi)
#             roi = np.expand_dims(roi, axis=0)

#             # preds = model.predict(roi, verbose=0)[0]
#             # label = class_labels[preds.argmax()]
             

#             # Step 1 — get CNN features (48,48,1 → feature vector)
#             features = feature_model.predict(roi, verbose=0)

#             dmat = xgb.DMatrix(features) 

#             # Step 2 — predict XGBoost output
#             # xgb_pred = xgb_model.predict(features)[0]
#             xgb_pred = xgb_model.predict(dmat)
            
#             # Get the index of the max probability (the predicted class)
#             pred_class_index = np.argmax(xgb_pred, axis=1).ravel()[0]  # shape (1,)

#             # # Step 3 — map back to emotion label
#             # label = encoder.inverse_transform([pred_class_index])[0]

#             # # Convert to plain Python type
#             # label = label.item() if isinstance(label, np.generic) else label

#             # label = str(label)  # <-- NEW LINE

#             # 2. Map the index directly to your class_labels list
#             # This ensures '4' becomes 'Neutral'
#             label = class_labels[pred_class_index]

#             # Push to buffer for stabilizing prediction
#             emotion_buffer.append(label)
#             if len(emotion_buffer) > 3:
#                 emotion_buffer.pop(0)

#             current_emotion = max(set(emotion_buffer), key=emotion_buffer.count)

#             # UI Overlay
            # cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
            # cv2.putText(frame, current_emotion, (x, y - 10),
            #             cv2.FONT_HERSHEY_SIMPLEX, 0.8, (50, 255, 255), 2)

#         _, buffer = cv2.imencode('.jpg', frame)
#         yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' +
#                buffer.tobytes() + b'\r\n')

#         await asyncio.sleep(0.03)




# # ---------------------------------------------------------
# # ENDPOINTS
# # ---------------------------------------------------------

# @app.get("/video_feed")
# async def video_feed():
#     return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/current_emotion")
def get_emotion():
    global locked_mood, last_positive_time
    
    timestamp = time.strftime("%H:%M:%S")

    predicted_emotion = current_emotion

    if not session_history or session_history[-1]["time"] != timestamp:
        session_history.append({"time": timestamp, "emotion": current_emotion})
    # Stabilization logic
    
    now = time.time()
    if predicted_emotion in ['Happy', 'Surprise']:
        locked_mood = predicted_emotion
        last_positive_time = now
    elif predicted_emotion in ['Sad', 'Angry', 'Fear', 'Disgust']:
        locked_mood = None  # Reset on negative
    elif locked_mood and (now - last_positive_time < positive_mood_hold_time):
        predicted_emotion = locked_mood  # Hold positive

    return {"emotion": predicted_emotion}

# =============== ASSISTANT ENDPOINT ==================
"""
This returns a short assistant response based on user emotion.
Frontend will show animated avatar speaking this.
"""
# @app.post("/assistant")
# def assistant():
#     replies = {
#         "Happy": "You look cheerful today! Let's keep the positive energy flowing!",
#         "Sad": "I'm here for you. Let's lift your mood with gentle music.",
#         "Angry": "Deep breath… it's okay. Let’s calm things down together.",
#         "Fear": "You’re safe. I’ll guide you into a peaceful state.",
#         "Neutral": "All steady. Let's stay in a focused flow.",
#         "Surprise": "Woah! Something unexpected happened?",
#         "Disgust": "Hmm… let's shift toward a cleaner emotional space."
#     }
#     return {
#         "emotion": current_emotion,
#         "assistant_reply": replies.get(current_emotion, "I'm here with you.")
#     }
# @app.get("/assistant")
# def assistant(request: Request):
#     emotion = current_emotion
#     mode = "Boost" if "improve" in str(request.query_params) else "Match"  # Simplified

#     replies = {
#         "Happy": "You're glowing today! Let's keep that energy soaring." if mode == "Boost" else "Love seeing you happy. Riding this wave together.",
#         "Sad": "I see you. Let's gently lift the clouds." if mode == "Boost" else "It's okay to feel this. I'm here with soft sounds.",
#         "Angry": "Deep breath. Channeling calm into your space now." if mode == "Boost" else "Validating that fire. Letting it cool naturally.",
#         "Fear": "You're safe. Wrapping you in grounding rhythms." if mode == "Boost" else "Acknowledging the tension. Breathing with you.",
#         "Surprise": "Whoa! Matching that spark!" if mode == "Boost" else "Unexpected energy detected. Syncing up!",
#         "Disgust": "Shifting the vibe. Clearing the air." if mode == "Boost" else "I get it. Playing something cleaner.",
#         "Neutral": "Solid flow state. Optimizing focus tracks." if mode == "Boost" else "Steady and centered. Maintaining your zone."
#     }

#     return {
#         "assistant_reply": replies.get(emotion, "Reading your emotional field...")
#     }

@app.get("/assistant")
def assistant():
    emotion = current_emotion

    # Simple: use global or default — we'll improve later with mode from frontend if needed
    replies = {
        "Happy": "You're glowing today! Let's keep that energy soaring.",
        "Sad": "I see you. Let's gently lift the clouds.",
        "Angry": "Deep breath. Channeling calm into your space now.",
        "Fear": "You're safe. Wrapping you in grounding rhythms.",
        "Surprise": "Whoa! Matching that spark!",
        "Disgust": "Shifting the vibe. Clearing the air.",
        "Neutral": "In the zone. Dialing in the playlist."




    }

    return {
        "assistant_reply": replies.get(emotion, "Reading your emotional field...")
    }

# @app.get("/session_stats")
# def get_session_stats():
#     if not session_history:
#         return {
#             "duration": "00:00",
#             "start_mood": "Neutral",
#             "end_mood": "Neutral",
#             "improvement": "0%",
#             "history": [],
#             "insight": "No session data yet. Start a new session!"
#         }

#     duration_sec = int(time.time() - start_time)
#     mins, secs = divmod(duration_sec, 60)
#     duration = f"{mins:02d}:{secs:02d}"

#     start_mood = session_history[0]['emotion'] if session_history else "Neutral"
#     end_mood = current_emotion

#     start_score = moodScoreMap.get(start_mood, 50)
#     end_score = moodScoreMap.get(end_mood, 50)
#     improvement = round((end_score - start_score) / start_score * 100) if start_score > 0 else 0
#     improvement_str = f"+{improvement}%" if improvement >= 0 else f"{improvement}%"

#     # Dominant mood
#     from collections import Counter
#     moods = [entry['emotion'] for entry in session_history]
#     dominant = Counter(moods).most_common(1)[0][0] if moods else "Neutral"

#     insight = f"Your session lasted {duration}. "
#     insight += f"You started feeling {start_mood.lower()} and ended {end_mood.lower()}. "
#     insight += f"Dominant mood was {dominant}. "
#     insight += f"Mood level changed by {improvement_str}. "
#     insight += "Music helped maintain a productive flow state."

#     return {
#         "duration": duration,
#         "start_mood": start_mood,
#         "end_mood": end_mood,
#         "improvement": improvement_str,
#         "history": session_history,
#         "insight": insight
#     }
@app.get("/session_stats")
def get_session_stats(username: str = Query("Guest")):
    db = get_db()
    # Pull the LATEST session from the database for this specific user
    session = db.execute('''
        SELECT * FROM sessions 
        WHERE username = ? 
        ORDER BY id DESC LIMIT 1
    ''', (username,)).fetchone()
    
    if not session:
        db.close()
        return {"insight": "No sessions found in the database. Start coding to see stats!"}

    # Pull the history markers for that specific session
    history_rows = db.execute('''
        SELECT timestamp as time, emotion 
        FROM mood_history 
        WHERE session_id = ?
    ''', (session['id'],)).fetchall()
    
    db.close()

    return {
        "duration": session['duration'],
        "start_mood": session['start_mood'],
        "end_mood": session['end_mood'],
        "improvement": session['improvement'],
        "insight": session['insight'],
        "history": [dict(row) for row in history_rows]
    }


# ---------------------------------------------------------
# MUSIC ENGINE
# ---------------------------------------------------------

# @app.get("/recommendation")
# def get_music_recommendation():
#     global last_recommendation_time, current_song

#     # rate limiting: avoid changing song too fast
#     if time.time() - last_recommendation_time < 20:
#         return {"song": current_song, "status": "cached"}

#     if music_df.empty:
#         return {"song": {"title": "No Data"}}

#     # EMOTION → MUSIC MATCHING
#     emotion = current_emotion

#     if emotion in ["Angry", "Fear", "Disgust"]:
#         filtered = music_df[(music_df.energy < 0.4) & (music_df.valence > 0.5)]
#     elif emotion == "Sad":
#         filtered = music_df[(music_df.energy > 0.7) & (music_df.valence > 0.6)]
#     else:
#         filtered = music_df[(music_df.energy > 0.4) & (music_df.energy < 0.7)]

#     if not filtered.empty:
#         song = filtered.sample(1).iloc[0]
#         current_song = {
#             "title": song["song_name"],
#             "spotify_id": song["id"],
#             "energy": float(song["energy"]),
#             "valence": float(song["valence"])
#         }

#     last_recommendation_time = time.time()
#     return {"song": current_song}
# Create a helper function in main.py to get the "Stabilized" mood
def get_stabilized_emotion():
    global locked_mood, last_positive_time
    now = time.time()
    predicted_emotion = current_emotion # Raw data from tracker

    if predicted_emotion in ['Happy', 'Surprise']:
        locked_mood = predicted_emotion
        last_positive_time = now
        return predicted_emotion
    elif predicted_emotion in ['Sad', 'Angry', 'Fear', 'Disgust']:
        locked_mood = None
        return predicted_emotion
    elif locked_mood and (now - last_positive_time < positive_mood_hold_time):
        return locked_mood # Return the locked mood instead of Neutral
    
    return predicted_emotion


@app.get("/recommendation")
def get_music_recommendation(mode: str = Query("match", regex="^(match|improve)$"),force: bool = Query(False),username: str = Query("Guest") ):
    global last_recommendation_time, current_song, last_song_change_time, previous_mode,previous_emotion,locked_mood, last_positive_time

    # 1. Use the STABILIZED emotion for logic
    stabilized_mood = get_stabilized_emotion()


    # Allow immediate change if mode switched

    force_change = force or (mode != previous_mode) or (stabilized_mood != previous_emotion)
    previous_mode = mode
    previous_emotion = stabilized_mood  # Update after check

    # Strict cooldown: No change unless forced or time elapsed
    if not force_change and (time.time() - last_song_change_time < MIN_SONG_DURATION):
        return {"song": current_song, "vibe": "Continuing current flow track"}

    if music_df.empty:
        return {"song": {"title": "No Data", "spotify_id": ""}, "vibe": "Database missing"}

    now = time.time()
    if locked_mood and (now - last_positive_time < positive_mood_hold_time):
        emotion = locked_mood
    else:
        emotion = stabilized_mood

    # Base filters (no changes here)
    if mode == "improve":
        if stabilized_mood in ["Sad", "Neutral"]:
            # Transition: Medium Energy, High Valence (Uplifting)
            filtered = music_df[(music_df['valence'] > 0.7) & (music_df['energy'] > 0.4)]
            vibe = "Lifting the clouds..."
        else:
            # Amplification: High Energy, High Valence (Peak Flow)
            filtered = music_df[(music_df['valence'] > 0.8) & (music_df['energy'] > 0.6)]
            vibe = "Peak Productivity Mode"
    
    else:  # mode == "match"
        if emotion in ["Angry", "Fear", "Disgust"]:
            filtered = music_df[(music_df['energy'] < 0.4) & (music_df['valence'] < 0.5)]
            vibe = "Calming Validation"
        elif emotion == "Sad":
            filtered = music_df[(music_df['energy'] < 0.5) & (music_df['valence'] < 0.4)]
            vibe = "Gentle Empathy Boost"
        elif emotion in ["Happy", "Surprise"]:
            filtered = music_df[(music_df['energy'] > 0.6) & (music_df['valence'] > 0.7)]
            vibe = "Amplifying Good Vibes"
        else:  # Neutral
            filtered = music_df[(music_df['energy'].between(0.4, 0.7)) & (music_df['valence'] > 0.5)]
            vibe = "Maintaining Focus Flow"

    # Fallback only if truly empty
    if filtered.empty:
        filtered = music_df[music_df['valence'] > 0.5]
        vibe = "Fallback Neutral Flow"

    # Single sample here — no duplicates!
    if not filtered.empty:
        song_row = filtered.sample(1).iloc[0]
        current_song = {
            "title": song_row["song_name"],
            "spotify_id": song_row["id"],
        }

        # NEW: Log to Database
        db = get_db()
        db.execute("INSERT INTO play_history (username, spotify_id, title) VALUES (?, ?, ?)",
                   (username, current_song["spotify_id"], current_song["title"]))
        db.commit()
        db.close()
        last_song_change_time = time.time()
        last_recommendation_time = time.time()
        # return {"song": current_song, "vibe": vibe}

    # Rare edge case
    return {"song": current_song, "vibe": vibe}
@app.get("/previous_track")
def get_previous_track(username: str = Query("Guest")):
    db = get_db()
    # Fetch the 2nd most recent track (the one before the current one)
    row = db.execute('''
        SELECT spotify_id, title FROM play_history 
        WHERE username = ? 
        ORDER BY played_at DESC LIMIT 1 OFFSET 1
    ''', (username,)).fetchone()
    db.close()
    
    if row:
        return {"song": {"spotify_id": row["spotify_id"], "title": row["title"]}}
    return {"error": "No previous history found"}
# ---------------------------------------------------------
# OPTIONAL: EMOTION → ASSISTANT AVATAR EXPRESSION
# ---------------------------------------------------------

@app.get("/avatar_expression")
def avatar_expression():
    """
    UI will call this to animate your assistant avatar.
    """
    return {
        "expression": current_emotion,
        "emoji": {
            "Happy": "😄",
            "Sad": "😢",
            "Angry": "😡",
            "Surprise": "😮",
            "Fear": "😨",
            "Disgust": "🤢",
            "Neutral": "🙂"
        }.get(current_emotion, "🙂")
    }


@app.post("/assistant_respond")
async def assistant_respond(data: dict):
    emotion = data["emotion"]

    return {"reply": "some text"}

@app.post("/recommend_song")
async def recommend_song(data: dict):
    mood = data["mood"]
    return { "song": {...}, "vibe": "..." }

# --- DATABASE HELPER ---
def get_db():
    conn = sqlite3.connect("moodmate.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.post("/login")
async def user_login(data: dict):
    username = data.get("username")
    db = get_db()
    # Check if user exists, if not, create them (Simple Identity Flow)
    user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if not user:
        db.execute("INSERT INTO users (username) VALUES (?)", (username,))
        db.commit()
    db.close()
    return {"status": "success", "username": username}

@app.post("/save_session")
async def save_session(data: dict):
    db = get_db()
    cursor = db.cursor()
    # Save the master session stats for the long-term history
    cursor.execute('''
        INSERT INTO sessions (username, start_time, end_time, duration, start_mood, end_mood, improvement, insight)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (data['username'], data['start_time'], data['end_time'], data['duration'], 
          data['start_mood'], data['end_mood'], data['improvement'], data['insight']))
    
    session_id = cursor.lastrowid
    
    # Save detailed mood markers for the "Deep Work" analysis
    for entry in data['history']:
        db.execute('INSERT INTO mood_history (session_id, timestamp, emotion) VALUES (?, ?, ?)',
                   (session_id, entry['time'], entry['emotion']))
    
    db.commit()
    db.close()
    return {"status": "saved", "session_id": session_id}

@app.post("/login")
async def user_login(data: dict):
    username = data.get("username")
    db = get_db()
    # Fetch existing user or create a new one
    user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if not user:
        db.execute("INSERT INTO users (username) VALUES (?)", (username,))
        db.commit()
        user = {"username": username, "preferences": '{"mode": "match"}'}
    db.close()
    return {"status": "success", "username": username, "preferences": user["preferences"]}


@app.get("/analytics/focus_peak")
def get_focus_peak(username: str):
    db = get_db()
    # Find the hour (00-23) with the most 'Happy' or 'Neutral' entries
    query = '''
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
        FROM mood_history mh
        JOIN sessions s ON mh.session_id = s.id
        WHERE s.username = ? AND mh.emotion IN ('Happy', 'Neutral')
        GROUP BY hour ORDER BY count DESC LIMIT 1
    '''
    result = db.execute(query, (username,)).fetchone()
    db.close()
    return {"peak_hour": result['hour'] if result else "No data"}
@app.get("/analytics/lifetime")
def get_lifetime_stats(username: str):
    db = get_db()
    # Calculates total focus time across ALL sessions for this specific user
    query = "SELECT SUM(duration) FROM sessions WHERE username = ?"
    result = db.execute(query, (username,)).fetchone()
    db.close()
    return result
@app.post("/register")
async def register(data: dict):
    db = get_db()
    # Check if user exists
    existing = db.execute("SELECT * FROM users WHERE username = ?", (data['username'],)).fetchone()
    if existing:
        return {"status": "error", "message": "User already exists"}
    
    # Hash the password (In production, use a library like passlib)
    pw_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    
    db.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
               (data['username'], pw_hash))
    db.commit()
    db.close()
    return {"status": "success"}

@app.post("/login")
async def login(data: dict):
    db = get_db()
    pw_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    
    user = db.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", 
                      (data['username'], pw_hash)).fetchone()
    db.close()
    
    if user:
        return {"status": "success", "username": user['username']}
    return {"status": "error", "message": "Invalid credentials"}
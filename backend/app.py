import os
import base64
import cv2
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

# ------------------ App Setup ------------------
app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ------------------ Model Load ------------------
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'emotion_model.keras')
model = load_model(MODEL_PATH)

# ------------------ Face Detector ------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

IMG_SIZE = 48

# ------------------ Emotion Labels ------------------
EMOTION_LABELS = {
    0: "Angry",
    1: "Disgust",
    2: "Fear",
    3: "Happy",
    4: "Neutral",
    5: "Sad",
    6: "Surprise"
}

# ------------------ Text → Emotion Mapping ------------------
TEXT_TO_EMOTION = {
    "angry": 0,
    "mad": 0,
    "furious": 0,

    "disgust": 1,
    "gross": 1,

    "fear": 2,
    "scared": 2,
    "afraid": 2,

    "happy": 3,
    "joy": 3,
    "excited": 3,

    "neutral": 4,
    "okay": 4,
    "fine": 4,

    "sad": 5,
    "melancholic": 5,
    "depressed": 5,

    "surprise": 6,
    "shocked": 6,
    "amazed": 6
}

# ------------------ Songs ------------------
songs = [
    {"song_id":1, "title":"Happy", "artist":"Pharrell Williams", "emotion_id":3, "spotify_url":"https://open.spotify.com/playlist/5UgG3XS8q1lgsnHqRi6Qle?si=qabTNk1wTzO4ZzlEnjkWPQ"},
    {"song_id":2, "title":"Birthday", "artist":"Katy Perry", "emotion_id":3, "spotify_url":"https://open.spotify.com/track/2xLOMHjkOK8nzxJ4r6yOKR?si=3faac9ff22f2438d"},
    {"song_id":3, "title":"Best Day Of My Life", "artist":"American Authors", "emotion_id":3, "spotify_url":"https://open.spotify.com/track/5Hroj5K7vLpIG4FNCRIjbP?si=f142cc75ec4a484b"},
    {"song_id":4, "title":"I Need", "artist":"Pink Sweat", "emotion_id":4, "spotify_url":"https://open.spotify.com/track/0ri0Han4IRJhzvERHOZTMr?si=b0e027530c8e4829"},
    {"song_id":5, "title":"Sad!", "artist":"XXXTentacion", "emotion_id":4, "spotify_url":"https://open.spotify.com/track/3ee8Jmje8o58CHK66QrVC2?si=4ea238b3351a437f"},
    {"song_id":6, "title":"Memories", "artist":"Maroon 5", "emotion_id":4, "spotify_url":"https://open.spotify.com/track/4cktbXiXOapiLBMprHFErI?si=6957be65fe4d47f0"},
    {"song_id":7, "title":"Bad", "artist":"David Guetta", "emotion_id":0, "spotify_url":"https://open.spotify.com/playlist/6QpaQpHleuD2VehcvC9fcT?si=3OPMtttkQnu1FOf5Zs2kCA"},
    {"song_id":8, "title":"Lose Yourself", "artist":"Eminem", "emotion_id":0, "spotify_url":"https://open.spotify.com/track/7MJQ9Nfxzh8LPZ9e9u68Fq?si=e871e16f92494fbc"},
    {"song_id":9, "title":"Bulls On Parade", "artist":"Rage Against The Machine", "emotion_id":0, "spotify_url":"https://open.spotify.com/track/0tZ3mElWcr74OOhKEiNz1x?si=2ef21729a38144f4"},
    {"song_id":10, "title":"Yellow", "artist":"Coldplay", "emotion_id":6, "spotify_url":"https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg?si=9fee48c4f87442b9"},
    {"song_id":11, "title":"Love Yourself", "artist":"Justin Bieber", "emotion_id":6, "spotify_url":"https://open.spotify.com/track/50kpGaPAhYJ3sGmk6vplg0?si=d08d7593d1af4a8a"},
    {"song_id":12, "title":"Calm After The Storm", "artist":"The Common Linnets", "emotion_id":6, "spotify_url":"https://open.spotify.com/track/6C2GZHFFO8uXuMYCHiW5Y4?si=0ec71b92a9d64b94"},
    {"song_id":13, "title":"Wake Me Up", "artist":"Avicii", "emotion_id":5, "spotify_url":"https://open.spotify.com/track/0nrRP2bk19rLc0orkWPQk2?si=cea493b04dbc4a85"},
    {"song_id":14, "title":"Uptown Funk", "artist":"Mark Ronson ft. Bruno Mars", "emotion_id":5, "spotify_url":"https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS?si=d1b19e75b8d14221"},
    {"song_id":15, "title":"Surprise Yourself", "artist":"Jack Garratt", "emotion_id":5, "spotify_url":"https://open.spotify.com/track/6YaC65M3ujeROidG3b09J0?si=bbb968d64e15490a"},
    {"song_id":16, "title":"No Scrubs", "artist":"TLC", "emotion_id":1, "spotify_url":"https://open.spotify.com/track/1KGi9sZVMeszgZOWivFpxs?si=1574899b31214fa2"},
    {"song_id":17, "title":"Bad Blood", "artist":"Taylor Swift", "emotion_id":1, "spotify_url":"https://open.spotify.com/track/0TvQLMecTE8utzoNmvXRbK?si=08ffa8a95e9f4b07"},
    {"song_id":18, "title":"I'm Not Angry", "artist":"Halsey", "emotion_id":1, "spotify_url":"https://open.spotify.com/track/6FZDfxM3a3UCqtzo5pxSLZ?si=e8e2e96f643c4100"},
    {"song_id":19, "title":"Magic", "artist":"Coldplay", "emotion_id":2, "spotify_url":"https://open.spotify.com/track/23khhseCLQqVMCIT1WMAns?si=5fcc8abf2bfd49fc"},
    {"song_id":20, "title":"Fearless", "artist":"Taylor Swift", "emotion_id":2, "spotify_url":"https://open.spotify.com/track/replace_with_link"}
]
music_df = pd.DataFrame(songs)

# ------------------ Image Preprocessing ------------------
def preprocess_image(base64_string):
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]

    img_bytes = base64.b64decode(base64_string)
    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30)
    )

    if len(faces) == 0:
        raise ValueError("No face detected")

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face = gray[y:y+h, x:x+w]

    face = cv2.equalizeHist(face)
    face = cv2.resize(face, (IMG_SIZE, IMG_SIZE))
    face = face.astype("float32") / 255.0
    face = face.reshape(1, IMG_SIZE, IMG_SIZE, 1)

    return face

# ------------------ Song Recommendation ------------------
def recommend_songs(emotion_id):
    filtered = music_df[music_df["emotion_id"] == emotion_id]
    if filtered.empty:
        return []
    return filtered.sample(min(3, len(filtered))).to_dict(orient="records")

# ------------------ Routes ------------------
@app.route('/')
def home():
    return "MoodMate Brain is Active!"

@app.route('/predict_emotion', methods=['POST'])
def predict_emotion():
    try:
        data = request.get_json()
        image_data = data.get("image")

        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        processed_img = preprocess_image(image_data)
        predictions = model.predict(processed_img, verbose=0)

        idx = int(np.argmax(predictions[0]))
        emotion = EMOTION_LABELS[idx]
        confidence = float(predictions[0][idx])

        return jsonify({
            "emotion": emotion,
            "confidence": f"{confidence * 100:.2f}%",
            "songs": recommend_songs(idx)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/text_mood', methods=['POST'])
def text_mood():
    try:
        data = request.get_json()
        text = data.get("text", "").lower()

        detected_emotion_id = 4  # Neutral default

        for keyword, emotion_id in TEXT_TO_EMOTION.items():
            if keyword in text:
                detected_emotion_id = emotion_id
                break

        return jsonify({
            "emotion": EMOTION_LABELS[detected_emotion_id],
            "songs": recommend_songs(detected_emotion_id)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------ Run Server ------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=7860)









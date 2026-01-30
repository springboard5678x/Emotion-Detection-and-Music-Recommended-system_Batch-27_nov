
import os
import cv2
import json
import numpy as np
import pandas as pd
import secrets
from flask import Flask, Response, jsonify, render_template_string, request, redirect, url_for, session, flash
import tensorflow as tf
from collections import deque
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# --- CONFIGURATION ---
USER_DATA_FILE = "users.json"
MODEL_PATH = r"D:\emotion detection\Emotion-Detection-and-Music-Recommended-system_Batch-27_nov\models\cnn_emotion_model2.h5"
DATASET_PATH = r"D:\emotion detection\Emotion-Detection-and-Music-Recommended-system_Batch-27_nov\datasets\msd\Last.fm_data.csv"
EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# --- FALLBACK MUSIC DATABASE (10 per emotion) ---
FALLBACK_SONGS = {
    'Angry': [
        ('Break Stuff', 'Limp Bizkit'),
        ('Killing in the Name', 'RATM'),
        ('Down with the Sickness', 'Disturbed'),
        ('Walk', 'Pantera'),
        ('The Way I Am', 'Eminem'),
        ('Before I Forget', 'Slipknot'),
        ('Bodies', 'Drowning Pool'),
        ('Smells Like Teen Spirit', 'Nirvana'),
        ('Toxicity', 'System of a Down'),
        ('One Step Closer', 'Linkin Park')
    ],
    'Happy': [
        ('Happy', 'Pharrell Williams'),
        ('Can\'t Stop the Feeling', 'Justin Timberlake'),
        ('Uptown Funk', 'Bruno Mars'),
        ('Walking on Sunshine', 'Katrina and The Waves'),
        ('Good Vibrations', 'The Beach Boys'),
        ('Don\'t Stop Me Now', 'Queen'),
        ('Best Day of My Life', 'American Authors'),
        ('September', 'Earth Wind and Fire'),
        ('Shake It Off', 'Taylor Swift'),
        ('Dynamite', 'BTS')
    ],
    'Sad': [
        ('Someone Like You', 'Adele'),
        ('Fix You', 'Coldplay'),
        ('Stay With Me', 'Sam Smith'),
        ('The Night We Met', 'Lord Huron'),
        ('Hurt', 'Johnny Cash'),
        ('Yesterday', 'The Beatles'),
        ('Skinny Love', 'Bon Iver'),
        ('All I Want', 'Kodaline'),
        ('Whiskey Lullaby', 'Brad Paisley'),
        ('Say Something', 'A Great Big World')
    ],
    'Neutral': [
        ('Weightless', 'Marconi Union'),
        ('Breathe Me', 'Sia'),
        ('Lush Life', 'Zara Larsson'),
        ('Sunflower', 'Post Malone'),
        ('Dreams', 'Fleetwood Mac'),
        ('Better Together', 'Jack Johnson'),
        ('Gravity', 'John Mayer'),
        ('Nightcall', 'Kavinsky'),
        ('Sunset Lover', 'Petit Biscuit'),
        ('Ocean Eyes', 'Billie Eilish')
    ],
    'Fear': [
        ('Bury a Friend', 'Billie Eilish'),
        ('Nightmare', 'Avenged Sevenfold'),
        ('Thriller', 'Michael Jackson'),
        ('Disturbia', 'Rihanna'),
        ('Heathens', 'Twenty One Pilots'),
        ('The Hills', 'The Weeknd'),
        ('Creep', 'Radiohead'),
        ('Run For Your Life', 'The Beatles'),
        ('Haunted', 'Beyonce'),
        ('Somebody\'s Watching Me', 'Rockwell')
    ],
    'Surprise': [
        ('Bohemian Rhapsody', 'Queen'),
        ('Mr Brightside', 'The Killers'),
        ('Feel Good Inc', 'Gorillaz'),
        ('Starboy', 'The Weeknd'),
        ('Seven Nation Army', 'The White Stripes'),
        ('Blinding Lights', 'The Weeknd'),
        ('Take On Me', 'a-ha'),
        ('Hey Ya', 'Outkast'),
        ('Wonderwall', 'Oasis'),
        ('Radioactive', 'Imagine Dragons')
    ],
    'Disgust': [
        ('Bad Guy', 'Billie Eilish'),
        ('Look What You Made Me Do', 'Taylor Swift'),
        ('Toxic', 'Britney Spears'),
        ('Ugly', 'The Sugababes'),
        ('No Scrubs', 'TLC'),
        ('Creep', 'Stone Temple Pilots'),
        ('I Hate Everything About You', 'Three Days Grace'),
        ('You Oughta Know', 'Alanis Morissette'),
        ('Puke', 'Eminem'),
        ('Not Afraid', 'Eminem')
    ]
}

# --- DATA LOADING ---
def load_users():
    if not os.path.exists(USER_DATA_FILE):
        return {}
    with open(USER_DATA_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return {}

def save_users(users):
    with open(USER_DATA_FILE, 'w') as f:
        json.dump(users, f)

model = None
if os.path.exists(MODEL_PATH):
    model = tf.keras.models.load_model(MODEL_PATH)

music_df = pd.DataFrame(columns=['title', 'artist'])
try:
    music_df = pd.read_csv(DATASET_PATH, encoding='latin1')
except Exception as e:
    print(f"CSV Error: {e}")

# --- GLOBAL STATE ---
current_mood = "None"
emotion_buffer = deque(maxlen=10)
hits = {label: 0 for label in EMOTION_LABELS}
camera_active = False

# --- API ROUTES ---
@app.route('/api/data')
def get_data():
    key = current_mood if current_mood != "None" else "Neutral"
    final_songs = []
    
    if not music_df.empty:
        mask = music_df.astype(str).apply(lambda x: x.str.contains(key.lower(), case=False, na=False)).any(axis=1)
        dataset_matches = music_df[mask]
        
        if not dataset_matches.empty:
            sample_size = min(len(dataset_matches), 7)
            csv_sample = dataset_matches.sample(sample_size)
            for _, r in csv_sample.iterrows():
                title = str(r.iloc[0])
                artist = str(r.iloc[1])
                if not title.isdigit():
                    final_songs.append({
                        "title": title,
                        "artist": artist,
                        "url": f"https://www.youtube.com/results?search_query={title} {artist}"
                    })
    
    fallbacks = FALLBACK_SONGS.get(key, FALLBACK_SONGS['Neutral'])
    for f_title, f_artist in fallbacks:
        if len(final_songs) >= 10:
            break
        if not any(s['title'].lower() == f_title.lower() for s in final_songs):
            final_songs.append({
                "title": f_title,
                "artist": f_artist,
                "url": f"https://www.youtube.com/results?search_query={f_title} {f_artist}"
            })
    
    return jsonify({
        "mood": current_mood,
        "labels": list(hits.keys()),
        "counts": list(hits.values()),
        "songs": final_songs
    })

# --- IMPROVED CAMERA LOGIC WITH BETTER EMOTION DETECTION ---
def gen_frames():
    global camera_active, current_mood, emotion_buffer, hits
    
    current_mood = "None"
    emotion_buffer.clear()
    
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_BRIGHTNESS, 128)
    
    face_casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    frame_count = 0
    
    while camera_active:
        success, frame = cap.read()
        if not success:
            break
        
        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray = clahe.apply(gray)
        
        faces = face_casc.detectMultiScale(
            gray,
            scaleFactor=1.05,
            minNeighbors=6,
            minSize=(80, 80),
            maxSize=(500, 500),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (66, 133, 244), 3)
            
            padding = int(0.1 * h)
            y1 = max(0, y - padding)
            y2 = min(gray.shape[0], y + h + padding)
            x1 = max(0, x - padding)
            x2 = min(gray.shape[1], x + w + padding)
            
            roi = gray[y1:y2, x1:x2]
            
            roi = cv2.resize(roi, (48, 48), interpolation=cv2.INTER_CUBIC)
            roi = cv2.GaussianBlur(roi, (3, 3), 0)
            roi = roi.astype('float32') / 255.0
            
            roi_uint8 = (roi * 255).astype('uint8')
            roi_uint8 = cv2.equalizeHist(roi_uint8)
            roi = roi_uint8.astype('float32') / 255.0
            
            roi = np.reshape(roi, (1, 48, 48, 1))
            
            if model:
                preds = model.predict(roi, verbose=0)[0]
                emotion_idx = np.argmax(preds)
                confidence = preds[emotion_idx]
                detected = EMOTION_LABELS[emotion_idx]
                
                if confidence > 0.30:
                    emotion_buffer.append(detected)
                    if len(emotion_buffer) >= 5:
                        current_mood = max(set(list(emotion_buffer)[-7:]), key=list(emotion_buffer)[-7:].count)
                        hits[current_mood] += 1
                
                label = f"{detected} ({confidence*100:.1f}%)"
                cv2.putText(frame, label, (x, y-15),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (66, 133, 244), 2)
                
                top_3_idx = np.argsort(preds)[-3:][::-1]
                y_offset = y + h + 25
                for idx in top_3_idx:
                    emotion_text = f"{EMOTION_LABELS[idx]}: {preds[idx]*100:.0f}%"
                    cv2.putText(frame, emotion_text, (x, y_offset),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                    y_offset += 20
            
            break
        
        frame_count += 1
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    
    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/toggle_camera')
def toggle_camera():
    global camera_active, current_mood, emotion_buffer
    camera_active = request.args.get('status') == 'true'
    if not camera_active:
        current_mood = "None"
        emotion_buffer.clear()
    return jsonify({"status": camera_active})

# --- PAGE ROUTES ---
@app.route('/')
def index():
    return render_template_string(LANDING_HTML)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = request.form.get('username')
        pw = request.form.get('password')
        users = load_users()
        if user in users and check_password_hash(users[user], pw):
            session['logged_in'] = True
            session['username'] = user
            return redirect(url_for('welcome'))
        flash("Invalid login.")
    return render_template_string(AUTH_HTML, mode="login")

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        user = request.form.get('username')

        pw = request.form.get('password')
        users = load_users()
        if user in users:
            flash("User exists!")
        else:
            users[user] = generate_password_hash(pw)
            save_users(users)
            return redirect(url_for('login'))
    return render_template_string(AUTH_HTML, mode="signup")

@app.route('/logout')
def logout():
    global camera_active, current_mood, emotion_buffer
    camera_active = False
    current_mood = "None"
    emotion_buffer.clear()
    session.clear()
    return redirect(url_for('login'))

@app.route('/welcome')
def welcome():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template_string(WELCOME_HTML, username=session.get('username'))

@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template_string(MAIN_HTML, username=session.get('username'))

# --- UI TEMPLATES ---

LANDING_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AuraStream AI</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Outfit', sans-serif; 
            background: #000; 
            overflow: hidden; 
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Animated gradient background */
        .gradient-bg {
            position: fixed;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #000428, #004e92, #000428, #004e92);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            z-index: -2;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Floating orbs */
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.6;
            animation: float 20s infinite ease-in-out;
        }
        
        .orb1 {
            width: 400px;
            height: 400px;
            background: linear-gradient(45deg, #4285f4, #9b72cb);
            top: -100px;
            left: -100px;
            animation-delay: 0s;
        }
        
        .orb2 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #d96570, #9b72cb);
            bottom: -150px;
            right: -150px;
            animation-delay: 5s;
        }
        
        .orb3 {
            width: 350px;
            height: 350px;
            background: linear-gradient(90deg, #4285f4, #46bdc6);
            top: 50%;
            right: 10%;
            animation-delay: 10s;
        }
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(50px, -50px) scale(1.1); }
            50% { transform: translate(-30px, 30px) scale(0.9); }
            75% { transform: translate(40px, 50px) scale(1.05); }
        }
        
        /* Particle effect */
        .particles {
            position: fixed;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        
        .particle {
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(66, 133, 244, 0.8);
            border-radius: 50%;
            animation: rise 15s infinite ease-in;
        }
        
        @keyframes rise {
            0% {
                bottom: -10px;
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                bottom: 110%;
                opacity: 0;
            }
        }
        
        /* Main container */
        .container {
            text-align: center;
            z-index: 10;
            animation: fadeInScale 1.2s ease-out;
        }
        
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(30px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        /* Logo */
        .logo {
            width: 150px;
            height: 150px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #4285f4, #9b72cb, #d96570);
            border-radius: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            font-weight: 800;
            color: #fff;
            box-shadow: 0 20px 60px rgba(66, 133, 244, 0.4);
            animation: pulse 3s ease-in-out infinite;
            position: relative;
            overflow: hidden;
        }
        
        .logo::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shine 3s linear infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 20px 60px rgba(66, 133, 244, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 25px 80px rgba(66, 133, 244, 0.6); }
        }
        
        @keyframes shine {
            from { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            to { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        /* Title */
        .title {
            font-size: 5rem;
            font-weight: 800;
            background: linear-gradient(to right, #fff, #4285f4, #9b72cb, #fff);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            animation: shimmer 3s linear infinite;
            letter-spacing: -2px;
        }
        
        @keyframes shimmer {
            to { background-position: 200% center; }
        }
        
        .subtitle {
            font-size: 1.3rem;
            color: #8892b0;
            margin-bottom: 10px;
            font-weight: 300;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        
        .tagline {
            font-size: 1.5rem;
            color: #a8b2d1;
            margin-bottom: 50px;
            font-weight: 400;
        }
        
        /* Button */
        .enter-btn {
            display: inline-block;
            padding: 20px 60px;
            background: linear-gradient(135deg, #4285f4, #9b72cb);
            color: #fff;
            font-size: 1.3rem;
            font-weight: 800;
            text-decoration: none;
            border-radius: 50px;
            box-shadow: 0 10px 40px rgba(66, 133, 244, 0.4);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.1);
        }
        
        .enter-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        
        .enter-btn:hover::before {
            width: 400px;
            height: 400px;
        }
        
        .enter-btn:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 50px rgba(66, 133, 244, 0.6);
        }
        
        .enter-btn span {
            position: relative;
            z-index: 1;
        }
        
        /* Feature cards */
        .features {
            display: flex;
            gap: 30px;
            justify-content: center;
            margin-top: 60px;
            animation: fadeInUp 1.5s ease-out 0.5s both;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .feature {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 25px;
            width: 200px;
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
        }
        
        .feature:hover {
            background: rgba(255,255,255,0.06);
            transform: translateY(-10px);
            border-color: rgba(66, 133, 244, 0.5);
        }
        
        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }
        
        .feature-title {
            color: #fff;
            font-weight: 800;
            margin-bottom: 8px;
            font-size: 1.1rem;
        }
        
        .feature-text {
            color: #8892b0;
            font-size: 0.9rem;
            font-weight: 300;
        }
    </style>
</head>
<body>
    <div class="gradient-bg"></div>
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>
    
    <div class="particles" id="particles"></div>
    
    <div class="container">
        <div class="logo">🎵</div>
        <p class="subtitle"></p>
        <h1 class="title">AuraStream</h1>
        <p class="tagline">Your emotions. Your soundtrack. Perfectly synced.</p>
        <a href="/login" class="enter-btn">
            <span>ENTER EXPERIENCE</span>

        </a>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">😊</div>
                <div class="feature-title">Emotion AI</div>
                <div class="feature-text">Real-time facial emotion detection</div>
            </div>
            <div class="feature">
                <div class="feature-icon">🎼</div>
                <div class="feature-title">Smart Playlists</div>
                <div class="feature-text">Music curated to your mood</div>
            </div>
            <div class="feature">
                <div class="feature-icon">📊</div>
                <div class="feature-title">Insights</div>
                <div class="feature-text">Track your emotional journey</div>
            </div>
        </div>
    </div>
    
    <script>
        // Generate particles
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    </script>
</body>
</html>
"""

WELCOME_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Welcome | AuraStream</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;800&display=swap" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; font-family: 'Outfit'; background: #000; overflow: hidden; }
        .aura-bg { position: fixed; width: 100vw; height: 100vh; background: radial-gradient(circle at 50% 50%, #080d21 0%, #000 85%); z-index: -1; }
        .glow { position: absolute; width: 900px; height: 900px; border-radius: 50%; background: conic-gradient(from 0deg, #4285f4, #9b72cb, #d96570, #4285f4); filter: blur(150px); opacity: 0.2; animation: rotate 20s linear infinite; top: -20%; left: -10%; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .card { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 450px; padding: 50px; text-align: center; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 50px; backdrop-filter: blur(40px); animation: fadeInUp 1s ease-out; }
        .avatar { width: 90px; height: 90px; margin: 0 auto 25px; background: linear-gradient(45deg, #4285f4, #9b72cb); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: #fff; box-shadow: 0 10px 30px rgba(66,133,244,0.4); }
        h1 { font-size: 3rem; font-weight: 800; margin: 0; background: linear-gradient(to right, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .btn { margin-top: 40px; padding: 18px 45px; border-radius: 100px; background: #fff; color: #000; text-decoration: none; font-weight: 800; display: inline-block; transition: 0.3s; }
        .btn:hover { transform: scale(1.05); background: #4285f4; color: #fff; box-shadow: 0 10px 30px rgba(66,133,244,0.5); }
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, -40%); } to { opacity: 1; transform: translate(-50%, -50%); } }
    </style>
</head>
<body>
    <div class="aura-bg"><div class="glow"></div></div>
    <div class="card">
        <div class="avatar">{{ username[0]|upper }}</div>
        <p style="color: #4285f4; font-weight: 800; letter-spacing: 2px; margin-bottom: 10px;">INTELLIGENCE INITIALIZED</p>
        <h1>Hi, {{ username }}</h1>
        <p style="color: #8892b0; margin-top: 15px;">Your hybrid playlist of CSV tracks and AI favorites is ready.</p>
        <a href="/dashboard" class="btn">LAUNCH DASHBOARD</a>
    </div>
</body>
</html>
"""

MAIN_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AuraStream AI</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <style>
        body { background: #000; color: #fff; font-family: 'Outfit'; height: 100vh; overflow: hidden; }
        .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 40px; padding: 25px; backdrop-filter: blur(20px); }
        .header-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px; }
        .user-info { display: flex; align-items: center; gap: 15px; }
        .user-avatar { width: 45px; height: 45px; background: linear-gradient(45deg, #4285f4, #9b72cb); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
        .logout-btn { padding: 10px 25px; background: rgba(217,101,112,0.1); border: 1px solid #d96570; border-radius: 20px; color: #d96570; text-decoration: none; font-weight: 800; transition: 0.3s; }
        .logout-btn:hover { background: #d96570; color: #fff; }
        #video-box { width: 100%; height: 380px; background: #000; border-radius: 30px; overflow: hidden; border: 2px solid #111; }
        #feed { width: 100%; height: 100%; object-fit: cover; display: none; }
        .gemini-btn { border: none; border-radius: 20px; padding: 15px 40px; font-weight: 800; color: white; background: linear-gradient(90deg, #4285f4, #9b72cb); transition: 0.4s; cursor: pointer; }
        .gemini-btn.active { background: #d96570; }
        .song-item { background: rgba(255,255,255,0.03); padding: 15px; border-radius: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: white; transition: 0.3s; border-left: 4px solid transparent; }
        .song-item:hover { background: rgba(66, 133, 244, 0.1); border-left-color: #4285f4; transform: translateX(5px); }
        ::-webkit-scrollbar { width: 0px; }
        .brand { font-size: 1.5rem; font-weight: 800; background: linear-gradient(to right, #4285f4, #9b72cb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body>
    <div class="header-bar">
        <div class="brand">AuraStream AI</div>
        <div class="user-info">
            <div class="user-avatar">{{ username[0]|upper }}</div>
            <div>
                <div style="font-weight: 800; font-size: 1.1rem;">{{ username }}</div>
                <div style="font-size: 0.85rem; color: #8892b0;">Active Session</div>
            </div>
            <a href="/logout" class="logout-btn">LOGOUT</a>
        </div>
    </div>
    
    <div class="container-fluid p-4">
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="glass d-flex align-items-center gap-4 mb-4">
                    <div style="flex:1.2"><div id="video-box"><img id="feed" src=""></div></div>
                    <div style="flex:1" class="text-center">
                        <div id="emoji" style="font-size: 5rem; display:none;"></div>
                        <div id="mood" style="font-size: 3.5rem; font-weight:800; display:none;"></div>
                        <div id="placeholder" style="font-size: 1.5rem; color: #8892b0; display:block;">Click "Start Session" to begin</div>
                        <button id="toggleBtn" class="gemini-btn" onclick="handleToggle()">Start Session</button>
                    </div>
                </div>
                <div class="row g-4">
                    <div class="col-7"><div class="glass" style="height:300px;"><canvas id="bar"></canvas></div></div>
                    <div class="col-5"><div class="glass" style="height:300px;"><canvas id="pie"></canvas></div></div>
                </div>
            </div>
            <div class="col-lg-4 glass d-flex flex-column" style="height: calc(100vh - 150px);">
                <h4 class="fw-800 mb-4" style="color:#4285f4">Aura Playlist</h4>
                <div id="songs" style="overflow-y:auto; flex-grow:1;"></div>
            </div>
        </div>
    </div>
    <script>
        const colors = { 'Angry': '#ff4b2b', 'Disgust': '#1fddff', 'Fear': '#777', 'Happy': '#ffcf33', 'Neutral': '#4285f4', 'Sad': '#9b72cb', 'Surprise': '#46bdc6' };
        const emojis = { 'Angry': '😡', 'Disgust': '🤢', 'Fear': '😨', 'Happy': '😊', 'Neutral': '😐', 'Sad': '😢', 'Surprise': '😲' };
        let active = false;

        async function handleToggle() {
            active = !active;
            const btn = document.getElementById('toggleBtn');
            const img = document.getElementById('feed');
            const moodEl = document.getElementById('mood');
            const emojiEl = document.getElementById('emoji');
            const placeholderEl = document.getElementById('placeholder');
            
            await fetch(`/api/toggle_camera?status=${active}`);
            btn.innerText = active ? "Stop Session" : "Start Session";
            btn.classList.toggle('active');
            img.style.display = active ? 'block' : 'none';
            img.src = active ? "/video_feed" : "";
            
            // Only show mood/emoji when active AND mood is detected
            if (!active) {
                moodEl.style.display = 'none';
                emojiEl.style.display = 'none';
                placeholderEl.style.display = 'block';
            } else {
                placeholderEl.style.display = 'none';
            }
        }

        Chart.register(ChartDataLabels);
        const barChart = new Chart(document.getElementById('bar'), { type:'bar', data:{ labels:[], datasets:[{ data:[], borderRadius:10 }] }, options:{ maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{display:false}, x:{ticks:{color:'#8892b0'}}} } });
        const pieChart = new Chart(document.getElementById('pie'), { type:'doughnut', data:{ labels:[], datasets:[{ data:[], backgroundColor:[], borderWidth:0 }] }, options:{ maintainAspectRatio:false, cutout:'70%', plugins:{legend:{display:false}, datalabels:{color:'#fff', font:{weight:'800'}, formatter:(v,c)=>{let s=c.dataset.data.reduce((a,b)=>a+b,0); return s>0?Math.round(v/s*100)+'%':''}}} } });

        async function update() {
            if(!active) return;
            const r = await fetch('/api/data');
            const d = await r.json();
            
            // Only show mood when it's actually detected (not "None")
            if(d.mood !== "None") {
                document.getElementById('mood').innerText = d.mood;
                document.getElementById('emoji').innerText = emojis[d.mood] || '✨';
                document.getElementById('mood').style.display = 'block';
                document.getElementById('emoji').style.display = 'block';
                
                const cArr = d.labels.map(l => colors[l]);
                barChart.data.labels = d.labels; 
                barChart.data.datasets[0].data = d.counts; 
                barChart.data.datasets[0].backgroundColor = cArr; 
                barChart.update();
                
                pieChart.data.labels = d.labels; 
                pieChart.data.datasets[0].data = d.counts; 
                pieChart.data.datasets[0].backgroundColor = cArr; 
                pieChart.update();
                
                document.getElementById('songs').innerHTML = d.songs.map(s => `<a href="${s.url}" target="_blank" class="song-item"><div><div class="fw-bold">${s.title}</div><small style="color:#8892b0">${s.artist}</small></div><div class="text-primary fw-bold">PLAY</div></a>`).join('');
            } else {
                // Keep mood/emoji hidden while waiting for detection
                document.getElementById('mood').style.display = 'none';
                document.getElementById('emoji').style.display = 'none';
            }
        }
        setInterval(update, 3000);
    </script>
</body>
</html>
"""

AUTH_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>AuraStream Access</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;800&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; background: #000; font-family: 'Outfit'; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .card { background: rgba(255,255,255,0.05); padding: 50px; border-radius: 40px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); text-align: center; width: 380px; }
        h1 { color: #fff; font-weight: 800; margin-bottom: 30px; }
        input { width: 100%; padding: 15px; margin: 10px 0; border-radius: 12px; border: 1px solid #222; background: #000; color: #fff; box-sizing: border-box; }
        button { width: 100%; padding: 15px; background: linear-gradient(90deg, #4285f4, #9b72cb); color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; margin-top: 15px; }
        .link { color: #8892b0; font-size: 0.9rem; margin-top: 20px; display: block; text-decoration: none; }
    </style>
</head>
<body>
    <div class="card">
        <h1>AuraStream</h1>
        <form method="POST">
            <input name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">ENTER SYSTEM</button>
        </form>
        <a href="/{{ 'signup' if mode=='login' else 'login' }}" class="link">{{ 'Create Account' if mode=='login' else 'Back to Login' }}</a>
    </div>

</body>
</html>
"""

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)
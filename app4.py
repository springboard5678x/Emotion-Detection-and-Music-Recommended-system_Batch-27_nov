import streamlit as st
import cv2
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import time

# --- PAGE CONFIG ---
st.set_page_config(
    page_title="MoodMate AI",
    page_icon="🎵",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CUSTOM CSS FOR DARK THEME AND BETTER UI ---
st.markdown("""
<style>
    body {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        font-family: 'Arial', sans-serif;
    }
    .main-header {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
    }
    .emotion-card {
        background: rgba(255, 255, 255, 0.2);
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        margin-bottom: 20px;
        color: white;
    }
    .song-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        margin-bottom: 10px;
        color: white;
    }
    .sidebar-content {
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: white;
    }
    .stButton>button {
        background: linear-gradient(90deg, #ff6b6b 0%, #ffa500 100%);
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-weight: bold;
    }
    .stButton>button:hover {
        background: linear-gradient(90deg, #ffa500 0%, #ff6b6b 100%);
    }
    .stTextInput, .stFileUploader, .stRadio {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        color: white;
    }
    .stProgress > div > div > div > div {
        background: linear-gradient(90deg, #ff6b6b 0%, #ffa500 100%);
    }
    .stSuccess, .stInfo, .stWarning, .stError {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 5px;
    }
    .stExpander {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
    }
</style>
""", unsafe_allow_html=True)

# --- SIDEBAR ---
with st.sidebar:
    st.markdown('<div class="sidebar-content">', unsafe_allow_html=True)
    st.title("🎵 MoodMate AI")
    st.markdown("### Settings")
    if st.button("Reset Session"):
        st.session_state.clear()
        st.experimental_rerun()
    st.markdown("---")
    st.markdown("**About:** Detect emotions from your face and get personalized music recommendations with comforting messages!")
    st.markdown("**Note:** Ensure good lighting for better detection.")
    st.markdown('</div>', unsafe_allow_html=True)

# --- MAIN HEADER ---
st.markdown('<div class="main-header"><h1>🎵 MoodMate AI</h1><p>Emotion-Based Music Recommender with Personalized Comfort</p></div>', unsafe_allow_html=True)

# --- LOAD RESOURCES ---
@st.cache_resource
def load_resources():
    try:
        model = load_model('emotion_custommodel60.h5')
        music_df = pd.read_csv('music_with_moods.csv')
        labels = ['Angry', 'Disgusted', 'Fearful', 'Happy', 'Neutral', 'Sad', 'Surprised']
        return model, music_df, labels
    except Exception as e:
        st.error(f"Error loading resources: {e}")
        return None, None, None

emotion_model, music_df, emotion_labels = load_resources()

# --- HELPER FUNCTIONS ---
def recommend_music(detected_emotion):
    mood_mapping = {
        'Happy': 'Happy', 'Sad': 'Sad', 'Angry': 'Neutral',
        'Disgusted': 'Neutral', 'Fearful': 'Neutral', 
        'Surprised': 'Happy', 'Neutral': 'Neutral'
    }
    target_mood = mood_mapping.get(detected_emotion, 'Neutral')
    relevant_songs = music_df[music_df['mood'] == target_mood]
    
    if not relevant_songs.empty:
        return target_mood, relevant_songs.sample(n=min(5, len(relevant_songs)))
    return target_mood, None

def generate_comforting_message(emotion):
    # Simple hardcoded messages for demo; replace with LLM if needed
    messages = {
        'Happy': "You're radiating joy! Keep that positive energy flowing.",
        'Sad': "It's okay to feel sad sometimes. Remember, brighter days are ahead.",
        'Angry': "Take a deep breath. Channel that energy into something productive.",
        'Disgusted': "Not feeling great? Let's find something to lift your spirits.",
        'Fearful': "Fear is just a feeling. You're stronger than you think.",
        'Surprised': "Wow, what a surprise! Embrace the unexpected.",
        'Neutral': "Feeling balanced? That's a great place to be."
    }
    return messages.get(emotion, "Whatever you're feeling, you're not alone.")

# --- SESSION STATE ---
if 'emotion' not in st.session_state:
    st.session_state.emotion = None
if 'confidence' not in st.session_state:
    st.session_state.confidence = None
if 'message' not in st.session_state:
    st.session_state.message = None
if 'songs' not in st.session_state:
    st.session_state.songs = None
if 'music_mood' not in st.session_state:
    st.session_state.music_mood = None

# --- MAIN UI LAYOUT ---
col1, col2 = st.columns([1, 2])

with col1:
    st.markdown("### 📸 Capture Your Mood")
    input_method = st.radio("Choose input method:", ("Camera", "Upload Image"))
    
    if input_method == "Camera":
        img_file = st.camera_input("Take a photo")
    else:
        img_file = st.file_uploader("Upload an image", type=["jpg", "png", "jpeg"])
    
    if st.button("Analyze Emotion", key="analyze"):
        if img_file is not None and emotion_model is not None:
            with st.spinner("Analyzing your emotion..."):
                progress_bar = st.progress(0)
                time.sleep(0.5)
                progress_bar.progress(25)
                
                file_bytes = np.asarray(bytearray(img_file.read()), dtype=np.uint8)
                frame = cv2.imdecode(file_bytes, 1)
                progress_bar.progress(50)
                
                # Face Detection
                gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)
                progress_bar.progress(75)
                
                if len(faces) > 0:
                    x, y, w, h = faces[0]
                    face_roi = gray_frame[y:y+h, x:x+w]
                    
                    # Preprocessing
                    roi = cv2.resize(face_roi, (48, 48))
                    roi = roi.astype('float') / 255.0
                    roi = img_to_array(roi)
                    roi = np.expand_dims(roi, axis=0)
                    
                    # Prediction
                    prediction = emotion_model.predict(roi, verbose=0)[0]
                    label = emotion_labels[prediction.argmax()]
                    confidence = np.max(prediction)
                    
                    # Store in session
                    st.session_state.emotion = label
                    st.session_state.confidence = confidence
                    st.session_state.message = generate_comforting_message(label)
                    st.session_state.music_mood, st.session_state.songs = recommend_music(label)
                    
                    progress_bar.progress(100)
                    st.success("Analysis complete!")
                else:
                    st.error("No face detected! Try a clearer photo with good lighting.")
                    progress_bar.empty()
        else:
            st.warning("Please provide an image and ensure resources are loaded.")

with col2:
    st.markdown("### 🎧 Your Mood Results")
    
    if st.session_state.emotion:
        st.markdown(f'<div class="emotion-card"><h3>Detected Emotion: {st.session_state.emotion}</h3><p>Confidence: {st.session_state.confidence*100:.1f}%</p></div>', unsafe_allow_html=True)
        
        st.markdown("#### 💬 Comforting Message")
        st.info(st.session_state.message)
        
        st.markdown(f"#### 🎶 Recommended {st.session_state.music_mood} Songs")
        
        if st.session_state.songs is not None:
            for idx, row in st.session_state.songs.iterrows():
                with st.expander(f"🎵 {row['name']} - {row['artist']}", expanded=False):
                    st.markdown('<div class="song-card">', unsafe_allow_html=True)
                    if 'spotify_id' in row:
                        st.link_button("Listen on Spotify", f"https://open.spotify.com/track/{row['spotify_id']}")
                    st.markdown('</div>', unsafe_allow_html=True)
        else:
            st.warning("No songs available for this mood.")
    else:
        st.info("Take a photo or upload an image to see your mood analysis and recommendations!")

# --- FOOTER ---
st.markdown("---")
st.markdown("**MoodMate AI** - Powered by AI for emotional well-being. 🎉")
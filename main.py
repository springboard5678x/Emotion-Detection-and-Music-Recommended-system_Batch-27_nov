import streamlit as st
import cv2
import numpy as np

from emotion_detect import detect_emotion_from_image
from music import get_recommendations 

# Page configuration
st.set_page_config(
    page_title="AI MOODMATE",
    page_icon="🎵",
    layout="wide"
)

# Custom CSS for attractive UI
st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    }
    
    .main-header {
        background: linear-gradient(90deg, #ff6b9d 0%, #c06c84 50%, #6c5b7b 100%);
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 30px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .main-title {
        color: white;
        font-size: 42px;
        font-weight: bold;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .camera-container {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 25px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    
    .results-container {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 25px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        margin-top: 20px;
    }
    
    .emotion-badge {
        background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-size: 28px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    .song-item {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
        margin: 15px 0;
        border-left: 4px solid #ff6b9d;
        color: white;
        font-size: 16px;
        transition: all 0.3s ease;
    }
    
    .song-item:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(5px);
    }
    
    .spotify-embed {
        margin: 15px 0;
        border-radius: 12px;
        overflow: hidden;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 20px;
        font-weight: bold;
        padding: 15px 40px;
        border-radius: 50px;
        border: none;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    
    .section-header {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 15px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .stSuccess, .stWarning {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 15px;
        color: white;
    }
    
    [data-testid="stCameraInput"] {
        border-radius: 15px;
        overflow: hidden;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="main-header">
    <h1 class="main-title">🎵 AI MOODMATE</h1>
    <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin-top: 10px; margin-bottom: 0; text-align: left;">
        ✨ Feel the vibe, find your song
    </p>
</div>
""", unsafe_allow_html=True)

# Create two columns for layout
col1, col2 = st.columns([1, 1], gap="large")

with col1:
    st.markdown('<p class="section-header">Camera</p>', unsafe_allow_html=True)
    st.markdown('<div class="camera-container">', unsafe_allow_html=True)
    
    img = st.camera_input("Capture your emotion", label_visibility="collapsed")

    st.markdown('</div>', unsafe_allow_html=True)
    
    if img is not None:
        with st.spinner('🔍 Analyzing your emotion...'):
            bytes_data = img.getvalue()
            np_img = np.frombuffer(bytes_data, np.uint8)
            frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
            
            emotion = detect_emotion_from_image(frame)
            
            st.session_state['emotion'] = emotion
            st.session_state['songs'] = get_recommendations(emotion)

with col2:
    st.markdown('<p class="section-header">Songs:</p>', unsafe_allow_html=True)
    
    if 'emotion' in st.session_state:
        emotion = st.session_state['emotion']
        
        # Display detected emotion
        st.markdown(f"""
        <div style="text-align: center;">
            <p style="color: white; font-size: 18px; margin-bottom: 10px;">Detected Emotion:</p>
            <div class="emotion-badge">
                {emotion}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Display recommended songs
        st.markdown('<p class="section-header">🎧 Recommended Songs</p>', unsafe_allow_html=True)
        
        songs = st.session_state.get('songs', [])
        
        if len(songs) == 0:
            st.warning("No songs found for this mood")
        else:
            for i, song_info in enumerate(songs, 1):
                # Display song name
                st.markdown(f"""
                <div class="song-item">
                    🎵 {song_info['name']}
                </div>
                """, unsafe_allow_html=True)
                
                # Embed Spotify player using track_id
                track_id = song_info['track_id']
                
                # Spotify embed iframe
                st.markdown(f"""
                <div class="spotify-embed">
                    <iframe style="border-radius:12px" 
                            src="https://open.spotify.com/embed/track/{track_id}?utm_source=generator" 
                            width="100%" 
                            height="152" 
                            frameBorder="0" 
                            allowfullscreen="" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy">
                    </iframe>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div style="text-align: center; padding: 40px; color: white;">
            <p style="font-size: 20px; opacity: 0.7;">
                📷 Capture your photo to get personalized music recommendations!
            </p>
        </div>
        """, unsafe_allow_html=True)
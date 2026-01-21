# ================================
# IMPORTS
# ================================
import streamlit as st
import numpy as np
import pandas as pd
import scipy.sparse
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from PIL import Image
import tensorflow as tf
import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import sqlite3, hashlib
import json
from deepface import DeepFace

# ================================
# PAGE CONFIG
# ================================
st.set_page_config(
    page_title="Emotion Based Music Recommendation",
    page_icon="🎧",
    layout="wide"
)

# ================================
# FLOATING MUSIC NOTES (ENHANCED WITH TOGGLE)
# ================================
animations_class = "animated" if st.session_state.get("animations_enabled", True) else ""
st.markdown(f"""
<div class="music-notes {animations_class}">
    <span>🎵</span><span>🎶</span><span>🎼</span><span>🎧</span><span>🎷</span>
    <span>🎸</span><span>🎹</span><span>🎺</span><span>🎻</span><span>🥁</span>
</div>
""", unsafe_allow_html=True)

# ================================
# GLOBAL CSS / BACKGROUND (ENHANCED)
# ================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');

* {
    font-family: 'Poppins', sans-serif;
}

[data-testid="stAppViewContainer"] {
    background-image: url("assets/background.jpg");
    background-size: cover;
    background-attachment: fixed;
    background-position: center;
}

[data-testid="stAppViewContainer"]::before {
    content:"";
    position:fixed;
    inset:0;
    background: linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 50%, rgba(15,23,42,0.95) 100%);
    z-index:-1;
    transition: background 0.5s ease;
}

/* Light Mode Styles */
.light-mode [data-testid="stAppViewContainer"]::before {
    background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 50%, rgba(255,255,255,0.98) 100%) !important;
}

.light-mode {
    --bg-color: #ffffff;
    --text-color: #1e293b;
    --card-bg: rgba(255,255,255,0.9);
    --border-color: rgba(148,163,184,0.3);
}

/* Ensure background color change is visible */
[data-testid="stAppViewContainer"] {
    position: relative;
}

[data-testid="stAppViewContainer"]::before {
    z-index: -1 !important;
    pointer-events: none;
}

/* Enhanced Floating Music Notes */
.music-notes span{
    position:fixed;
    bottom:-40px;
    font-size:28px;
    opacity:.7;
    filter: drop-shadow(0 0 8px rgba(56,189,248,0.6));
    transition: all 0.3s ease;
}

.music-notes.animated span{
    animation:floatUp 12s linear infinite;
}

.music-notes span:hover {
    transform: scale(1.3);
    opacity: 1;
}

.music-notes span:nth-child(1){left:5%; animation-delay:0s;}
.music-notes span:nth-child(2){left:15%; animation-delay:1s;}
.music-notes span:nth-child(3){left:25%; animation-delay:2s;}
.music-notes span:nth-child(4){left:35%; animation-delay:3s;}
.music-notes span:nth-child(5){left:45%; animation-delay:4s;}
.music-notes span:nth-child(6){left:55%; animation-delay:5s;}
.music-notes span:nth-child(7){left:65%; animation-delay:6s;}
.music-notes span:nth-child(8){left:75%; animation-delay:7s;}
.music-notes span:nth-child(9){left:85%; animation-delay:8s;}
.music-notes span:nth-child(10){left:95%; animation-delay:9s;}

@keyframes floatUp{
    0%{transform:translateY(0) rotate(0deg);opacity:0}
    10%{opacity:.7}
    50%{transform:translateY(-50vh) rotate(180deg);opacity:.7}
    100%{transform:translateY(-110vh) rotate(360deg);opacity:0}
}

/* Glassmorphism Cards */
.card{
    background: linear-gradient(145deg, rgba(30,41,59,0.85), rgba(2,6,23,0.9));
    backdrop-filter: blur(10px);
    padding:28px;
    border-radius:24px;
    margin-bottom:24px;
    border: 1px solid rgba(56,189,248,0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3), 
                0 0 0 1px rgba(56,189,248,0.1) inset,
                0 4px 16px rgba(56,189,248,0.1);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4), 
                0 0 0 1px rgba(56,189,248,0.3) inset,
                0 8px 24px rgba(56,189,248,0.2);
}

/* Enhanced Song Cards */
.song{
    background: linear-gradient(135deg, rgba(2,6,23,0.95), rgba(15,23,42,0.9));
    padding:20px;
    border-radius:18px;
    margin-bottom:16px;
    border: 1px solid rgba(56,189,248,0.15);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.song::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.1), transparent);
    transition: left 0.5s ease;
}

.song:hover::before {
    left: 100%;
}

.song:hover {
    transform: translateX(8px) scale(1.02);
    border-color: rgba(56,189,248,0.4);
    box-shadow: 0 8px 24px rgba(56,189,248,0.3), 
                0 0 20px rgba(56,189,248,0.1);
}

/* Enhanced Spotify Button */
.spotify{
    background: linear-gradient(135deg, #1DB954 0%, #1ed760 50%, #1DB954 100%);
    background-size: 200% 200%;
    color: white;
    padding:12px 24px;
    border-radius:30px;
    font-weight:600;
    text-decoration:none;
    display: inline-block;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(29,185,84,0.4);
    animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.spotify:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(29,185,84,0.6);
    color: white;
    text-decoration: none;
}

.spotify:active {
    transform: translateY(0) scale(1);
}

/* Enhanced Music Icon */
.music-icon{
    filter: drop-shadow(0 0 30px rgba(56,189,248,0.8)) 
            drop-shadow(0 0 60px rgba(56,189,248,0.4));
    animation: pulseGlow 2s ease-in-out infinite;
    transition: transform 0.3s ease;
}

.music-icon:hover {
    transform: rotate(15deg) scale(1.1);
}

@keyframes pulseGlow {
    0%, 100% { filter: drop-shadow(0 0 30px rgba(56,189,248,0.8)) 
                       drop-shadow(0 0 60px rgba(56,189,248,0.4)); }
    50% { filter: drop-shadow(0 0 40px rgba(56,189,248,1)) 
                 drop-shadow(0 0 80px rgba(56,189,248,0.6)); }
}

/* Enhanced Input Fields */
.stTextInput>div>div>input,
.stTextArea>div>div>textarea {
    background: rgba(15,23,42,0.7) !important;
    border: 2px solid rgba(56,189,248,0.3) !important;
    border-radius: 12px !important;
    color: #e5e7eb !important;
    padding: 12px !important;
    transition: all 0.3s ease !important;
}

.stTextInput>div>div>input:focus,
.stTextArea>div>div>textarea:focus {
    border-color: rgba(56,189,248,0.8) !important;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.2) !important;
    outline: none !important;
}

/* Enhanced Buttons */
.stButton>button {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 12px rgba(59,130,246,0.4) !important;
}

.stButton>button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(59,130,246,0.6) !important;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
}

/* Enhanced Sidebar */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%) !important;
    border-right: 2px solid rgba(56,189,248,0.2) !important;
}

[data-testid="stSidebar"] .stRadio>div {
    background: rgba(15,23,42,0.5) !important;
    border-radius: 12px !important;
    padding: 8px !important;
}

[data-testid="stSidebar"] label {
    color: #e5e7eb !important;
    font-weight: 500 !important;
}

/* Enhanced Info Boxes */
.stAlert {
    background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.15)) !important;
    border: 1px solid rgba(59,130,246,0.3) !important;
    border-radius: 16px !important;
    backdrop-filter: blur(10px) !important;
}

/* Enhanced Progress Bar */
.stProgress>div>div>div {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899) !important;
    background-size: 200% 100% !important;
    animation: progressFlow 2s linear infinite !important;
}

@keyframes progressFlow {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
}

/* Enhanced Charts */
[data-testid="stBarChart"] {
    border-radius: 16px !important;
    overflow: hidden !important;
}

/* Enhanced File Uploader */
[data-testid="stFileUploader"] {
    background: rgba(15,23,42,0.7) !important;
    border: 2px dashed rgba(56,189,248,0.3) !important;
    border-radius: 16px !important;
    padding: 20px !important;
    transition: all 0.3s ease !important;
}

[data-testid="stFileUploader"]:hover {
    border-color: rgba(56,189,248,0.6) !important;
    background: rgba(15,23,42,0.85) !important;
}

/* Enhanced Camera Input */
[data-testid="stCameraInput"] {
    border-radius: 16px !important;
    overflow: hidden !important;
    border: 2px solid rgba(56,189,248,0.3) !important;
}

/* Enhanced Radio Buttons - Amazing Sidebar Navigation */
[data-testid="stSidebar"] .stRadio>div {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    background: transparent !important;
    padding: 0 !important;
}

[data-testid="stSidebar"] .stRadio>div>label {
    padding: 16px 20px !important;
    border-radius: 16px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    margin: 0 !important;
    background: rgba(15,23,42,0.6) !important;
    border: 2px solid transparent !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    font-weight: 600 !important;
    font-size: 15px !important;
    color: #94a3b8 !important;
    position: relative !important;
    overflow: hidden !important;
}

[data-testid="stSidebar"] .stRadio>div>label::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #38bdf8, #8b5cf6);
    transform: scaleY(0);
    transition: transform 0.3s ease;
}

[data-testid="stSidebar"] .stRadio>div>label:hover {
    background: linear-gradient(135deg, rgba(56,189,248,0.15), rgba(139,92,246,0.15)) !important;
    border-color: rgba(56,189,248,0.4) !important;
    transform: translateX(8px) !important;
    color: #e5e7eb !important;
    box-shadow: 0 4px 16px rgba(56,189,248,0.2) !important;
}

[data-testid="stSidebar"] .stRadio>div>label:hover::before {
    transform: scaleY(1);
}

[data-testid="stSidebar"] .stRadio>div>label[data-baseweb="radio"] {
    background: rgba(15,23,42,0.5) !important;
}

[data-testid="stSidebar"] .stRadio input[type="radio"]:checked + label {
    background: linear-gradient(135deg, rgba(56,189,248,0.3), rgba(139,92,246,0.3)) !important;
    border-color: rgba(56,189,248,0.6) !important;
    color: #38bdf8 !important;
    box-shadow: 0 6px 20px rgba(56,189,248,0.3) !important;
    transform: translateX(8px) !important;
}

[data-testid="stSidebar"] .stRadio input[type="radio"]:checked + label::before {
    transform: scaleY(1);
}

/* Enhanced Success/Error Messages */
.stSuccess {
    background: linear-gradient(135deg, rgba(34,211,153,0.2), rgba(16,185,129,0.15)) !important;
    border: 1px solid rgba(34,211,153,0.4) !important;
    border-radius: 12px !important;
    color: #34d399 !important;
}

.stError {
    background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15)) !important;
    border: 1px solid rgba(239,68,68,0.4) !important;
    border-radius: 12px !important;
    color: #ef4444 !important;
}

.stWarning {
    background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15)) !important;
    border: 1px solid rgba(251,191,36,0.4) !important;
    border-radius: 12px !important;
    color: #fbbf24 !important;
}

/* Enhanced Caption */
.stCaption {
    color: #94a3b8 !important;
    font-size: 14px !important;
}

/* Smooth Transitions */
* {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

::-webkit-scrollbar-track {
    background: rgba(15,23,42,0.5);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #3b82f6, #8b5cf6);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #2563eb, #7c3aed);
}

/* Emotion Badge Styles */
.emotion-badge {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    animation: emotionPulse 2s ease-in-out infinite;
}

@keyframes emotionPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Welcome Card Enhancement */
.welcome-card {
    background: linear-gradient(135deg, rgba(56,189,248,0.1), rgba(139,92,246,0.1));
    border: 2px solid rgba(56,189,248,0.3);
}

/* Feature Cards */
.feature-card {
    background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9));
    padding: 32px 24px;
    border-radius: 24px;
    border: 2px solid rgba(56,189,248,0.2);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.feature-card:hover::before {
    opacity: 1;
}

.feature-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(56,189,248,0.6);
    box-shadow: 0 16px 40px rgba(56,189,248,0.3), 
                0 0 30px rgba(56,189,248,0.1);
}

.feature-card:active {
    transform: translateY(-4px) scale(1.01);
}
</style>
""", unsafe_allow_html=True)

# ================================
# HEADER (ENHANCED)
# ================================
st.markdown("""
<div style="display:flex;justify-content:center;align-items:center;gap:24px;margin-bottom:16px;">
    <img class="music-icon"
         src="https://cdn-icons-png.flaticon.com/512/727/727245.png"
         width="100"/>
    <div>
        <h1 style="background: linear-gradient(135deg, #38bdf8 0%, #8b5cf6 50%, #ec4899 100%);
                   -webkit-background-clip: text;
                   -webkit-text-fill-color: transparent;
                   background-clip: text;
                   font-size:48px;
                   font-weight:800;
                   margin:0;
                   text-align:center;
                   letter-spacing:-1px;">
            Emotion Based Music Recommendation
        </h1>
    </div>
</div>
<p style="text-align:center;
          color:#cbd5f5;
          font-size:18px;
          margin-top:-8px;
          font-weight:400;
          text-shadow:0 2px 8px rgba(0,0,0,0.3);">
    🎵 AI that understands your emotions & plays your vibe 🎶
</p>
""", unsafe_allow_html=True)
# ================================
# 🎨 APPLY MOOD THEME (ENHANCED - MUST BE ABOVE OUTPUT)
# ================================
def apply_mood_theme(emotion):
    colors = {
        "happy": "#facc15",
        "sad": "#60a5fa",
        "angry": "#ef4444",
        "calm": "#34d399",
        "love": "#f472b6",
        "neutral": "#94a3b8",
        "disgust": "#7c3aed"
    }
    
    # More visible gradients for dark mode - INCREASED OPACITY
    gradients_dark = {
        "happy": "linear-gradient(135deg, rgba(250,204,21,0.55) 0%, rgba(251,191,36,0.4) 30%, rgba(250,204,21,0.3) 60%, rgba(15,23,42,0.85) 100%)",
        "sad": "linear-gradient(135deg, rgba(96,165,250,0.55) 0%, rgba(59,130,246,0.4) 30%, rgba(96,165,250,0.3) 60%, rgba(15,23,42,0.85) 100%)",
        "angry": "linear-gradient(135deg, rgba(239,68,68,0.55) 0%, rgba(220,38,38,0.4) 30%, rgba(239,68,68,0.3) 60%, rgba(15,23,42,0.85) 100%)",
        "calm": "linear-gradient(135deg, rgba(52,211,153,0.55) 0%, rgba(16,185,129,0.4) 30%, rgba(52,211,153,0.3) 60%, rgba(15,23,42,0.85) 100%)",
        "love": "linear-gradient(135deg, rgba(244,114,182,0.55) 0%, rgba(236,72,153,0.4) 30%, rgba(244,114,182,0.3) 60%, rgba(15,23,42,0.85) 100%)",
        "neutral": "linear-gradient(135deg, rgba(148,163,184,0.55) 0%, rgba(100,116,139,0.4) 30%, rgba(148,163,184,0.3) 60%, rgba(15,23,42,0.85) 100%)",
        "disgust": "linear-gradient(135deg, rgba(124,58,237,0.55) 0%, rgba(109,40,217,0.4) 30%, rgba(124,58,237,0.3) 60%, rgba(15,23,42,0.85) 100%)"
    }
    
    # Light mode gradients - INCREASED OPACITY
    gradients_light = {
        "happy": "linear-gradient(135deg, rgba(250,204,21,0.45) 0%, rgba(251,191,36,0.3) 30%, rgba(250,204,21,0.2) 60%, rgba(255,255,255,0.85) 100%)",
        "sad": "linear-gradient(135deg, rgba(96,165,250,0.45) 0%, rgba(59,130,246,0.3) 30%, rgba(96,165,250,0.2) 60%, rgba(255,255,255,0.85) 100%)",
        "angry": "linear-gradient(135deg, rgba(239,68,68,0.45) 0%, rgba(220,38,38,0.3) 30%, rgba(239,68,68,0.2) 60%, rgba(255,255,255,0.85) 100%)",
        "calm": "linear-gradient(135deg, rgba(52,211,153,0.45) 0%, rgba(16,185,129,0.3) 30%, rgba(52,211,153,0.2) 60%, rgba(255,255,255,0.85) 100%)",
        "love": "linear-gradient(135deg, rgba(244,114,182,0.45) 0%, rgba(236,72,153,0.3) 30%, rgba(244,114,182,0.2) 60%, rgba(255,255,255,0.85) 100%)",
        "neutral": "linear-gradient(135deg, rgba(148,163,184,0.45) 0%, rgba(100,116,139,0.3) 30%, rgba(148,163,184,0.2) 60%, rgba(255,255,255,0.85) 100%)",
        "disgust": "linear-gradient(135deg, rgba(124,58,237,0.45) 0%, rgba(109,40,217,0.3) 30%, rgba(124,58,237,0.2) 60%, rgba(255,255,255,0.85) 100%)"
    }

    # Get color for border glow effect
    color = colors.get(emotion, "#38bdf8")
    
    is_dark = st.session_state.get("dark_mode", True)
    gradients = gradients_dark if is_dark else gradients_light
    gradient = gradients.get(emotion, gradients_dark.get(emotion, "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))"))

    # Store emotion in session state for persistent background
    st.session_state.current_emotion = emotion
    
    # Add data attribute to mark emotion is set
    st.markdown(f"""
    <script>
    document.querySelector('[data-testid="stAppViewContainer"]')?.setAttribute('data-emotion-set', '{emotion}');
    </script>
    """, unsafe_allow_html=True)
    
    st.markdown(f"""
    <style>
    /* Emotion-based background - MUST override dark/light mode */
    [data-testid="stAppViewContainer"]::before {{
        background: {gradient} !important;
        opacity: 1 !important;
        animation: moodTransition 1.2s ease-in-out !important;
        z-index: -1 !important;
    }}
    
    /* Ensure emotion background overrides all other backgrounds with maximum specificity */
    html body div[data-testid="stAppViewContainer"]::before {{
        background: {gradient} !important;
    }}
    
    /* Override any inline or other styles */
    [data-testid="stAppViewContainer"][data-emotion-set]::before {{
        background: {gradient} !important;
    }}
    
    @keyframes moodTransition {{
        0% {{ 
            opacity: 0.5; 
            transform: scale(1.08);
            filter: blur(3px);
        }}
        50% {{
            opacity: 0.95;
            transform: scale(1.02);
        }}
        100% {{ 
            opacity: 1; 
            transform: scale(1);
            filter: blur(0px);
        }}
    }}
    
    /* Add a subtle border glow effect */
    [data-testid="stAppViewContainer"] {{
        position: relative !important;
    }}
    
    [data-testid="stAppViewContainer"]::after {{
        content: '' !important;
        position: fixed !important;
        inset: 0 !important;
        border: 4px solid {color}44 !important;
        pointer-events: none !important;
        z-index: -1 !important;
        animation: borderGlow 3s ease-in-out infinite !important;
        border-radius: 0 !important;
    }}
    
    @keyframes borderGlow {{
        0%, 100% {{ 
            border-color: {color}44;
            box-shadow: 0 0 20px {color}22;
        }}
        50% {{ 
            border-color: {color}88;
            box-shadow: 0 0 40px {color}44;
        }}
    }}
    
    /* Make emotion color more visible */
    body {{
        transition: background-color 0.5s ease !important;
    }}
    </style>
    """, unsafe_allow_html=True)

# ================================
# DATABASE
# ================================
def get_conn():
    return sqlite3.connect("users.db", check_same_thread=False)

def hash_pwd(p): 
    return hashlib.sha256(p.encode()).hexdigest()

def init_db():
    conn=get_conn(); c=conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY,password TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS history(username TEXT,emotion TEXT)")
    conn.commit(); conn.close()

init_db()

def signup(u,p):
    try:
        conn=get_conn(); c=conn.cursor()
        c.execute("INSERT INTO users VALUES (?,?)",(u,hash_pwd(p)))
        conn.commit(); conn.close()
        return True
    except:
        return False

def login(u,p):
    conn=get_conn(); c=conn.cursor()
    c.execute("SELECT * FROM users WHERE username=? AND password=?",(u,hash_pwd(p)))
    ok=c.fetchone() is not None
    conn.close()
    return ok

def save_emotion(u,e):
    conn=get_conn(); c=conn.cursor()
    c.execute("INSERT INTO history(username,emotion) VALUES (?,?)",(u,e))
    conn.commit(); conn.close()

# ================================
# LOGIN
# ================================
if "logged" not in st.session_state:
    st.session_state.logged=False
    st.session_state.user=None
    st.session_state.page="🏠 Home"
    st.session_state.animations_enabled=True
    st.session_state.dark_mode=True

if not st.session_state.logged:
    st.markdown("""
    <div class="card" style="max-width:500px;margin:40px auto;">
        <h2 style="text-align:center;
                   background: linear-gradient(135deg, #38bdf8, #8b5cf6);
                   -webkit-background-clip: text;
                   -webkit-text-fill-color: transparent;
                   background-clip: text;
                   font-size:32px;
                   margin-bottom:24px;">
            🔐 Welcome Back
        </h2>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        mode=st.radio("",["Login","Signup"],horizontal=True, label_visibility="collapsed")
        st.markdown("<br>", unsafe_allow_html=True)
        u=st.text_input("👤 Username", placeholder="Enter your username")
        p=st.text_input("🔒 Password",type="password", placeholder="Enter your password")
        st.markdown("<br>", unsafe_allow_html=True)

        if st.button(mode, use_container_width=True):
            if mode=="Signup":
                if signup(u,p):
                    st.success("🎉 Account created! Login now 😊")
                else:
                    st.error("❌ Username already exists")
            else:
                if login(u,p):
                    st.session_state.logged=True
                    st.session_state.user=u
                    st.rerun()
                else:
                    st.error("❌ Invalid username or password")
    st.stop()

# ================================
# SIDEBAR (AMAZINGLY ENHANCED)
# ================================
st.sidebar.markdown("""
<style>
.sidebar-user-card {
    background: linear-gradient(135deg, rgba(56,189,248,0.25), rgba(139,92,246,0.25));
    padding:20px;
    border-radius:20px;
    margin-bottom:24px;
    border:2px solid rgba(56,189,248,0.4);
    text-align:center;
    box-shadow: 0 8px 24px rgba(56,189,248,0.2);
    transition: all 0.3s ease;
}

.sidebar-user-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(56,189,248,0.3);
}

.nav-item {
    padding:16px 20px;
    margin:8px 0;
    border-radius:16px;
    background: rgba(15,23,42,0.5);
    border:2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    display:flex;
    align-items:center;
    gap:12px;
}

.nav-item:hover {
    background: linear-gradient(135deg, rgba(56,189,248,0.15), rgba(139,92,246,0.15));
    border-color: rgba(56,189,248,0.4);
    transform: translateX(8px);
    box-shadow: 0 4px 16px rgba(56,189,248,0.2);
}

.nav-item.active {
    background: linear-gradient(135deg, rgba(56,189,248,0.3), rgba(139,92,246,0.3));
    border-color: rgba(56,189,248,0.6);
    box-shadow: 0 6px 20px rgba(56,189,248,0.3);
}

.nav-icon {
    font-size:24px;
    width:32px;
    text-align:center;
}

.nav-text {
    color:#e5e7eb;
    font-weight:600;
    font-size:16px;
    flex:1;
}

.toggle-container {
    background: linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8));
    padding:20px;
    border-radius:16px;
    margin:24px 0;
    border:2px solid rgba(56,189,248,0.3);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
}

.toggle-container:hover {
    border-color: rgba(56,189,248,0.5);
    box-shadow: 0 6px 20px rgba(56,189,248,0.2);
}

.toggle-label {
    color:#e5e7eb;
    font-weight:600;
    font-size:15px;
    margin-bottom:12px;
    display:block;
    text-align:center;
}

/* Enhanced Toggle Switch */
.stCheckbox>label {
    color:#cbd5f5 !important;
    font-weight:500 !important;
}

[data-testid="stSidebar"] .stCheckbox {
    display:flex !important;
    justify-content:center !important;
    align-items:center !important;
    padding:8px !important;
}
</style>
""", unsafe_allow_html=True)

st.sidebar.markdown(f"""
<div class="sidebar-user-card">
    <div style="font-size:48px;margin-bottom:8px;">👤</div>
    <p style="margin:0;color:#38bdf8;font-weight:700;font-size:18px;">
        {st.session_state.user}
    </p>
    <p style="margin:4px 0 0 0;color:#94a3b8;font-size:12px;">
        Welcome back!
    </p>
</div>
""", unsafe_allow_html=True)

# Dark Mode Toggle
st.sidebar.markdown("<br>", unsafe_allow_html=True)
dark_mode = st.sidebar.toggle("🌙 Dark Mode", value=st.session_state.dark_mode, label_visibility="visible", key="dark_mode_toggle")
st.session_state.dark_mode = dark_mode

# Apply dark/light mode globally to ENTIRE webpage
if not st.session_state.dark_mode:
    st.markdown("""
    <style>
    /* ========== LIGHT MODE - FULL PAGE ========== */
    html {
        color-scheme: light !important;
    }
    
    body {
        background: #f8fafc !important;
        color: #1e293b !important;
    }
    
    /* Main container */
    [data-testid="stAppViewContainer"] {
        background-color: #f8fafc !important;
        background-image: url("assets/background.jpg") !important;
        background-size: cover !important;
        background-attachment: fixed !important;
        background-position: center !important;
    }
    
    [data-testid="stAppViewContainer"]::before {
        background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 50%, rgba(255,255,255,0.92) 100%) !important;
    }
    
    /* Sidebar - Light mode */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%) !important;
        border-right: 2px solid rgba(148,163,184,0.3) !important;
    }
    
    /* All text elements - Light mode */
    h1, h2, h3, h4, h5, h6, p, span, div, label, .stMarkdown, .stText {
        color: #1e293b !important;
    }
    
    /* Cards - Light mode */
    .card {
        background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9)) !important;
        border: 1px solid rgba(148,163,184,0.3) !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
    }
    
    /* Input fields - Light mode */
    .stTextInput>div>div>input,
    .stTextArea>div>div>textarea {
        background: rgba(255,255,255,0.9) !important;
        border: 2px solid rgba(148,163,184,0.4) !important;
        color: #1e293b !important;
    }
    
    /* Buttons - Light mode */
    .stButton>button {
        color: #1e293b !important;
    }
    
    /* Sidebar user card - Light mode */
    .sidebar-user-card {
        background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1)) !important;
        border: 2px solid rgba(59,130,246,0.3) !important;
    }
    
    /* Navigation title - Light mode */
    [data-testid="stSidebar"] h3 {
        color: #2563eb !important;
    }
    
    /* Navigation buttons - Light mode */
    [data-testid="stSidebar"] .stButton>button {
        background: linear-gradient(145deg, rgba(248,250,252,0.9), rgba(241,245,249,0.95)) !important;
        border: 2px solid rgba(148,163,184,0.3) !important;
        color: #475569 !important;
    }
    
    [data-testid="stSidebar"] .stButton>button[kind="primary"] {
        background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.15)) !important;
        border-color: rgba(59,130,246,0.5) !important;
        color: #2563eb !important;
    }
    
    /* Feature cards - Light mode */
    .feature-card {
        background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,250,252,0.85)) !important;
        border: 2px solid rgba(148,163,184,0.3) !important;
    }
    
    /* Song cards - Light mode */
    .song {
        background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9)) !important;
        border: 1px solid rgba(148,163,184,0.3) !important;
    }
    
    /* Info boxes - Light mode */
    .stAlert {
        background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.08)) !important;
        border: 1px solid rgba(59,130,246,0.3) !important;
    }
    </style>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <style>
    /* ========== DARK MODE - FULL PAGE ========== */
    html {
        color-scheme: dark !important;
    }
    
    body {
        background: #0f172a !important;
        color: #e5e7eb !important;
    }
    
    /* Main container - Dark mode */
    [data-testid="stAppViewContainer"] {
        background-color: #0f172a !important;
        background-image: url("assets/background.jpg") !important;
        background-size: cover !important;
        background-attachment: fixed !important;
        background-position: center !important;
    }
    
    /* Only apply dark mode background if no emotion is set */
    [data-testid="stAppViewContainer"]::before:not([data-emotion-set]) {
        background: linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 50%, rgba(15,23,42,0.95) 100%) !important;
    }
    
    /* Sidebar - Dark mode */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%) !important;
        border-right: 2px solid rgba(56,189,248,0.2) !important;
    }
    
    /* All text elements - Dark mode */
    h1, h2, h3, h4, h5, h6, p, span, div, label, .stMarkdown, .stText {
        color: #e5e7eb !important;
    }
    
    /* Cards - Dark mode */
    .card {
        background: linear-gradient(145deg, rgba(30,41,59,0.85), rgba(2,6,23,0.9)) !important;
        border: 1px solid rgba(56,189,248,0.2) !important;
    }
    
    /* Input fields - Dark mode */
    .stTextInput>div>div>input,
    .stTextArea>div>div>textarea {
        background: rgba(15,23,42,0.7) !important;
        border: 2px solid rgba(56,189,248,0.3) !important;
        color: #e5e7eb !important;
    }
    
    /* Buttons - Dark mode */
    .stButton>button {
        color: #ffffff !important;
    }
    </style>
    """, unsafe_allow_html=True)

st.sidebar.markdown("<br>", unsafe_allow_html=True)

# Navigation Title
st.sidebar.markdown("""
<div style="margin:16px 0 20px 0;">
    <h3 style="color:#38bdf8;font-size:22px;margin:0;text-align:center;font-weight:700;">
        🧭 Navigation
    </h3>
</div>
""", unsafe_allow_html=True)

# Add navigation CSS to global styles
st.markdown("""
<style>
/* Radio Button Navigation Styles - Global */
[data-testid="stSidebar"] .stRadio>div {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    background: transparent !important;
    padding: 0 !important;
}

[data-testid="stSidebar"] .stRadio>div>label {
    padding: 16px !important;
    border-radius: 14px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    margin: 6px 0 !important;
    background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9)) !important;
    border: 2px solid rgba(56,189,248,0.2) !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0 !important;
    font-weight: 600 !important;
    font-size: 32px !important;
    color: #cbd5f5 !important;
    position: relative !important;
    overflow: visible !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    min-height: 60px !important;
    width: 100% !important;
    visibility: visible !important;
    opacity: 1 !important;
}

[data-testid="stSidebar"] .stRadio>div>label::before {
    content: '' !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 4px !important;
    height: 100% !important;
    background: linear-gradient(180deg, #38bdf8, #8b5cf6) !important;
    transform: scaleY(0) !important;
    transition: transform 0.3s ease !important;
    border-radius: 14px 0 0 14px !important;
}

[data-testid="stSidebar"] .stRadio>div>label:hover {
    background: linear-gradient(135deg, rgba(56,189,248,0.2), rgba(139,92,246,0.15)) !important;
    border-color: rgba(56,189,248,0.5) !important;
    transform: translateX(6px) !important;
    color: #ffffff !important;
    box-shadow: 0 6px 20px rgba(56,189,248,0.3) !important;
}

[data-testid="stSidebar"] .stRadio>div>label:hover::before {
    transform: scaleY(1) !important;
}

[data-testid="stSidebar"] .stRadio input[type="radio"]:checked + label {
    background: linear-gradient(135deg, rgba(56,189,248,0.35), rgba(139,92,246,0.25)) !important;
    border-color: rgba(56,189,248,0.7) !important;
    color: #ffffff !important;
    box-shadow: 0 8px 24px rgba(56,189,248,0.4), inset 0 0 20px rgba(56,189,248,0.1) !important;
    transform: translateX(6px) !important;
    font-weight: 700 !important;
}

[data-testid="stSidebar"] .stRadio input[type="radio"]:checked + label::before {
    transform: scaleY(1) !important;
}

[data-testid="stSidebar"] .stRadio input[type="radio"]:checked + label:hover {
    background: linear-gradient(135deg, rgba(56,189,248,0.45), rgba(139,92,246,0.35)) !important;
    box-shadow: 0 10px 28px rgba(56,189,248,0.5), inset 0 0 25px rgba(56,189,248,0.15) !important;
}

/* Icon-only navigation - hide radio button circle, show only icon */
[data-testid="stSidebar"] .stRadio>div>label>div:first-child {
    display: none !important;
}

[data-testid="stSidebar"] .stRadio>div>label>div:nth-child(2) {
    font-size: 32px !important;
    line-height: 1 !important;
    margin: 0 !important;
    padding: 0 !important;
    text-align: center !important;
    width: 100% !important;
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
}

/* Ensure all radio buttons and items are visible */
[data-testid="stSidebar"] .stRadio>div {
    visibility: visible !important;
    display: flex !important;
    overflow: visible !important;
    max-height: none !important;
}

[data-testid="stSidebar"] .stRadio>div>label {
    visibility: visible !important;
    opacity: 1 !important;
    display: flex !important;
    height: auto !important;
    min-height: 60px !important;
}

/* Ensure sidebar can show all content */
[data-testid="stSidebar"] {
    overflow-y: auto !important;
    overflow-x: visible !important;
    max-height: 100vh !important;
}

/* Logout button visibility - ensure it's always visible */
[data-testid="stSidebar"] .stButton {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
    margin-top: 16px !important;
}

[data-testid="stSidebar"] .stButton>button {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
    width: 100% !important;
}
</style>
""", unsafe_allow_html=True)

# Navigation - Icons only (no text)
pages = ["🏠", "📝", "📷", "🎥"]
page_map = {
    "🏠": "🏠 Home",
    "📝": "📝 Text Emotion",
    "📷": "📷 Image Emotion",
    "🎥": "🎥 Webcam Emotion"
}
# Reverse mapping
reverse_map = {v: k for k, v in page_map.items()}

current_page_icon = reverse_map.get(st.session_state.page, "🏠")
current_index = 0
if current_page_icon in pages:
    current_index = pages.index(current_page_icon)

# Create navigation with radio buttons (icons only)
selected_icon = st.sidebar.radio(
    "Navigate to:",
    pages,
    index=current_index,
    key="nav_radio",
    label_visibility="collapsed"
)

# Map icon back to full page name
selected_page = page_map.get(selected_icon, "🏠 Home")

# Update session state when page changes
if selected_page != st.session_state.page:
    st.session_state.page = selected_page
    st.rerun()

page = st.session_state.page

# Spacing before logout
st.sidebar.markdown("<br>", unsafe_allow_html=True)

# Logout Button - Make sure it's visible
st.sidebar.markdown("""
<style>
[data-testid="stSidebar"] .stButton>button {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
}
</style>
""", unsafe_allow_html=True)

if st.sidebar.button("🚪 Logout", use_container_width=True, key="logout_btn"):
    st.session_state.logged=False
    st.session_state.user=None
    st.session_state.page="🏠 Home"
    st.rerun()

# ================================
# LOAD MUSIC DATA
# ================================
@st.cache_data
def load_music():
    return pd.read_csv("music_meta.csv"), scipy.sparse.load_npz("music_features.npz")

music, final_features = load_music()

# ================================
# RECOMMENDATION LOGIC (UNCHANGED)
# ================================
emotion_to_mood={
    "happy":["happy","uplifting","dance"],
    "sad":["sad","emotional"],
    "angry":["angry","heavy"],
    "calm":["calm","relax"],
    "love":["love","romantic"],
    "neutral":["chill"],
    "disgust":["dark"]
}

emotion_audio_profile={
    "happy":[0.8,0.7,0.8,0.2,0.7],
    "sad":[0.2,0.3,0.2,0.8,0.3],
    "angry":[0.3,0.9,0.6,0.1,0.8],
    "calm":[0.6,0.2,0.3,0.9,0.2],
    "love":[0.7,0.4,0.4,0.6,0.4],
    "neutral":[0.5]*5,
    "disgust":[0.2,0.6,0.3,0.1,0.5]
}

tfidf=TfidfVectorizer()
tfidf.fit(music["mood_text"].fillna(""))

def recommend_music(emotion):
    mood_vec=tfidf.transform([" ".join(emotion_to_mood[emotion])])
    audio_vec=np.array(emotion_audio_profile[emotion]).reshape(1,-1)
    sim=cosine_similarity(scipy.sparse.hstack([mood_vec,audio_vec]),final_features)
    idx=sim[0].argsort()[-5:]
    return music.iloc[idx][["name","artist","spotify_id"]]

# ================================
# LOAD MODELS (WITH CACHE AND ERROR HANDLING)
# ================================
@st.cache_resource
def load_image_model():
    try:
        return tf.keras.models.load_model("image_emotion_model.h5")
    except Exception as e:
        st.error(f"Error loading image model: {e}")
        return None

@st.cache_resource
def load_text_models():
    try:
        tokenizer = DistilBertTokenizerFast.from_pretrained("text_emotion_model")
        model = DistilBertForSequenceClassification.from_pretrained("text_emotion_model")
        model.eval()
        return tokenizer, model
    except Exception as e:
        st.error(f"Error loading text models: {e}")
        return None, None

image_model = load_image_model()
tokenizer, text_model = load_text_models()

with open("class_map.json") as f:
    idx_to_label={v:k for k,v in json.load(f).items()}

labels=["happy","sad","angry","fear","love","neutral","disgust"]

def normalize_emotion(e):
    return "calm" if e=="fear" else "happy" if e=="surprise" else e

def predict_text(t):
    if tokenizer is None or text_model is None:
        return "neutral", 0.5
    inp=tokenizer(t,return_tensors="pt",padding=True,truncation=True)
    with torch.no_grad():
        probs=torch.softmax(text_model(**inp).logits,1)
    conf,idx=torch.max(probs,1)
    return normalize_emotion(labels[idx.item()]),float(conf.item())

def predict_image(img):
    if image_model is None:
        st.warning("⚠️ Image model not loaded. Please check model files.")
        return "neutral", 0.5
    try:
        img=np.array(img.convert("L").resize((48,48)))/255
        pred=image_model.predict(img.reshape(1,48,48,1), verbose=0)[0]
        return normalize_emotion(idx_to_label[np.argmax(pred)]),float(np.max(pred))
    except Exception as e:
        st.error(f"Error predicting image emotion: {e}")
        return "neutral", 0.5

def predict_webcam(img):
    try:
        e=DeepFace.analyze(np.array(img),actions=["emotion"],enforce_detection=False)[0]["dominant_emotion"]
    except:
        e="neutral"
    return normalize_emotion(e),0.9

# ================================
# HOME PAGE (ENHANCED WITH IMAGE)
# ================================
if page=="🏠 Home":
    # Hero Image Section (Reduced Size)
    col_img1, col_img2, col_img3 = st.columns([1, 2, 1])
    with col_img2:
        st.markdown("""
        <div style="margin-bottom:32px;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.4);">
        """, unsafe_allow_html=True)
        
        try:
            st.image("assets/Background.jpg", use_container_width=True, caption="")
        except:
            st.markdown("""
            <div style="background:linear-gradient(135deg, rgba(56,189,248,0.3), rgba(139,92,246,0.3));
                        height:250px;
                        border-radius:24px;
                        display:flex;
                        align-items:center;
                        justify-content:center;">
                <h2 style="color:#e5e7eb;font-size:28px;">🎵 Your Musical Journey Starts Here 🎶</h2>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("</div>", unsafe_allow_html=True)
    
    # Simplified Welcome Section
    st.markdown("""
    <div style="text-align:center;margin:40px 0 32px 0;">
        <h2 style="background: linear-gradient(135deg, #38bdf8, #8b5cf6, #ec4899);
                   -webkit-background-clip: text;
                   -webkit-text-fill-color: transparent;
                   background-clip: text;
                   font-size:42px;
                   font-weight:800;
                   margin-bottom:16px;">
            👋 Welcome to Your Musical Journey
        </h2>
        <p style="font-size:18px;color:#cbd5f5;line-height:1.8;max-width:700px;margin:0 auto;">
            Discover music that perfectly matches your emotions! Choose how you want to express yourself.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Interactive Feature Cards
    st.markdown("""
    <div style="margin:40px 0;">
        <h3 style="text-align:center;color:#e5e7eb;font-size:28px;font-weight:600;margin-bottom:32px;">
            🎯 How Would You Like to Express Your Emotions?
        </h3>
    </div>
    """, unsafe_allow_html=True)

    c1,c2,c3=st.columns(3)
    
    with c1: 
        st.markdown("""
        <div class="feature-card" onclick="window.location.href='?nav=text'" style="cursor:pointer;">
            <div style="font-size:56px;text-align:center;margin-bottom:16px;filter:drop-shadow(0 4px 12px rgba(56,189,248,0.4));">📝</div>
            <h4 style="color:#38bdf8;text-align:center;margin-bottom:12px;font-size:22px;font-weight:700;">Text Emotion</h4>
            <p style="color:#cbd5f5;text-align:center;font-size:15px;margin:0;line-height:1.6;">
                Type how you feel and let AI understand your emotions
            </p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("📝 Try Text Emotion", key="home_text", use_container_width=True):
            st.session_state.page="📝 Text Emotion"
            st.rerun()
            
    with c2: 
        st.markdown("""
        <div class="feature-card" onclick="window.location.href='?nav=image'" style="cursor:pointer;">
            <div style="font-size:56px;text-align:center;margin-bottom:16px;filter:drop-shadow(0 4px 12px rgba(139,92,246,0.4));">📷</div>
            <h4 style="color:#8b5cf6;text-align:center;margin-bottom:12px;font-size:22px;font-weight:700;">Image Emotion</h4>
            <p style="color:#cbd5f5;text-align:center;font-size:15px;margin:0;line-height:1.6;">
                Upload a face image for instant emotion detection
            </p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("📷 Try Image Emotion", key="home_image", use_container_width=True):
            st.session_state.page="📷 Image Emotion"
            st.rerun()
            
    with c3: 
        st.markdown("""
        <div class="feature-card" onclick="window.location.href='?nav=webcam'" style="cursor:pointer;">
            <div style="font-size:56px;text-align:center;margin-bottom:16px;filter:drop-shadow(0 4px 12px rgba(236,72,153,0.4));">🎥</div>
            <h4 style="color:#ec4899;text-align:center;margin-bottom:12px;font-size:22px;font-weight:700;">Webcam Emotion</h4>
            <p style="color:#cbd5f5;text-align:center;font-size:15px;margin:0;line-height:1.6;">
                Capture live emotions from your webcam feed
            </p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("🎥 Try Webcam Emotion", key="home_webcam", use_container_width=True):
            st.session_state.page="🎥 Webcam Emotion"
            st.rerun()

    # Quick Info Section
    st.markdown("<br><br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="card" style="background:linear-gradient(135deg, rgba(56,189,248,0.1), rgba(139,92,246,0.1));
                            border:2px solid rgba(56,189,248,0.3);
                            text-align:center;
                            margin-top:40px;">
        <h3 style="color:#38bdf8;font-size:24px;margin-bottom:12px;">✨ How It Works</h3>
        <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:24px;margin-top:24px;">
            <div style="flex:1;min-width:150px;">
                <div style="font-size:36px;margin-bottom:8px;">1️⃣</div>
                <p style="color:#cbd5f5;font-size:14px;margin:0;">Detect Emotion</p>
            </div>
            <div style="flex:1;min-width:150px;">
                <div style="font-size:36px;margin-bottom:8px;">2️⃣</div>
                <p style="color:#cbd5f5;font-size:14px;margin:0;">Analyze Mood</p>
            </div>
            <div style="flex:1;min-width:150px;">
                <div style="font-size:36px;margin-bottom:8px;">3️⃣</div>
                <p style="color:#cbd5f5;font-size:14px;margin:0;">Get Music</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.stop()

# ================================
# EMOTION PAGES (ENHANCED)
# ================================
emotion=None; confidence=None

if page=="📝 Text Emotion":
    st.markdown("""
    <div class="card">
        <h2 style="color:#38bdf8;font-size:28px;margin-bottom:12px;">
            📝 Text Emotion Detection
        </h2>
        <p style="color:#cbd5f5;font-size:16px;">
            Share your thoughts, feelings, or describe your current mood. Our AI will analyze 
            the emotional tone and recommend music that matches your vibe.
        </p>
    </div>
    """, unsafe_allow_html=True)
    text=st.text_area("💭 Enter how you feel", placeholder="E.g., I'm feeling really happy today! or I had a rough day and feel sad...", height=120)
    if st.button("✨ Analyze Emotion", use_container_width=True):
        if text.strip():
            emotion,confidence=predict_text(text)
        else:
            st.warning("⚠️ Please enter some text to analyze!")

if page=="📷 Image Emotion":
    st.markdown("""
    <div class="card">
        <h2 style="color:#8b5cf6;font-size:28px;margin-bottom:12px;">
            📷 Image Emotion Detection
        </h2>
        <p style="color:#cbd5f5;font-size:16px;">
            Upload a clear face image (JPG or PNG). Our CNN model will detect emotions 
            from facial expressions and suggest matching music.
        </p>
    </div>
    """, unsafe_allow_html=True)
    f=st.file_uploader("📸 Upload face image",["jpg","png"], help="Upload a clear image with a visible face")
    if f:
        st.image(f, caption="Uploaded Image", width=300)
    if f and st.button("✨ Analyze Emotion", use_container_width=True):
        emotion,confidence=predict_image(Image.open(f))

if page=="🎥 Webcam Emotion":
    st.markdown("""
    <div class="card">
        <h2 style="color:#ec4899;font-size:28px;margin-bottom:12px;">
            🎥 Webcam Emotion Detection
        </h2>
        <p style="color:#cbd5f5;font-size:16px;">
            Allow camera access and capture your face in real-time. Our DeepFace model 
            will detect your current emotion and recommend music instantly.
        </p>
    </div>
    """, unsafe_allow_html=True)
    cam=st.camera_input("📹 Capture your face", help="Position your face in the frame and click capture")
    if cam:
        st.image(cam, caption="Captured Image", width=300)
    if cam and st.button("✨ Analyze Emotion", use_container_width=True):
        emotion,confidence=predict_webcam(Image.open(cam))
# ================================
# 💬 EMOTION QUOTES (GLOBAL)
# ================================
emotion_quotes = {
    "happy": "✨ Let the rhythm match your smile!",
    "sad": "🌧️ Music understands what words can’t.",
    "angry": "🔥 Channel the fire into sound.",
    "calm": "🌿 Breathe in. Let the melody flow.",
    "love": "❤️ Feel it. Play it. Live it.",
    "neutral": "🎧 Discover something new today.",
    "disgust": "🖤 Music heals even the darkest moods."
}

# ================================
# 🧠 WHY THESE SONGS (GLOBAL)
# ================================
why_song = {
    "happy": "High-energy, uplifting songs amplify joy.",
    "sad": "Emotional tracks provide comfort and healing.",
    "angry": "Power beats help release stress.",
    "calm": "Soft melodies relax the mind.",
    "love": "Romantic tones enhance connection.",
    "neutral": "Balanced tracks keep mood steady.",
    "disgust": "Dark or alternative sounds match complexity."
}


# ================================
# OUTPUT
# ================================
# Apply background color even if no new emotion detected (for page refresh)
if "current_emotion" in st.session_state and not emotion:
    apply_mood_theme(st.session_state.current_emotion)

if emotion:
    emotion = emotion.strip().lower()
    save_emotion(st.session_state.user, emotion)

    # ✅ APPLY COLOR THEME
    apply_mood_theme(emotion)

    # ✅ EMOTION TITLE (ENHANCED)
    emotion_colors = {
        "happy": "#facc15",
        "sad": "#60a5fa",
        "angry": "#ef4444",
        "calm": "#34d399",
        "love": "#f472b6",
        "neutral": "#94a3b8",
        "disgust": "#7c3aed"
    }
    emoji_map = {
        "happy": "😊",
        "sad": "😢",
        "angry": "😠",
        "calm": "😌",
        "love": "❤️",
        "neutral": "😐",
        "disgust": "🤢"
    }
    emoji = emoji_map.get(emotion, "😊")
    color = emotion_colors.get(emotion, "#38bdf8")
    
    st.markdown(f"""
    <div style="text-align:center;margin:32px 0;">
        <div class="emotion-badge" style="background: linear-gradient(135deg, {color}22, {color}44);
                                          border: 2px solid {color}66;
                                          color: {color};
                                          display:inline-block;
                                          padding:20px 40px;">
            <div style="font-size:64px;margin-bottom:8px;">{emoji}</div>
            <div style="font-size:32px;font-weight:800;letter-spacing:2px;">
                {emotion.upper()}
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ✅ MOTIVATIONAL QUOTE (ENHANCED)
    st.markdown(
        f"""
        <div style="text-align:center;margin:24px 0 32px 0;">
            <h3 style='color:{color};
                       font-size:24px;
                       font-weight:600;
                       font-style:italic;
                       text-shadow:0 2px 8px {color}44;'>
                {emotion_quotes.get(emotion, '')}
            </h3>
        </div>
        """,
        unsafe_allow_html=True
    )

    # ✅ CONFIDENCE BAR (ENHANCED)
    st.markdown("""
    <div class="card" style="margin-bottom:24px;">
        <h3 style="color:#38bdf8;font-size:22px;margin-bottom:16px;">
            📊 Emotion Confidence
        </h3>
    </div>
    """, unsafe_allow_html=True)
    conf_percent = min(confidence, 1.0) * 100
    st.progress(min(confidence, 1.0))
    st.markdown(f"""
    <div style="text-align:center;margin-top:8px;">
        <span style="color:#cbd5f5;font-size:18px;font-weight:600;">
            {conf_percent:.1f}% confidence
        </span>
    </div>
    """, unsafe_allow_html=True)

    # ✅ AI EXPLANATION (ENHANCED)
    st.markdown(f"""
    <div class="card" style="background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(56,189,248,0.15));
                             border: 2px solid rgba(139,92,246,0.3);
                             margin-bottom:32px;">
        <h3 style="color:#8b5cf6;font-size:22px;margin-bottom:12px;">
            🧠 Why These Songs?
        </h3>
        <p style="color:#e5e7eb;font-size:16px;line-height:1.8;margin:0;">
            {why_song.get(emotion, '')}
        </p>
    </div>
    """, unsafe_allow_html=True)

    # ✅ SONG RECOMMENDATIONS (ENHANCED)
    st.markdown("""
    <div style="margin:32px 0 16px 0;">
        <h2 style="color:#38bdf8;font-size:32px;text-align:center;font-weight:700;">
            🎵 Your Personalized Recommendations
        </h2>
        <p style="text-align:center;color:#94a3b8;font-size:14px;margin-top:8px;">
            Curated just for your current mood
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('<div class="card">', unsafe_allow_html=True)
    songs = recommend_music(emotion)
    for idx, (_, r) in enumerate(songs.iterrows(), 1):
        st.markdown(f"""
        <div class="song">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div style="background: linear-gradient(135deg, {color}44, {color}22);
                            width:40px;
                            height:40px;
                            border-radius:50%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-weight:700;
                            color:{color};
                            font-size:18px;">
                    {idx}
                </div>
                <div style="flex:1;">
                    <div style="color:#e5e7eb;font-size:20px;font-weight:700;margin-bottom:4px;">
                        🎵 {r['name']}
                    </div>
                    <div style="color:#94a3b8;font-size:16px;">
                        🎤 {r['artist']}
                    </div>
                </div>
            </div>
            <div style="text-align:center;margin-top:16px;">
                <a class="spotify"
                   href="https://open.spotify.com/track/{r['spotify_id']}"
                   target="_blank">
                   ▶️ Open in Spotify
                </a>
            </div>
        </div>
        """, unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # ✅ EMOTION HISTORY (ENHANCED)
    hist = pd.read_sql(
        "SELECT emotion, COUNT(*) c FROM history WHERE username=? GROUP BY emotion",
        get_conn(),
        params=(st.session_state.user,)
    )
    st.markdown("""
    <div style="margin:48px 0 24px 0;">
        <h2 style="color:#38bdf8;font-size:32px;text-align:center;font-weight:700;">
            📊 Your Emotion History
        </h2>
        <p style="text-align:center;color:#94a3b8;font-size:14px;margin-top:8px;">
            Track your emotional patterns over time
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    if not hist.empty:
        st.bar_chart(hist.set_index("emotion"), height=400)
    else:
        st.info("📈 Your emotion history will appear here as you use the app!")

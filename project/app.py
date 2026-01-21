import streamlit as st
from moodmate_pipeline import moodmate

# ===============================
# PAGE CONFIG
# ===============================
st.set_page_config(
    page_title="MoodMate",
    page_icon="🎵",
    layout="wide"
)

# ===============================
# CSS
# ===============================
st.markdown("""
<style>
body {
    background: linear-gradient(135deg, #0f172a, #020617);
}
.main {
    background: linear-gradient(135deg, #0f172a, #020617);
}

/* Header */
.header-title {
    font-size: 36px;
    font-weight: 800;
    color: #f8fafc;
}
.header-tagline {
    color: #94a3b8;
    margin-top: -8px;
}

/* Emotion badge */
.emotion-badge {
    background: #22c55e;
    color: #022c22;
    padding: 10px 18px;
    border-radius: 999px;
    display: inline-block;
    font-weight: 700;
    margin-top: 12px;
}

/* Scrollable song container */
.song-scroll {
    max-height: 600px;
    overflow-y: auto;
    padding-right: 10px;
}

/* Song card */
.song-card {
    background: #020617;
    padding: 16px;
    border-radius: 14px;
    margin-bottom: 16px;
    border: 1px solid #1e293b;
}
.song-title {
    color: #f8fafc;
    font-weight: 600;
    font-size: 16px;
}
.song-artist {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 10px;
}
.spotify-btn {
    display: inline-block;
    padding: 6px 12px;
    background: #1db954;
    color: white;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    font-size: 14px;
}
.spotify-btn,
.spotify-btn:link,
.spotify-btn:visited,
.spotify-btn:hover,
.spotify-btn:active {
    color: black !important;
    text-decoration: none;
}

.spotify-btn:hover {
    opacity: 0.85;
}
</style>
""", unsafe_allow_html=True)

# ===============================
# HEADER
# ===============================
st.markdown(
    """
    <div>
        <div class="header-title">🎵 MoodMate</div>
        <div class="header-tagline">
            Emotion-aware music recommendation using AI
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

st.markdown("---")

# ===============================
# TWO COLUMN LAYOUT
# ===============================
left_col, right_col = st.columns([1, 2])

with left_col:
    st.markdown("### 📝 Enter your mood")

    user_text = st.text_area(
        "Describe how you are feeling",
        placeholder="e.g. I just won a lottery...",
        height=160
    )

    predict_clicked = st.button("🎯 Predict Emotion", use_container_width=True)

    emotion_placeholder = st.empty()

with right_col:
    st.markdown("### 🎧 Recommended Songs")
    songs_placeholder = st.empty()

# ===============================
# ACTION
# ===============================
if predict_clicked:
    if user_text.strip() == "":
        emotion_placeholder.warning("Please enter some text.")
    else:
        output = moodmate(user_text)

        # LEFT: Emotion
        emotion_placeholder.markdown(
            f"<div class='emotion-badge'>{output['emotion'].upper()}</div>",
            unsafe_allow_html=True
        )

        # RIGHT: Scrollable songs
        with songs_placeholder.container():
            st.markdown("<div class='song-scroll'>", unsafe_allow_html=True)

            for song in output["songs"]:
                st.markdown(
                    f"""
                    <div class="song-card">
                        <div class="song-title">{song['name']}</div>
                        <div class="song-artist">{song['artist']}</div>
                        <a class="spotify-btn" href="{song['spotify_url']}" target="_blank">
                            Open in Spotify
                        </a>
                    </div>
                    
                    """,
                    unsafe_allow_html=True
                )

                if song["url_spotify_preview"]:
                    st.audio(song["url_spotify_preview"])

            st.markdown("</div>", unsafe_allow_html=True)

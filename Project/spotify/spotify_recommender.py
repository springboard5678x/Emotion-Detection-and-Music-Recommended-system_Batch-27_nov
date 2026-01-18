import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
load_dotenv()

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError("Spotify credentials not found in .env file")

# --------------------------------------------------
# Spotify Client (NO OAuth, NO Redirect)
# --------------------------------------------------
sp = spotipy.Spotify(
    auth_manager=SpotifyClientCredentials(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET
    )
)

# --------------------------------------------------
# Emotion → Spotify Search Keywords
# --------------------------------------------------
EMOTION_KEYWORDS = {
    "happy": "happy upbeat pop dance",
    "sad": "sad acoustic mellow slow",
    "angry": "rock metal aggressive",
    "fear": "ambient atmospheric dark",
    "surprise": "electronic edm energetic",
    "neutral": "chill indie relaxed",
    "disgust": "alternative experimental"
}

# --------------------------------------------------
# Build Query from Emotion Probabilities
# --------------------------------------------------
def build_query(emotion_probs, top_k=2):
    """
    emotion_probs example:
    {
        "happy": 0.7,
        "surprise": 0.2,
        "neutral": 0.1
    }
    """
    sorted_emotions = sorted(
        emotion_probs.items(),
        key=lambda x: x[1],
        reverse=True
    )[:top_k]

    keywords = []
    for emotion, _ in sorted_emotions:
        if emotion in EMOTION_KEYWORDS:
            keywords.append(EMOTION_KEYWORDS[emotion])

    return " ".join(keywords) if keywords else "chill pop"

# --------------------------------------------------
# Main Recommendation Function
# --------------------------------------------------
def recommend_tracks(
    emotion_probs,
    limit=10,
    market="US"
):
    query = build_query(emotion_probs)

    results = sp.search(
        q=query,
        type="track",
        limit=limit,
        market=market
    )

    tracks = []
    for item in results["tracks"]["items"]:
        tracks.append({
            "track_name": item["name"],
            "artists": ", ".join(a["name"] for a in item["artists"]),
            "spotify_url": item["external_urls"]["spotify"],
            "preview_url": item["preview_url"],
            "album_image": (
                item["album"]["images"][0]["url"]
                if item["album"]["images"] else None
            )
        })

    return tracks

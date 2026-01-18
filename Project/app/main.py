from fastapi import FastAPI, File, UploadFile
from app.utils import preprocess_image
from app.model import predict_emotion
from spotify.spotify_recommender import recommend_tracks

from pathlib import Path
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Allow requests from the frontend (development only)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # consider restricting in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict-and-recommend")
async def predict_and_recommend(file: UploadFile = File(...)):
    image_bytes = await file.read()

    image = preprocess_image(image_bytes)

    # 1️⃣ Emotion prediction
    emotion_result = predict_emotion(image)

    # 2️⃣ Spotify recommendation
    tracks = recommend_tracks(
        emotion_result["emotion_probs"]
    )

    return {
        "emotion": emotion_result["emotion"],
        "confidence": emotion_result["confidence"],
        "emotion_probs": emotion_result["emotion_probs"],
        "tracks": tracks
    }


# Serve the static frontend so the app runs in a single process:
# - UI: http://127.0.0.1:8001/
# - API: http://127.0.0.1:8001/predict-and-recommend
_ROOT_DIR = Path(__file__).resolve().parent.parent
_FRONTEND_DIR = _ROOT_DIR / "frontend"
if _FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIR), html=True), name="frontend")

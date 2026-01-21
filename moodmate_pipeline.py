import torch
import torch.nn as nn
import pickle
import pandas as pd
import numpy as np

from transformers import AutoTokenizer, AutoModel
from safetensors.torch import load_file
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ===============================
# MODEL DEFINITION
# ===============================
class DistilBertDeepHead(nn.Module):
    def __init__(self, model_name, num_labels):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        hidden = self.bert.config.hidden_size

        self.classifier = nn.Sequential(
            nn.Linear(hidden, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_labels)
        )

    def forward(self, input_ids=None, attention_mask=None, **kwargs):
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )
        cls_output = outputs.last_hidden_state[:, 0, :]
        logits = self.classifier(cls_output)
        return {"logits": logits}


# ===============================
# LOAD MODEL (ONCE)
# ===============================
NUM_LABELS = 5

model = DistilBertDeepHead(
    model_name="distilbert-base-uncased",
    num_labels=NUM_LABELS
)

state_dict = load_file("emotion_bert/model.safetensors")
model.load_state_dict(state_dict, strict=False)
model.eval()

tokenizer = AutoTokenizer.from_pretrained("emotion_bert")

with open("label_encoderdbnn.pkl", "rb") as f:
    label_encoder = pickle.load(f)


# ===============================
# LOAD SONG DATA + TFIDF
# ===============================
df = pd.read_csv("songs_cleaned.csv")

vectorizer = TfidfVectorizer()
song_tfidf = vectorizer.fit_transform(df["clean_tags"])


# ===============================
# EMOTION → TAGS
# ===============================
EMOTION_TO_TAGS = {
    "happy": ["pop", "happy"],
    "sad": ["acoustic", "sad"],
    "calm": ["classical", "instrumental", "ambient", "lo_fi", "calm"],
    "energetic": ["rock", "hip_hop", "edm", "energetic"],
    "angry": ["metal", "angry"]
}


# ===============================
# EMOTION PREDICTION
# ===============================
def predict_emotion(text: str) -> str:
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=64
    )

    with torch.no_grad():
        logits = model(**inputs)["logits"]

    pred_id = torch.argmax(logits, dim=1).item()
    return label_encoder.inverse_transform([pred_id])[0]


# ===============================
# SONG RECOMMENDATION
# ===============================
def recommend_songs(emotion: str, top_k: int = 10):
    query = " ".join(EMOTION_TO_TAGS[emotion])
    query_vec = vectorizer.transform([query])

    similarities = cosine_similarity(query_vec, song_tfidf)[0]
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = df.iloc[top_indices][[
        "artist", "name", "id_spotify", "url_spotify_preview"
    ]].copy()

    results["spotify_url"] = results["id_spotify"].apply(
        lambda x: f"https://open.spotify.com/track/{x}"
    )

    return results


# ===============================
# FULL PIPELINE (ONE CALL)
# ===============================
def moodmate(text: str, top_k: int = 10):
    emotion = predict_emotion(text)
    recs = recommend_songs(emotion, top_k)

    return {
        "emotion": emotion,
        "songs": recs.to_dict(orient="records")
    }

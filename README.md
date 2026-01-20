# 🎧 MoodMate AI  
### AI-Powered Emotion Detection + Smart Music Recommendation Engine  
**Built for developers and creators who want to stay in their flow state.**  
Real-time facial emotion detection + ML-powered music recommendation = Perfect productivity companion.

---

## 🚀 Key Features

### 🔹 1. Real-Time Emotion Detection  
- Uses a trained **XGBoost emotion classifier**  
- Detects: *Happy, Sad, Neutral, Angry, Surprise, Fear, Disgust*  
- Works directly from webcam feed in the dashboard  
- Confidence-based stabilization applied for smoother mood detection

### 🔹 2. Smart Music Recommendation Engine  
ML-based dynamic recommendation using:  
- **Valence**  
- **Energy**  
- **Danceability**  
- **Acousticness**

Two modes available:
- **Match Mode** → matches your current mood  
- **Improve Mode** → boosts mood gradually  

Each recommendation includes:
- Track Name  
- Spotify Track ID  
- Generated Vibe Message  
- Fetches real Spotify Album Artwork

### 🔹 3. Full Dashboard UI (Frontend)  
- Modern, responsive UI  
- In-app Spotify Embed Player  
- Real-time mood updates  
- Mini player + full player views  
- Bottom bar now syncs with real-time recommendations

### 🔹 4. My Flow Library (Custom Playlists)  
- Users can create playlists locally  
- Add/remove songs  
- Plays inside dashboard  
- Auto-switch to ML recommendations when songs end

### 🔹 5. Browser Extension (Chrome)  
- Displays mood, song, and artwork live during coding  
- Works on top of VSCode, browser windows, etc.  
- Communicates with backend via messaging API

---

## 🧠 Architecture Overview

Frontend (HTML/CSS/JS) → Camera Module → Frame Capture → Backend API
Backend (FastAPI) → XGBoost Model → Emotion Prediction
↓
Music Engine → Filter with valence + energy rules
↓
Spotify Embed Player + Dashboard UI + Browser Extension


moodmate/
│── backend/
│ ├── main.py # FastAPI backend
│ ├── xgboost_model.pkl # Saved classifier
│ ├── recommendation.py # Music logic
│ ├── dataset.csv # Spotify dataset
│
│── frontend/
│ ├── app2.html # Dashboard
│ ├── login.html # Login page
│ ├── app2.js # Core frontend logic
│ ├── styles.css # UI styling
│ └── assets/
│
│── extension/
│ ├── content.js
│ ├── background.js
│ ├── popup.html
│ └── manifest.json
│
│── models/
│ ├── training_notebook.ipynb
│ ├── xgboost.json # (Optional: model booster)
│ └── emotion_dataset.pkl
│
└── README.md



---

## ⚙️ Tech Stack

| Layer | Tools Used |
|------|------------|
| **Frontend** | HTML, CSS, JavaScript, Spotify Embed |
| **Backend** | FastAPI, Python |
| **ML Model** | XGBoost, OpenCV, NumPy, Pandas |
| **Emotion Detection** | Custom XGBoost Classifier |
| **Runtime** | WebSockets, Fetch API |
| **Extension** | Chrome Extension (Manifest V3) |

---

## 🧪 Machine Learning Model

### Model:
- **XGBoostClassifier**
- Trained on ~7 emotion classes  
- Balanced using weighted classes  
- Accuracy: **(Insert accuracy here after testing)**

### Exported Files:
- `xgboost_model.pkl` → used for backend inference  
- `label_encoder.pkl` → for mapping integers to emotion labels

---

## 🔌 API Endpoints

| Endpoint | Description |
|---------|-------------|
| `/predict_emotion` | Accepts a captured frame (base64) → returns emotion |
| `/recommendation?mode=match` | Recommendation based on mood |
| `/recommendation?mode=improve` | Mood-boosting recommendations |
| `/playlist/*` | Playlist CRUD operations (local storage) |

---

## ▶️ Running The Project

### 1️⃣ Install Requirements

pip install -r requirements.txt

### 2️⃣ Start FastAPI backend

uvicorn main:app --reload

Backend runs at:
http://127.0.0.1:8000


### 3️⃣ Run Frontend
Open:
frontend/app2.html


### 4️⃣ Chrome Extension Setup
1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## 🎯 Core Logic: Recommendation System

### **Match Mode**
Recommends songs that *reflect and stabilize* your mood.  
Example:
- Sad → Low energy, low valence songs  
- Angry → Low energy, calming songs  
- Happy → High valence + high energy amplification  

### **Improve Mode**
Gradual uplift algorithm:
- Sad → Medium energy, medium valence  
- Neutral → Balanced tracks  
- Happy → Peak productivity tracks  

---

## 📌 Achievements

- Integrated XGBoost into a real-time FastAPI inference pipeline  
- Fully responsive dashboard with live music player  
- Real-time emotion → music mapping  
- Chrome extension synced with backend  
- Smart artwork fetcher using Spotify oEmbed  
- Smooth transition and stabilization for mood fluctuations

---

## 🧿 Future Enhancements

- OAuth Spotify Login  
- Personalized music profiles  
- Developer productivity tracker  
- Emotion timeline graph  
- Multi-user accounts with sessions  
- Cloud hosting (Railway/Render)

---

## 👨‍💻 Contributors
- **Shreyas** – Lead Developer (Frontend, Backend Integration, Extension)
- **Your Team Members** – (Optional)

---

## ⭐ If you like MoodMate AI…
Give the repository a **Star ⭐ on GitHub** to support the project!

---

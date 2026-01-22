🎵 MoodMate

Emotion Detection and Music Recommendation System

MoodMate is an AI-powered application that detects a user’s emotional state from text input and recommends music aligned with that emotion.
It combines Natural Language Processing, Deep Learning, and Content-Based Recommendation techniques to deliver real-time, mood-aware music suggestions.

🚀 Features

🧠 Emotion Detection from Text

Uses a fine-tuned DistilBERT-based neural network

Classifies text into 5 core emotions:
happy, sad, calm, energetic, angry

🎧 Emotion-Based Music Recommendation

Uses TF-IDF + Cosine Similarity

Recommends songs based on emotion–genre mapping

🖥️ Interactive User Interface

Built using Streamlit

Real-time predictions and song recommendations

Spotify preview links for songs

🏗️ Project Architecture

Flow:

User Text Input
      ↓
Emotion Detection (DistilBERT + Deep Head)
      ↓
Emotion Label
      ↓
Emotion → Music Tag Mapping
      ↓
TF-IDF Similarity Search
      ↓
Recommended Songs

🧠 Model Architecture (Emotion Detection)

Base Model: DistilBERT (distilbert-base-uncased)

Custom Classification Head:

Linear (768 → 256)

ReLU + Dropout

Linear (256 → 128)

ReLU + Dropout

Linear (128 → 5 emotions)

Loss Function: Cross Entropy Loss

Evaluation Metrics: Accuracy, Precision, Recall, Macro F1-score

📊 Datasets Used
Emotion Dataset

Text-based emotion dataset

Originally contained multiple emotion classes

Reduced to 5 core emotions for this project

Music Dataset

Song metadata including:

Artist name

Song name

Spotify track ID

Genre/mood tags

Tags are normalized and mapped to emotions

🧩 Tech Stack
Backend / ML

Python

PyTorch

Hugging Face Transformers

Scikit-learn

Recommendation Engine

TF-IDF Vectorization

Cosine Similarity

Frontend

Streamlit

HTML + CSS (custom styling)

📂 Project Structure
project/
│
├── app.py                     # Streamlit UI
├── moodmate_pipeline.py       # Emotion detection + recommendation logic
├── emotion_bert/
│   └── model.safetensors      # Trained DistilBERT model ( cannot add due to size limit on github )
├── label_encoderdbnn.pkl      # Label encoder
├── songs_cleaned.csv          # Processed music dataset
└── README.md

▶️ How to Run the Project
1️⃣ Install dependencies
pip install -r requirements.txt

2️⃣ Run the Streamlit app
streamlit run app.py

🖥️ User Interface Overview

Left Panel

Text input for mood description

Predict Emotion button

Displays detected emotion

Right Panel

Scrollable song recommendation cards

Song name, artist

Spotify link and audio preview

🧪 Evaluation Summary

Stable performance across epochs

Macro F1-score used due to class imbalance

Validation trends monitored to prevent overfitting

Model generalizes well on unseen data

⚠️ Limitations

Emotion detection is text-only (no facial analysis)

Music recommendations are content-based, not personalized

Spotify API is not used (only preview URLs from dataset)

🔮 Future Scope

Add facial emotion recognition

Integrate Spotify API for full playlists

User-based personalization

Collaborative filtering

Deploy as a full-stack web application

📌 Conclusion

MoodMate demonstrates how NLP models and recommendation systems can be combined to build intelligent, user-centric applications.
The project highlights practical usage of transformers, similarity-based retrieval, and real-time ML inference through an interactive interface.

👤 Author

Sanat
B.Tech CSE
NIT Goa

# 🎧 Emotion-Based Music Recommendation System using Artificial Intelligence

An intelligent AI-powered system that detects human emotions from **Text, Image, or Webcam input** and recommends **personalized music** that matches the user’s emotional state.

This project combines **Artificial Intelligence, Deep Learning, NLP, Computer Vision, and Recommendation Systems** to deliver a real-time, interactive, and emotion-aware music experience.

---

## 📌 Project Overview

Music has a strong impact on human emotions, but users often struggle to find songs that truly match their mood.  
This system automatically understands emotions and recommends suitable music without manual searching.

### ✨ Key Highlights
- Emotion detection from **Text**, **Image**, and **Webcam**
- Personalized music recommendations
- Real-time emotion prediction with confidence score
- Spotify redirection for songs
- Emotion history tracking

---

## 🧠 System Workflow

1. User provides input (Text / Image / Webcam)
2. AI model detects the emotion
3. Detected emotion is normalized
4. Music recommendation engine is triggered
5. Personalized songs are displayed with Spotify links

---

## 📝 Input Modes Supported

### 📝 Text Emotion Detection
- Uses **DistilBERT Transformer**
- NLP-based emotion classification
- Outputs emotion and confidence score

### 📷 Image Emotion Detection
- Uses **CNN (Convolutional Neural Network)**
- Facial expression analysis
- Image preprocessing (grayscale, resize, normalization)

### 🎥 Webcam Emotion Detection
- Uses **DeepFace**
- Real-time face capture
- Dominant emotion extraction

---

## 😊 Supported Emotions

- Happy 😊  
- Sad 😢  
- Angry 😠  
- Calm 😌  
- Love ❤️  
- Neutral 😐  
- Disgust 🤢  

---

## 🎶 Music Recommendation Logic

- Emotion → Mood mapping
- TF-IDF similarity on mood text
- Audio feature matching
- Cosine similarity for ranking
- Top 5 personalized song recommendations

---

## 🖥️ User Interface Features

- Streamlit-based web application
- Dark / Light mode toggle
- Animated music notes background
- Emotion-based theme colors
- Confidence meter
- “Why these songs?” AI explanation
- Motivational quote per emotion

---

## 📊 Emotion History

- Emotion data stored using **SQLite**
- Database is auto-created at runtime
- Bar chart visualization of user emotion patterns

---

## 🛠️ Technologies Used

- Python
- Streamlit
- TensorFlow & Keras
- PyTorch
- Transformers (DistilBERT)
- DeepFace
- Scikit-learn
- SQLite
- Pandas
- NumPy

---

## 📂 Project Structure
AIMoodMate/
│
├── app.py
├── requirements.txt
├── README.md
│
├── assets/
├── ColabTraining/
├── text_emotion_model/
│
├── image_emotion_model.h5
├── class_map.json
├── music_meta.csv
├── music_features.npz
│
└── Presentation-AIMoodMate.pptx
---
## 🧪 Datasets Used
- Facial Emotion Dataset (FER-style)
- Text Emotion Dataset
- Music Metadata Dataset


## ▶️ How to Run the Project

```bash
pip install -r requirements.txt
streamlit run app.py

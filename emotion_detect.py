import cv2
import numpy as np
from tensorflow.keras.models import load_model

model = load_model(
    "/home/sharvari/Documents/Python/EmotionBasedMusicRecommendation/best_model.h5",
    compile=False
)

labels = ['Angry','Disgust','Fear','Happy','Sad','Neutral','Surprise']

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def detect_emotion_from_image(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return "Neutral"

    x, y, w, h = faces[0]  
    face = gray[y:y+h, x:x+w]
    face = cv2.resize(face, (48, 48))
    face = face / 255.0
    face = face.reshape(1, 48, 48, 1)

    pred = model.predict(face, verbose=0)[0]
    emotion = labels[np.argmax(pred)]

    return emotion

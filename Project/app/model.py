# app/model.py

import numpy as np
import tensorflow as tf
import cv2

# Load model (path is relative to repo root)
model = tf.keras.models.load_model("model\\cnn_fer2013_57.keras")

# Load model (repo-root relative, cross-platform)
# _ROOT_DIR = Path(__file__).resolve().parent.parent
# _MODEL_PATH = _ROOT_DIR / "model" / "cnn_fer2013_57.keras"
# model = tf.keras.models.load_model(str(_MODEL_PATH))

emotion_labels = [
    "Angry", "Disgust", "Fear",
    "Happy", "Neutral", "Sad", "Surprise"
]


def _prepare_face_for_model(gray_face):
    """Resize, normalize and reshape a grayscale face for the model."""
    face_resized = cv2.resize(gray_face, (48, 48))
    face_norm = face_resized.astype("float32") / 255.0
    return face_norm.reshape(1, 48, 48, 1)


def predict_emotion(image):
    """
    Accepts a grayscale image (HxW numpy array) or a color image and
    detects the largest face. Crops the face, prepares it and runs the
    emotion classifier.

    If no face is found, the whole image is used as fallback.
    """

    # Ensure we have a grayscale image
    if image is None:
        raise ValueError("No image provided to predict_emotion")

    if image.ndim == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Detect faces using OpenCV's Haar cascade (uses packaged cascades)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )

    if len(faces) == 0:
        # No face found — fallback to using the whole image
        face_img = gray
    else:
        # Pick the largest detected face (by area)
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        face_img = gray[y : y + h, x : x + w]

    # Prepare and predict
    model_input = _prepare_face_for_model(face_img)
    preds = model.predict(model_input, verbose=0)[0]

    emotion_probs = {emotion_labels[i]: float(preds[i]) for i in range(len(emotion_labels))}
    top_idx = int(np.argmax(preds))

    return {
        "emotion": emotion_labels[top_idx],
        "confidence": float(preds[top_idx]),
        "emotion_probs": emotion_probs
    }
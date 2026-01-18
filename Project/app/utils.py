# app/utils.py

import cv2
import numpy as np

def preprocess_image(image_bytes: bytes):
    """
    Decode raw image bytes -> grayscale numpy array.

    Note: face detection and final resizing/normalization is handled in
    `predict_emotion` so this function returns the decoded grayscale
    image (shape: HxW) instead of a model-ready tensor.
    """

    # Decode bytes to BGR image first
    np_img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image")

    # Convert to grayscale for face detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    return gray

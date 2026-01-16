import os
import numpy as np
import pandas as pd
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image
import io
import base64


app = Flask(__name__)
CORS(app) 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'moodmate_final_model.h5')
MUSIC_PATH = os.path.join(BASE_DIR, 'data', 'processed_music.csv')


print("⏳ Loading Model and Music Data... Please Wait.")


class MockModel:
    def predict(self, input_data):
        return np.random.rand(1, 7)

try:
    model = load_model(MODEL_PATH, compile=False)
    print("✅ Model Loaded Successfully!")
except Exception as e:
    print(f"⚠️ Model incompatible or missing ({e}). Switching to SIMULATION MODE.")
    model = MockModel()


try:
    music_df = pd.read_csv(MUSIC_PATH)
    print(f"✅ Music Database Loaded: {len(music_df)} songs.")
except Exception as e:
    print(f"❌ Error loading music CSV: {e}")
    music_df = pd.DataFrame() 

EMOTION_LABELS = {
    0: "Angry",
    1: "Disgust",
    2: "Fear",
    3: "Happy",
    4: "Sad",
    5: "Surprise",
    6: "Neutral"
}

def preprocess_image(base64_string):
    """
    Decodes the base64 string, converts to grayscale, 
    resizes to 48x48, and normalizes.
    """
    # 1. Remove the header "data:image/jpeg;base64," if present
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]

    # 2. Decode to bytes
    image_bytes = base64.b64decode(base64_string)
    
    # 3. Open with PIL
    img = Image.open(io.BytesIO(image_bytes))
    
    # 4. Convert to Grayscale ('L') because our model expects 1 channel
    img = img.convert('L')
    
    # 5. Resize to 48x48 pixels (Model Requirement)
    img = img.resize((48, 48))
    
    # 6. Convert to NumPy Array and Normalize (0-1 range)
    img_array = np.array(img).astype('float32') / 255.0
    
    # 7. Reshape to (1, 48, 48, 1) -> (Batch Size, Height, Width, Channels)
    img_array = np.expand_dims(img_array, axis=0) # Add batch dim
    img_array = np.expand_dims(img_array, axis=-1) # Add channel dim
    
    return img_array


INVERSE_PROJECTION = {
    "Sad": "Happy",
    "Angry": "Happy", 
    "Fear": "Happy", 
    "Disgust": "Happy",
    "Surprise": "Happy",
    "Neutral": "Neutral",
    "Happy": "Happy"
}

def get_music_recommendations(emotion_label):
    """
    Filters the CSV for 5 random songs matching the INVERSE of the emotion.
    """
    if music_df.empty:
        return []
    
    # Apply Inverse Logic
    target_emotion = INVERSE_PROJECTION.get(emotion_label, "Happy")
    print(f"🎵 Detected: {emotion_label} -> Recommending: {target_emotion}")

    label_to_id = {v: k for k, v in EMOTION_LABELS.items()}
    target_id = label_to_id.get(target_emotion, 6) 
    
    if 'emotion_id' in music_df.columns:
        filtered_songs = music_df[music_df['emotion_id'] == target_id]
    else:
        # Fallback if column missing
        filtered_songs = music_df.sample(5)

    # Get 5 random songs if available, else all of them
    if len(filtered_songs) > 5:
        recommendations = filtered_songs.sample(5).to_dict(orient='records')
    else:
        recommendations = filtered_songs.to_dict(orient='records')
        
    return recommendations

# --- API ROUTES ---

@app.route('/')
def home():
    return "MoodMate Brain is Active!"

@app.route('/predict_emotion', methods=['POST'])
def predict_emotion():
    try:
        # 1. Get the JSON data from Frontend
        data = request.get_json()
        image_data = data.get('image') # Base64 string
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        # 2. Preprocess
        processed_img = preprocess_image(image_data)
        
        # 3. Predict
        if model:
            predictions = model.predict(processed_img)
            max_index = np.argmax(predictions[0]) # Get index of highest probability
            predicted_emotion = EMOTION_LABELS[max_index]
            confidence = float(np.max(predictions[0]))
        else:
            return jsonify({"error": "Model not loaded"}), 500
        
        # 4. Get Music
        songs = get_music_recommendations(predicted_emotion)
        
        # 5. Send Response
        return jsonify({
            "emotion": predicted_emotion,
            "confidence": f"{confidence*100:.2f}%",
            "songs": songs
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- START SERVER ---
if __name__ == '__main__':
    # Debug=True allows auto-restart when you change code
    # Hugging Face Spaces uses port 7860 by default
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 7860)))
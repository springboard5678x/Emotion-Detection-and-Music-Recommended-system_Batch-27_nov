# Moodify🎵😊

Moodify is a web application that detects your current mood using facial expressions or text input and recommends songs based on the detected emotion.  

---

## **Features**

- **Real-time Emotion Detection**:  
  Capture your facial expression via webcam or upload an image to detect emotions like Happy, Sad, Angry, Fear, Surprise, Neutral, Disgust.  

- **Text-based Mood Detection**:  
  Type how you feel and the app detects your mood from the text.  

- **Music Recommendation**:  
  Based on the detected emotion, the app suggests songs from curated playlists with Spotify links.  

- **Interactive UI**:  
  - Hero slider for a dynamic homepage  
  - Quote section with fade-up animation  
  - Responsive layout for desktop and mobile  

---

## **Tech Stack**

- **Frontend**:  
  - HTML5, CSS3, JavaScript  
  - Vercel for deployment  
  - Font Awesome for icons  

- **Backend**:  
  - Python, Flask  
  - TensorFlow/Keras (for emotion detection model)  
  - OpenCV (for face detection)  
  - Flask-CORS (for cross-origin requests)  
  - Render for deployment  

- **Data & Music**:  
  - Pandas for managing song dataset  
  - Predefined mapping of text/emoji → emotions  
  - Spotify links for recommended songs  

---

## **Deployment**

- **Frontend**: Vercel  
  https://moodify-sooty.vercel.app/ 

- **Backend**: Render  
  https://ai-3im8.onrender.com  


---

## **How to Run Locally**

### Backend

1. Clone the repository
2. Create a virtual environment:  
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows

 3. Install dependencies:
   pip install -r requirements.txt

 4. Run the Flask server:
  python app.py

5. Backend will run at http://127.0.0.1:7860

---
 
Credits

Emotion detection model trained using Keras/TensorFlow 

Music dataset curated manually for each emotion

UI inspired by modern interactive web applications

---

License
 MIT License

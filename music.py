import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset once
df = pd.read_csv(
    "/home/sharvari/Documents/Python/EmotionBasedMusicRecommendation/src/preprocess/spotify_preprocessed.csv"
)

def map_mood(row): 
    if row['valence'] > 0.6 and row['energy'] > 0.6: 
        return 'Happy'
    elif row['valence'] < 0.4 and row['energy'] < 0.4: 
        return 'Sad'
    elif row['energy'] > 0.7 and row['valence'] < 0.4 and row['loudness'] > -5: 
        return 'Angry'
    elif row['energy'] < 0.4 and row['acousticness'] > 0.5 and row['tempo'] < 100: 
        return 'Relaxed'
    elif row['energy'] > 0.7 and row['tempo'] > 120 and row['valence'] > 0.5: 
        return 'Excited'
    else: 
        return 'Neutral'

# Create mood column (run once)
df["mood"] = df.apply(map_mood, axis=1)

emotion_to_mood = {
    'Happy': ['Happy', 'Excited'],
    'Sad': ['Sad', 'Happy'],
    'Fear': ['Relaxed'],
    'Angry': ['Angry', 'Relaxed'],
    'Disgust': ['Angry', 'Relaxed'],
    'Surprise': ['Excited', 'Happy'],
    'Neutral': ['Happy', 'Neutral']
}

def get_recommendations(emotion, top_n=10):
    """
    Get song recommendations based on emotion.
    Returns a list of songs with Spotify track IDs for embedding.
    """
    target_mood = emotion_to_mood.get(emotion, ['Neutral'])

    mood_df = df[df["mood"].isin(target_mood)].reset_index(drop=True)

    if len(mood_df) == 0:
        return []

    features = [
        'energy',
        'danceability',
        'loudness',
        'liveness',
        'valence',
        'acousticness',
        'speechiness',
        'duration_ms'
    ]

    scaler = MinMaxScaler()
    scaled_features = scaler.fit_transform(mood_df[features])

    similarity = cosine_similarity(scaled_features)

    center_song_index = np.random.randint(0, len(mood_df))
    similar_scores = list(enumerate(similarity[center_song_index]))
    sorted_songs = sorted(similar_scores, key=lambda x: x[1], reverse=True)

    recommended_indices = [idx for idx, _ in sorted_songs[1:top_n+1]]

    recommendations_df = mood_df.iloc[recommended_indices][
        ["track_name", "track_artist", "track_album_name", "playlist_genre", "track_id", "playlist_id", "playlist_name"]
    ]

    # Return list of dictionaries with song info and Spotify track ID
    results = []
    for _, row in recommendations_df.iterrows():
        song_info = {
            'name': f"{row['track_name']} - {row['track_artist']}",
            'track_id': row['track_id'],
            'artist': row['track_artist'],
            'album': row['track_album_name'],
            'genre': row['playlist_genre']
        }
        results.append(song_info)
    
    return results
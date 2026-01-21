import pandas as pd
import pickle
import os

# Correct CSV path
csv_path = r"D:\emotion _music _app\datasets\msd\Last.fm_data.csv"

# Load CSV
df = pd.read_csv(csv_path)

# Keep only required columns
df = df[['Artist', 'Track']].dropna()

# Make sure index is clean
df.reset_index(drop=True, inplace=True)

# Emotion categories
emotions = ["happy", "sad", "angry", "fear", "surprise", "neutral"]

recommendation_map = {}

# For each emotion → randomly pick 20 songs
for emotion in emotions:
    samples = df.sample(min(20, len(df)))[['Artist', 'Track']]
    recommendation_map[emotion] = samples.to_dict('records')

# Output path
out_path = os.path.join(os.path.dirname(__file__), "..", "models", "music_recommender.pkl")

os.makedirs(os.path.dirname(out_path), exist_ok=True)

# Save file
with open(out_path, "wb") as f:
    pickle.dump(recommendation_map, f)

print("✔ Music Recommender Trained Successfully!")
print("Saved at:", out_path)

import os

# 1. Get the folder where THIS script (inspectdata.py) is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Build the path to the dataset relative to this script
# We go ".." (up one level) and then into "dataset/train"
train_dir = os.path.join(script_dir, "..", "dataset", "train")
test_dir = os.path.join(script_dir, "..", "dataset", "test")

# 3. Check if folders exist
if os.path.exists(train_dir):
    print("[OK] Dataset folder found at:", train_dir)
    
    # Count images in each emotion category
    emotions = os.listdir(train_dir)
    print(f"Found {len(emotions)} emotion categories:")
    
    for emotion in emotions:
        emotion_path = os.path.join(train_dir, emotion)
        # Check if it is actually a folder before counting
        if os.path.isdir(emotion_path):
            count = len(os.listdir(emotion_path))
            print(f"   - {emotion}: {count} images")
else:
    print("[ERROR] Dataset folder NOT found.")
    print(f"I was looking for it here: {train_dir}")
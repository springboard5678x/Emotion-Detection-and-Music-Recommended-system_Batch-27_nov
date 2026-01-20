import sqlite3
import os

DB_NAME = "moodmate.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            preferences TEXT DEFAULT '{"mode": "match"}'
        )
    ''')

    # 2. Sessions Table (Analytics)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            start_time TEXT,
            end_time TEXT,
            duration TEXT,
            start_mood TEXT,
            end_mood TEXT,
            improvement TEXT,
            insight TEXT,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    ''')

    # 3. Mood History (Detailed graph data)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            timestamp TEXT,
            emotion TEXT,
            FOREIGN KEY(session_id) REFERENCES sessions(id)
        )
    ''')

    # 4. Playlists & Tracks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            name TEXT,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            playlist_id INTEGER,
            spotify_id TEXT,
            title TEXT,
            mood TEXT,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(playlist_id) REFERENCES playlists(id)
        )
    ''')
    # Add this inside init_db() in database.py
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS play_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            spotify_id TEXT,
            title TEXT,
            played_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully.")

if __name__ == "__main__":
    init_db()
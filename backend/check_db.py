import sqlite3

conn = sqlite3.connect("moodmate.db")
cursor = conn.cursor()

# Query the sqlite_master table to see all created tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("--- Tables in your Database ---")
if not tables:
    print("No tables found. Run database.py first!")
else:
    for table in tables:
        print(f"✅ {table[0]}")

conn.close()
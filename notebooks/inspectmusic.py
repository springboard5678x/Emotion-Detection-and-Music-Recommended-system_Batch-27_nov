import pandas as pd
import os 

scriptdir=os.path.dirname(os.path.abspath(__file__))
csvpath=os.path.join(scriptdir,"..","dataset","musicdata.csv")

try:
    df=pd.read_csv(csvpath)
    print("[OK] Music Dataset loaded successfully!")
    print(f"Total Songs: {len(df)}")

    print("\n--- Columns Available ---")
    print(df.columns.tolist())

    reqcols=["valence","energy","song_name","id"]
    missing=[col for col in reqcols if col not in df.columns]

    if not missing:
        print("\n[PERFECT] 'valence' and 'energy' columns are present!")
        print(df[['song_name', 'valence', 'energy','id']].head())
    else:
        print(f"\n[WARNING] We are missing these columns: {missing}")
except FileNotFoundError:
    print("[ERROR] Could not find music_data.csv. Did you rename it?")
import os
import json
import librosa
import numpy as np
import pandas as pd
from tqdm import tqdm

# --- SETTINGS ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TRACKS_CSV = os.path.join(SCRIPT_DIR, "datasets", "fma_metadata", "tracks.csv")
AUDIO_DIR = os.path.join(SCRIPT_DIR, "datasets", "fma_small")
JSON_PATH = os.path.join(SCRIPT_DIR, "data.json")

SAMPLE_RATE = 22050
DURATION = 30 
SAMPLES_PER_TRACK = SAMPLE_RATE * DURATION

def load_fma_mapping():
    """Reads tracks.csv and returns a mapping of {track_id: genre_name}."""
    # FMA CSV has 3 header rows. We use row 0 and 1 for the MultiIndex.
    tracks = pd.read_csv(TRACKS_CSV, index_col=0, header=[0, 1])
    
    # Filter for the 'small' subset and extract the 'top_level' genre
    small = tracks[tracks[('set', 'subset')] <= 'small']
    mapping = small[('track', 'genre_top')].to_dict()
    
    # Clean up mapping: remove any NaNs or non-string genres
    return {k: v for k, v in mapping.items() if isinstance(v, str)}

def save_mfcc(audio_dir, json_path, n_mfcc=40):
    mapping = load_fma_mapping()
    
    # --- CRITICAL FIX: Alphabetical Genre Sorting ---
    # This ensures "Electronic" is ALWAYS index 0, "Rock" is ALWAYS index 7, etc.
    unique_genres = sorted(list(set(mapping.values())))
    genre_to_id = {genre: i for i, genre in enumerate(unique_genres)}
    
    data = {
        "mapping": unique_genres, 
        "labels": [], 
        "mfcc": []
    }
    
    # Get all MP3 files
    audio_files = []
    for root, _, files in os.walk(audio_dir):
        for file in files:
            if file.endswith('.mp3'):
                audio_files.append(os.path.join(root, file))

    print(f"Found {len(audio_files)} files. Processing 8,000 tracks...")

    for file_path in tqdm(audio_files):
        try:
            # Filename is '000123.mp3' -> track_id is 123
            track_id = int(os.path.basename(file_path).replace('.mp3', ''))
            
            if track_id not in mapping:
                continue
                
            genre = mapping[track_id]
            
            # 1. Load Audio
            # We use offset=13.0 to skip the first 13 seconds (usually intro/silence)
            signal, sr = librosa.load(file_path, sr=SAMPLE_RATE, duration=3.0, offset=13.0)
            
            # Pad if the segment is slightly shorter than 3 seconds
            target_len = SAMPLE_RATE * 3
            if len(signal) < target_len:
                signal = np.pad(signal, (0, target_len - len(signal)), 'constant')
            
            # 2. Normalize
            signal = librosa.util.normalize(signal)
            
            # 3. Extract MFCC
            mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=n_mfcc, n_fft=2048, hop_length=512)
            mfcc = mfcc.T

            # Ensure shape is exactly (130, 40)
            if mfcc.shape[0] == 130:
                data["mfcc"].append(mfcc.tolist())
                data["labels"].append(genre_to_id[genre])
                
        except Exception:
            continue # Skip corrupted files silently

    # Final Save
    with open(json_path, "w") as fp:
        json.dump(data, fp)
    
    print(f"\nSUCCESS! Saved {len(data['labels'])} samples.")
    print(f"Genre Mapping: {data['mapping']}")

if __name__ == "__main__":
    save_mfcc(AUDIO_DIR, JSON_PATH)
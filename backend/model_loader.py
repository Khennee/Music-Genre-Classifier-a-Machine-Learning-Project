import os
# Force legacy Keras for compatibility
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import tensorflow as tf
import tf_keras as keras
import librosa
import numpy as np
import io
import json

# Preprocessing settings (must match training pipeline)
SAMPLE_RATE = 22050
SEGMENT_DURATION = 3.0
SEGMENT_OFFSET = 13.0
N_MFCC = 40
N_FFT = 2048
HOP_LENGTH = 512
TARGET_FRAMES = 130

# Input validation thresholds
MIN_DURATION = 60.0
MAX_DURATION = 600.0

class GenreModel:
    def __init__(self, model_path, mapping_path=None):
        self.model = keras.models.load_model(model_path)

        # Load mapping from data.json when available to keep label order consistent.
        self.genres = None
        if mapping_path and os.path.exists(mapping_path):
            try:
                with open(mapping_path, "r") as fp:
                    data = json.load(fp)
                if isinstance(data.get("mapping"), list) and data["mapping"]:
                    self.genres = data["mapping"]
            except Exception:
                self.genres = None

        if not self.genres:
            # Fallback to the known 16-genre ordering.
            self.genres = [
                "Blues", "Classical", "Country", "Easy Listening", "Electronic",
                "Experimental", "Folk", "Hip-Hop", "Instrumental", "International",
                "Jazz", "Old-Time / Historic", "Pop", "Rock", "Soul-RnB", "Spoken"
            ]

    def _load_audio(self, file_bytes):
        try:
            signal, sr = librosa.load(io.BytesIO(file_bytes), sr=SAMPLE_RATE, mono=True)
        except Exception as exc:
            raise ValueError("Corrupted or unreadable audio file.") from exc

        if signal is None or len(signal) == 0 or np.isnan(signal).any():
            raise ValueError("Corrupted or unreadable audio file.")

        duration = len(signal) / float(sr)
        if duration < MIN_DURATION:
            raise ValueError(
                f"Audio too short. Need at least {MIN_DURATION:.1f}s to analyze."
            )
        if duration > MAX_DURATION:
            raise ValueError(
                f"Audio too long. Please upload a file shorter than {MAX_DURATION:.0f}s."
            )

        return signal, sr
        
    def predict(self, file_bytes):
        # 1. Load full audio for validation and slicing
        signal, sr = self._load_audio(file_bytes)

        # 2. Slice a consistent 3-second window with the training offset
        start_sample = int(SEGMENT_OFFSET * sr)
        end_sample = start_sample + int(SEGMENT_DURATION * sr)
        segment = signal[start_sample:end_sample]

        # 3. Normalize and pad/truncate to the exact segment length
        segment = librosa.util.normalize(segment)
        samples_per_segment = int(SAMPLE_RATE * SEGMENT_DURATION)
        if len(segment) < samples_per_segment:
            segment = np.pad(segment, (0, samples_per_segment - len(segment)), "constant")
        else:
            segment = segment[:samples_per_segment]

        # 4. Extract MFCCs (must match training settings)
        mfcc = librosa.feature.mfcc(
            y=segment,
            sr=sr,
            n_mfcc=N_MFCC,
            n_fft=N_FFT,
            hop_length=HOP_LENGTH,
        )
        mfcc = mfcc.T

        # 5. Ensure frame count matches training (130)
        if mfcc.shape[0] < TARGET_FRAMES:
            pad_frames = TARGET_FRAMES - mfcc.shape[0]
            mfcc = np.pad(mfcc, ((0, pad_frames), (0, 0)), "constant")
        else:
            mfcc = mfcc[:TARGET_FRAMES, :]

        # 6. Reshape for CNN: (1, 130, 40, 1)
        mfcc = mfcc[np.newaxis, ..., np.newaxis]

        # 7. Prediction Logic
        predictions = self.model.predict(mfcc)[0]
        
        # Get the indices of the Top 3 results (sorted highest to lowest)
        top_3_indices = np.argsort(predictions)[-3:][::-1]
        
        # Format Top 3 for the response
        top_3_list = []
        for i in top_3_indices:
            top_3_list.append({
                "genre": self.genres[i],
                "confidence": round(float(predictions[i]) * 100, 2) # e.g., 92.5
            })

        return {
            "primary_genre": top_3_list[0]["genre"],
            "confidence": top_3_list[0]["confidence"],
            "top_3": top_3_list,
            "all_predictions": {
                self.genres[i]: float(predictions[i]) 
                for i in range(len(self.genres))
            }
        }
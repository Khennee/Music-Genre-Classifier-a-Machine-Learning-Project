import os
import io
import json
import numpy as np
import librosa

# Suppress heavy TensorFlow logging for better performance
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import tensorflow as tf
import tf_keras as keras

# Constants
SAMPLE_RATE = 22050 
SEGMENT_DURATION = 3.0
SEGMENT_OFFSET = 13.0
N_MFCC = 40
N_FFT = 2048
HOP_LENGTH = 512
TARGET_FRAMES = 130
MIN_DURATION = 30.0 
MAX_DURATION = 600.0

class GenreModel:
    def __init__(self, model_path, mapping_path=None):
        
        self.model = keras.models.load_model(model_path, compile=False)

        self.genres = None
        if mapping_path and os.path.exists(mapping_path):
            try:
                with open(mapping_path, "r") as fp:
                    data = json.load(fp)
                if isinstance(data.get("mapping"), list):
                    self.genres = data["mapping"]
            except Exception:
                pass

        if not self.genres:
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

        if signal is None or len(signal) == 0:
            raise ValueError("Audio file contains no data.")

        duration = len(signal) / float(sr)
        if duration < MIN_DURATION:
            raise ValueError(f"Audio too short ({duration:.1f}s). Need {MIN_DURATION}s.")
        
        return signal, sr
        
    def predict(self, file_bytes):
        signal, sr = self._load_audio(file_bytes)
        duration = len(signal) / float(sr)

        num_segments = 10
        intervals = np.linspace(0, duration - SEGMENT_DURATION, num_segments)
        
        all_predictions = []

        for start_time in intervals:
            start_sample = int(start_time * sr)
            end_sample = start_sample + int(SEGMENT_DURATION * sr)
            segment = signal[start_sample:end_sample]
            
            if len(segment) < int(SEGMENT_DURATION * sr):
                continue

            segment = librosa.util.normalize(segment)
            
            mfcc = librosa.feature.mfcc(
                y=segment, sr=sr, n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP_LENGTH
            ).T

            if mfcc.shape[0] < TARGET_FRAMES:
                mfcc = np.pad(mfcc, ((0, TARGET_FRAMES - mfcc.shape[0]), (0, 0)), "constant")
            else:
                mfcc = mfcc[:TARGET_FRAMES, :]

            all_predictions.append(mfcc)

        batch_mfcc = np.array(all_predictions)[..., np.newaxis]
        
        batch_results = self.model.predict(batch_mfcc, verbose=0)
        
        mean_predictions = np.mean(batch_results, axis=0)
        
        top_3_indices = np.argsort(mean_predictions)[-3:][::-1]
        top_3_list = [
            {"genre": self.genres[i], "confidence": round(float(mean_predictions[i]) * 100, 2)}
            for i in top_3_indices
        ]

        return {
            "primary_genre": top_3_list[0]["genre"],
            "confidence": top_3_list[0]["confidence"],
            "top_3": top_3_list
        }
import os
# Force legacy Keras for compatibility
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import tensorflow as tf
import tf_keras as keras
import librosa
import numpy as np
import io

class GenreModel:
    def __init__(self, model_path):
        self.model = keras.models.load_model(model_path)
        
        # Updated FMA 16-Genre Mapping
        self.genres = [
            'Blues', 'Classical', 'Country', 'Easy Listening', 'Electronic', 
            'Experimental', 'Folk', 'Hip-Hop', 'Instrumental', 'International', 
            'Jazz', 'Old-Time / Historic', 'Pop', 'Rock', 'Soul-RnB', 'Spoken'
        ]
        
    def predict(self, file_bytes):
        # 1. Load Audio (using 30s offset to reach the core of the song)
        signal, sr = librosa.load(io.BytesIO(file_bytes), sr=22050, duration=3.0, offset=30.0)
        
        # 2. AUDIO NORMALIZATION
        signal = librosa.util.normalize(signal)
        
        # 3. Ensure exact segment length (3 seconds)
        samples_per_segment = 22050 * 3
        if len(signal) < samples_per_segment:
            signal = np.pad(signal, (0, samples_per_segment - len(signal)), 'constant')
        else:
            signal = signal[:samples_per_segment]
        
        # 4. Extract 40 MFCCs (Must match your optimized_model training)
        mfcc = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=40, n_fft=2048, hop_length=512)
        mfcc = mfcc.T 
        
        # 5. Reshape for CNN: (1, 130, 40, 1)
        mfcc = mfcc[:130, :] 
        mfcc = mfcc[np.newaxis, ..., np.newaxis]

        # 6. Prediction Logic
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
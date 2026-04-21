import io
import librosa
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Enable CORS for your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_features(audio_bytes):
    """
    Converts audio bytes into MFCC features that the AI can understand.
    """
    # Load audio from bytes (sr=22050 is standard for GTZAN dataset)
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)
    
    # Extract MFCCs (usually 13 or 20 coefficients)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    
    # Scale/Normalize (The model expects a specific shape)
    # For now, we just return the mean to prove it's working
    mfcc_scaled = np.mean(mfcc.T, axis=0)
    return mfcc_scaled.tolist()

@app.get("/")
def health_check():
    return {"status": "Backend Online", "version": "1.0.0"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # 1. Validate File Type
    if file.content_type not in ["audio/mpeg", "audio/wav", "audio/x-wav"]:
        raise HTTPException(status_code=400, detail="Only .mp3 and .wav files are supported.")

    try:
        # 2. Read file into memory
        audio_content = await file.read()
        
        # 3. Process Audio (Feature Extraction)
        features = extract_features(audio_content)
        
        # 4. (Placeholder) Prediction Logic
        # Later, we will load the .h5 model here
        return {
            "filename": file.filename,
            "genre_probabilities": {
                "Pop": 0.85, 
                "Jazz": 0.10, 
                "Rock": 0.05
            },
            "features_extracted": len(features)
        }
    except Exception as e:
        return {"error": f"Failed to process audio: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
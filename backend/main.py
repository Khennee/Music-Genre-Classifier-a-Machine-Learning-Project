from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from model_loader import GenreModel

app = FastAPI(title="BitWave AI Engine")

# Allow your Next.js frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the classifier
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_CANDIDATES = [
    os.path.join(MODEL_DIR, "model.h5"),
    os.path.join(MODEL_DIR, "optimized_model.h5"),
    os.path.join(MODEL_DIR, "baseline_model.h5"),
]
MAPPING_PATH = os.path.join(MODEL_DIR, "data.json")

MODEL_PATH = next((path for path in MODEL_CANDIDATES if os.path.exists(path)), None)

if MODEL_PATH:
    classifier = GenreModel(MODEL_PATH, mapping_path=MAPPING_PATH)
else:
    print(f"ERROR: Model not found in {MODEL_DIR}")
    classifier = None

@app.get("/")
def health_check():
    return {"status": "online", "model_loaded": classifier is not None}

@app.post("/predict")
async def predict_genre(file: UploadFile = File(...)):
    if not classifier:
        raise HTTPException(status_code=500, detail="Model not initialized.")
    
    # Check file type
    if not file.filename.endswith(('.wav', '.mp3', '.ogg')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a WAV or MP3.")

    try:
        content = await file.read()
        result = classifier.predict(content)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Use "main:app" as a string to enable the reload feature properly
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
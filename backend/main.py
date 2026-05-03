from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from model_loader import GenreModel

app = FastAPI(title="BitWave AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cross-platform path handling using os.path.join
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

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
    
    if not file.filename.lower().endswith(('.wav', '.mp3', '.ogg')):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        content = await file.read()
        raw_predictions = classifier.predict(content)
        
        print(f"DEBUG: Model Output -> {raw_predictions}")

        if not raw_predictions:
            raise ValueError("Model produced no results. Check data.json mapping.")

        return {"all_predictions": raw_predictions}

    except Exception as e:
        print(f"Inference Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=["backend"])
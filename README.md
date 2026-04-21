# Music-Genre-Classifier-a-Machine-Learning-Project

The system is a deep learning-based web application that classifies the genre of a music file uploaded by the user. The application accepts audio inputs in .mp3 and .wav formats, processes the audio into machine-readable features, and predicts the most likely music genre using a trained neural network model.
The system is designed to demonstrate a full machine learning workflow including data preprocessing, model training, evaluation, and deployment through a modern web interface.

## Prerequisites
    - Python 3.9+
    - Bun (install oven-sh/bun/bun)
    - FFmpeg (brew install ffmpeg)

## Frontend

    Framework: 
        - Next.js (TypeScript)

    Styling: 
        - Tailwind CSS

    Responsibilities: 
        - Upload audio files (.mp3, .wav)
        - Display waveform or file metadata 
        - Send file to backend API
        - Show prediction results and confidence scores

    Key Feature:    
        - wavesurfer.js (to display waveform)


## Backend (AI/ML Service)

    Framework: 
        - Python (FastAPI)

    Audio Processing: 
        - Librosa

    AI Model: 
        - TensorFlow/Keras

    Model Training: 
        - Convolutional Neural Network (CNN)
    
    Dataset: 
        - GTZAN

    Communication: 
        - JSON via REST API
        - Cross-Origin Resource Sharing (CORS)

    Responsibilities:
        - Receive uploaded audio files
        - Convert audio to features (MFCC / Mel Spectrogram)
        - Load trained deep learning model
        - Perform inference
        - Return prediction + confidence scores

## SetUp
    Backend: 
        - cd backend
        - macOS: python3 -m venv venv
        - Windows: python -m venv venv
        - source venv/bin/activate
        - pip install -r requirements.txt

    Frontend: 
        - cd frontend
        - bun install

## How to run
    Frontend:
        - bun dev

    Backend: 
        - python main.py

    Root: 
        - bun dev
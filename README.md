# Music-Genre-Classifier-a-Machine-Learning-Project

Bit Wave is a deep learning-based web application that provides a multi-genre spectral analysis of audio files. Rather than a "winner-takes-all" classification, Bit Wave treats music as a blend of influences, identifying the Top 3 most prominent genres within a track. By utilizing a softened softmax distribution (Temperature scaling), the system reveals the nuanced relationship between different musical styles.

    The application accepts .mp3 and .wav formats, processes audio into Mel-frequency cepstral coefficients (MFCCs), and performs inference using a Convolutional Neural Network (CNN).

    We utilized Categorical Crossentropy as our loss function because we are performing multi-class classification across 8+ genres, and the Adam optimizer for its adaptive learning rate properties which helped in faster convergence during the training of the spectral CNN.

## Temporal Averaging: The "Deep Scan" Engine

Unlike standard classifiers that only analyze the first few seconds of a track, Bit Wave utilizes a Temporal Averaging (Chunk-based) approach to ensure accuracy across the entire song.

    How it Works:

        Uniform Sampling: The engine automatically slices the uploaded audio into 10 distinct segments spread evenly across the track's duration using librosa and numpy.linspace.

        Batch Inference: Instead of a single prediction, the model performs a "batch scan," running the CNN on all 10 spectral chunks simultaneously.

        Spectral Consensus: The results are aggregated and averaged. This ensures that an instrumental intro or a quiet bridge doesn't "trick" the AI.

        Global DNA: The final Top 3 results represent the "Global Spectral Profile" of the song, making the classification much more resilient to variations in song structure.

    Why this matters:

        Overcomes Intro Bias: Corrects for long instrumental builds in Pop or Hip-Hop tracks.

        Identifies Mid-Song Shifts: Captures genre-bending elements that might only appear during a chorus or bridge.

        Smoother Confidence Levels: By averaging 10 different windows, the confidence percentages are more nuanced and reflect the actual complexity of the music.

## The "Top 3" Methodology: Why Distribution Beats hard Labels

Most modern tracks are hybrids. A "Winner-Takes-All" system forces the model to pick one label, even if it is only 51% sure, discarding the remaining 49% of the data which contains vital information about the song's texture.

## Advantages of Top 3 Analysis:

    Captures Hybridity: Modern music is almost always a fusion (e.g., Trap-Metal or Synth-Pop).

    Reflects Model Uncertainty: If a song sits on the border between two genres, showing both is more honest than "flipping a coin" for a single label.

    Mathematical Calibration: We use Temperature Scaling (T=2.2) to "soften" the Softmax output. This prevents the model from being over-confident in a single label and instead reveals the subtle secondary and tertiary genre influences that characterize complex tracks.


## Technical Workflow

    Backend (AI/ML Service)

        Audio Processing: Uses Librosa to extract 40 MFCCs across 10 distributed 3-second segments to capture the song's global spectral profile.

        Softened Inference: Implements temperature scaling (T=2.2) on the backend to avoid over-confidence and provide a more realistic "genre mix."

        Ranked Output: Sorts and returns the Top 3 classification results with corresponding confidence percentages via FastAPI.

    Frontend (User Interface)

        Signal Detection: Real-time feedback on audio input and waveform initialization via wavesurfer.js.

        Spectral Visualization: GPU-accelerated canvas visualizers (GSAP) that react to the track's intensity.

        Neural Results: A dynamic results panel that displays the genre hierarchy, allowing users to see the "DNA" of their uploaded music.

## Training Optimization: Early Stopping & Checkpointing

To ensure the Bit Wave engine remains performant and avoids Overfitting, the training pipeline implements an automated Early Stopping callback.

    Patience-Based Termination: The training monitor tracks val_loss (Validation Loss). If the loss does not improve for 10 consecutive epochs, the process terminates automatically. This is why the production model may conclude training before reaching the maximum epoch limit (e.g., stopping at Epoch 20).

    Best-Weights Restoration: Upon termination, the system ignores the final (potentially overfit) weights and instead restores the parameters from the specific epoch that achieved the lowest validation loss.

    Learning Rate Reduction: We utilize a ReduceLROnPlateau callback that cuts the learning rate when the model hits a performance plateau, allowing for finer weight adjustments in the later stages of training.

## Prerequisites

    - Python 3.9+ - 3.10+
    - Bun (install oven-sh/bun/bun)
    - FFmpeg (macOS: brew install ffmpeg, Windows: choco install ffmpeg)

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
        - FMA (small) (Link: https://www.kaggle.com/datasets/imsparsh/fma-free-music-archive-small-medium/data?select=fma_metadata)

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

    Root: 
        - bun install

    Backend: 
        - cd backend
        - macOS: python3 -m venv venv
        - Windows: python -m venv venv
        - macOS: source venv/bin/activate
        - Windows: .\venv\Scripts\activate
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

## Model Training (Sequence)

    1. Prepare Data
        python backend/model/data_preprocessing.py

    2. Train Baseline (comparison tool)
        python backend/model/train_baseline.py

    3. Train Production Model
        python backend/model/train_optimized.py

## Machine Learning Files 
    
    - backend/model/data_preprocessing.py
    - backend/model/train_baseline.py
    - backend/model/train_optimized.py
    - backend/model/evaluations.ipynb
    - backend/model_loader.py
    - backend/main.py

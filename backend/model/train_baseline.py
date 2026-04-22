import os
os.environ["TF_USE_LEGACY_KERAS"] = "1" 
import json
import numpy as np
import tensorflow as tf
import tf_keras as keras
from sklearn.model_selection import train_test_split

# --- AUTO-PATH LOGIC ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "data.json")
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, "baseline_model.h5")

def load_data():
    with open(DATA_PATH, "r") as fp:
        data = json.load(fp)
    return np.array(data["mfcc"]), np.array(data["labels"])

if __name__ == "__main__":
    X, y = load_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    X_train, X_test = X_train[..., np.newaxis], X_test[..., np.newaxis]

    input_shape = (X_train.shape[1], X_train.shape[2], 1)
    
    # BASELINE ARCHITECTURE
    model = keras.Sequential([
        keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        keras.layers.MaxPooling2D((3, 3), strides=(2, 2), padding='same'),
        
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((3, 3), strides=(2, 2), padding='same'),
        
        keras.layers.Flatten(),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dense(16, activation='softmax') # CHANGED TO 8 FOR FMA
    ])

    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    print("Training Baseline (FMA 8-Genre)...")
    model.fit(X_train, y_train, validation_data=(X_test, y_test), batch_size=32, epochs=30)
    
    model.save(MODEL_SAVE_PATH)
    print(f"Baseline saved to {MODEL_SAVE_PATH}")
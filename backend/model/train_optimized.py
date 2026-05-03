import os
os.environ["TF_USE_LEGACY_KERAS"] = "1" 
import json
import numpy as np
import tensorflow as tf
import tf_keras as keras
from sklearn.model_selection import train_test_split

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "data.json")
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, "optimized_model.h5")

def load_data():
    with open(DATA_PATH, "r") as fp:
        data = json.load(fp)
    return np.array(data["mfcc"]), np.array(data["labels"])

if __name__ == "__main__":
    X, y = load_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    X_train, X_test = X_train[..., np.newaxis], X_test[..., np.newaxis]

    input_shape = (X_train.shape[1], X_train.shape[2], 1)
    
    model = keras.Sequential([
        # Layer 1
        keras.layers.Conv2D(64, (3, 3), activation='relu', input_shape=input_shape),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((3, 3), strides=(2, 2), padding='same'),
        
        # Layer 2
        keras.layers.Conv2D(128, (3, 3), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((3, 3), strides=(2, 2), padding='same'),
        
        # Layer 3
        keras.layers.Conv2D(256, (2, 2), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2), strides=(2, 2), padding='same'),
        
        # Classifier
        keras.layers.Flatten(),
        keras.layers.Dense(256, activation='relu'),
        keras.layers.Dropout(0.4), # Prevents overfitting
        keras.layers.Dense(16, activation='softmax') 
    ])

    # Slower learning rate for better precision
    optimizer = keras.optimizers.Adam(learning_rate=0.0001)
    model.compile(optimizer=optimizer, loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    print("Training Optimized Model (FMA 8-Genre)...")
    model.fit(X_train, y_train, 
              validation_data=(X_test, y_test), 
              batch_size=16, 
              epochs=50)
    
    model.save(MODEL_SAVE_PATH)
    print(f"Optimized model saved to {MODEL_SAVE_PATH}")
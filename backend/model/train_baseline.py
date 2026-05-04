import os
import json
import random
import numpy as np

os.environ["TF_USE_LEGACY_KERAS"] = "1"

import tensorflow as tf
import tf_keras as keras
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "data.json")
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, "baseline_model.h5")
SEED = 42

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Missing data.json at: {DATA_PATH}")
    with open(DATA_PATH, "r") as fp:
        data = json.load(fp)
    return np.array(data["mfcc"]), np.array(data["labels"])

if __name__ == "__main__":
    keras.utils.set_random_seed(SEED)
    random.seed(SEED)
    np.random.seed(SEED)

    print("--- Loading Data ---")
    X, y = load_data()
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        stratify=y,
        random_state=SEED,
    )
    
    # CNN Shape: (Samples, Time Steps, MFCC bins, 1)
    X_train = X_train[..., np.newaxis]
    X_test = X_test[..., np.newaxis]
    
    input_shape = (X_train.shape[1], X_train.shape[2], 1)

    # Building Model using the tf_keras bridge
    model = keras.Sequential([
        keras.layers.Conv2D(32, (3, 3), activation="relu", input_shape=input_shape),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((3, 3), strides=(2, 2), padding="same"),
        
        keras.layers.Conv2D(64, (3, 3), activation="relu"),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((3, 3), strides=(2, 2), padding="same"),
        
        keras.layers.Flatten(),
        keras.layers.Dense(128, activation="relu"),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(16, activation="softmax")  # Assuming 16 genres
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    present_classes = np.unique(y_train)
    class_weights = compute_class_weight(
        class_weight="balanced",
        classes=present_classes,
        y=y_train,
    )
    class_weight = {i: 1.0 for i in range(16)}
    for c, w in zip(present_classes, class_weights):
        class_weight[int(c)] = float(w)

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=6,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-6,
        ),
    ]

    print("--- Starting Training ---")
    model.fit(
        X_train,
        y_train,
        validation_data=(X_test, y_test),
        batch_size=32,
        epochs=30,
        shuffle=True,
        callbacks=callbacks,
        class_weight=class_weight,
    )

    model.save(MODEL_SAVE_PATH)
    print(f"--- Model Saved Successfully at {MODEL_SAVE_PATH} ---")
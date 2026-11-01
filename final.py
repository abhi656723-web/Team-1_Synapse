import numpy as np
import xgboost as xgb
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Input
import joblib
import os


def train_final_production(npz_filepath='final_production_arrays.npz',
                           output_xgb_path='final_production_xgb.pkl',
                           output_lstm_path='final_production_lstm.keras'):

    if not os.path.exists(npz_filepath):
        raise FileNotFoundError(
            f"Cannot find '{npz_filepath}'. Run 'preprocess_final_production.py' first.")

    print(f"Loading 100% of the dataset from '{npz_filepath}'...")
    data = np.load(npz_filepath)
    X_seq_full = data['X_seq_full']
    X_static_full = data['X_static_full']
    y_full = data['y_full']

    print("\nBuilding and training the FINAL LSTM feature extractor...")
    lstm_model = Sequential([
        Input(shape=(X_seq_full.shape[1], X_seq_full.shape[2])),
        LSTM(64, activation='relu', return_sequences=False),
        Dense(32, activation='relu', name='lstm_embedding_layer'),
        Dense(1, activation='linear')
    ])

    lstm_model.compile(optimizer='adam', loss='mse')

    # We train on all data. The 10% validation split here is just to monitor the loss metric during training.
    lstm_model.fit(X_seq_full, y_full, epochs=5, batch_size=64,
                   validation_split=0.1, verbose=1)

    print("\nExtracting final sequential embeddings...")
    feature_extractor = Model(inputs=lstm_model.inputs, outputs=lstm_model.get_layer(
        'lstm_embedding_layer').output)
    lstm_full_features = feature_extractor.predict(X_seq_full)

    print("\nFusing features and training FINAL XGBoost model (This may take a moment)...")
    X_hybrid_full = np.hstack((X_static_full, lstm_full_features))

    xgb_model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.08,
        max_depth=8,
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_hybrid_full, y_full)

    # Save the ultimate production models
    joblib.dump(xgb_model, output_xgb_path)
    feature_extractor.save(output_lstm_path)

    print("\n" + "="*55)
    print(" SUCCESS! Final Production Models Saved.")
    print(f" XGBoost: {output_xgb_path}")
    print(f" LSTM Extractor: {output_lstm_path}")
    print("="*55)


if __name__ == "__main__":
    train_final_production()

import numpy as np
import xgboost as xgb
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Input
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os


def train_hybrid_model(npz_filepath, output_model_path, output_extractor_path):
    if not os.path.exists(npz_filepath):
        raise FileNotFoundError(
            f"Cannot find '{npz_filepath}'. Run the Fold 2 preprocessing script first.")

    print(f"Loading Fold 2 arrays from '{npz_filepath}'...")
    data = np.load(npz_filepath)
    X_seq_train = data['X_seq_train']
    X_seq_test = data['X_seq_test']
    X_static_train = data['X_static_train']
    X_static_test = data['X_static_test']
    y_train = data['y_train']
    y_test = data['y_test']

    print(f"LSTM Input Shape: {X_seq_train.shape}")
    print(f"XGBoost Static Input Shape: {X_static_train.shape}")

    print("\nBuilding and training the LSTM feature extractor (Years 2020-2022)...")
    lstm_model = Sequential([
        Input(shape=(X_seq_train.shape[1], X_seq_train.shape[2])),
        LSTM(64, activation='relu', return_sequences=False),
        Dense(32, activation='relu', name='lstm_embedding_layer'),
        Dense(1, activation='linear')
    ])

    lstm_model.compile(optimizer='adam', loss='mse')
    lstm_model.fit(X_seq_train, y_train, epochs=5,
                   batch_size=64, validation_split=0.2, verbose=1)

    print("\nExtracting sequential embeddings from the LSTM...")
    # Updated to use .inputs to comply with Keras 3
    feature_extractor = Model(inputs=lstm_model.inputs, outputs=lstm_model.get_layer(
        'lstm_embedding_layer').output)

    lstm_train_features = feature_extractor.predict(X_seq_train)
    lstm_test_features = feature_extractor.predict(X_seq_test)

    print("\nFusing LSTM memory with static infrastructure features...")
    X_hybrid_train = np.hstack((X_static_train, lstm_train_features))
    X_hybrid_test = np.hstack((X_static_test, lstm_test_features))

    print("\nTraining final XGBoost model...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.08,
        max_depth=8,
        random_state=42,
        n_jobs=-1
    )

    xgb_model.fit(X_hybrid_train, y_train)

    print("\nEvaluating Hybrid Model on 2023 Test Data...")
    hybrid_preds = xgb_model.predict(X_hybrid_test)

    mae = mean_absolute_error(y_test, hybrid_preds)
    rmse = np.sqrt(mean_squared_error(y_test, hybrid_preds))
    r2 = r2_score(y_test, hybrid_preds)

    print("\n" + "=" * 55)
    print("      HYBRID MODEL TEST PERFORMANCE (FOLD 2: 2023)")
    print("=" * 55)
    print(f" Mean Absolute Error (MAE) : {mae:.2f} minutes")
    print(f" Root Mean Sq Error (RMSE) : {rmse:.2f} minutes")
    print(f" R² Score                  : {r2:.4f}")
    print("=" * 55)

    joblib.dump(xgb_model, output_model_path)
    print(f"\nFinal hybrid XGBoost model saved to '{output_model_path}'")

    feature_extractor.save(output_extractor_path)
    print(f"LSTM feature extractor saved to '{output_extractor_path}'")


if __name__ == "__main__":
    train_hybrid_model(
        npz_filepath='fold_2_arrays.npz',
        output_model_path='hybrid_xgb_model_fold_2.pkl',
        output_extractor_path='lstm_feature_extractor_fold_2.keras'
    )

import numpy as np
import xgboost as xgb
from tensorflow.keras.models import load_model
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    explained_variance_score,
    max_error,
    median_absolute_error
)
import joblib
import os


def run_performance_analysis(
    npz_filepath='fold_3_arrays.npz',
    xgb_path='hybrid_xgb_model_fold_3.pkl',
    lstm_path='lstm_feature_extractor_fold_3.keras'
):
    print("Loading test data and models for performance analysis...")

    # 1. Load Data
    data = np.load(npz_filepath)
    X_seq_test = data['X_seq_test']
    X_static_test = data['X_static_test']
    y_true = data['y_test']  # The actual delays

    # 2. Load Models
    xgb_model = joblib.load(xgb_path)
    feature_extractor = load_model(lstm_path)

    # 3. Generate Predictions
    print("Generating predictions on unseen 2024 data...")
    lstm_test_features = feature_extractor.predict(X_seq_test)
    X_hybrid_test = np.hstack((X_static_test, lstm_test_features))
    y_pred = xgb_model.predict(X_hybrid_test)

    # 4. Calculate Advanced Metrics
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    evs = explained_variance_score(y_true, y_pred)
    med_ae = median_absolute_error(y_true, y_pred)
    max_err = max_error(y_true, y_pred)

    # 5. Display Scoreboard
    print("\n" + "="*60)
    print("        COMPREHENSIVE PERFORMANCE ANALYSIS (FOLD 3)")
    print("="*60)
    print(f" 1. R² Score                  : {r2:.4f}")
    print(f"    (Explains {r2*100:.1f}% of the variance in train delays)")
    print(f" 2. Explained Variance Score  : {evs:.4f}")
    print(f"    (Checks if the model captures the underlying trend)")
    print(f" 3. Mean Absolute Error (MAE) : {mae:.4f}")
    print(f"    (Average prediction error)")
    print(f" 4. Median Absolute Error     : {med_ae:.4f}")
    print(f"    (Error excluding extreme outliers)")
    print(f" 5. Root Mean Sq Error (RMSE) : {rmse:.4f}")
    print(f"    (Penalizes larger errors more heavily)")
    print(f" 6. Maximum Error             : {max_err:.4f}")
    print(f"    (The single worst prediction the model made)")
    print("="*60)

    print("\nNote: These metrics are currently in the scaled (0 to 1) format.")


if __name__ == "__main__":
    run_performance_analysis()

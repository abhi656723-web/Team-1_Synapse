import pandas as pd
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


def run_real_minutes_performance_analysis(
    csv_filepath='advanced_train_delay_dataset_5_years.csv',
    npz_filepath='fold_3_arrays.npz',
    xgb_path='hybrid_xgb_model_fold_3.pkl',
    lstm_path='lstm_feature_extractor_fold_3.keras'
):
    print("Loading original dataset to find the exact delay scale...")
    # 1. Find the min and max delays from the Fold 3 training years to unscale the data
    df = pd.read_csv(csv_filepath)
    date_col = 'date' if 'date' in df.columns else 'journey_start_date'
    df[date_col] = pd.to_datetime(df[date_col])

    # Fold 3 was trained on 2020-2023
    train_df = df[df[date_col].dt.year.isin([2020, 2021, 2022, 2023])]
    delay_min = train_df['target_arrival_delay_min'].min()
    delay_max = train_df['target_arrival_delay_min'].max()

    print(f"Delay Scale Range: {delay_min} to {delay_max} minutes")

    # 2. Load Fold 3 Test Data & Models
    print("\nLoading Fold 3 test data and models...")
    data = np.load(npz_filepath)
    X_seq_test = data['X_seq_test']
    X_static_test = data['X_static_test']
    y_true_scaled = data['y_test']  # Currently 0 to 1

    xgb_model = joblib.load(xgb_path)
    feature_extractor = load_model(lstm_path)

    # 3. Generate Scaled Predictions
    print("Generating predictions on unseen 2024 data...")
    lstm_test_features = feature_extractor.predict(X_seq_test)
    X_hybrid_test = np.hstack((X_static_test, lstm_test_features))
    y_pred_scaled = xgb_model.predict(X_hybrid_test)

    # 4. Unscale back to REAL-WORLD MINUTES
    print("Converting scaled predictions back into actual minutes...")
    y_true_minutes = (y_true_scaled * (delay_max - delay_min)) + delay_min
    y_pred_minutes = (y_pred_scaled * (delay_max - delay_min)) + delay_min

    # 5. Calculate Advanced Metrics on REAL MINUTES
    mae = mean_absolute_error(y_true_minutes, y_pred_minutes)
    mse = mean_squared_error(y_true_minutes, y_pred_minutes)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true_minutes, y_pred_minutes)
    evs = explained_variance_score(y_true_minutes, y_pred_minutes)
    med_ae = median_absolute_error(y_true_minutes, y_pred_minutes)
    max_err = max_error(y_true_minutes, y_pred_minutes)

    # 6. Display Real-World Scoreboard
    print("\n" + "="*60)
    print("      REAL-WORLD PERFORMANCE ANALYSIS (FOLD 3: 2024)")
    print("="*60)
    print(f" 1. R² Score                  : {r2:.4f}")
    print(f"    (Explains {r2*100:.1f}% of the variance in train delays)")
    print(f" 2. Explained Variance Score  : {evs:.4f}")
    print(f" 3. Mean Absolute Error (MAE) : {mae:.2f} minutes")
    print(f"    (Average prediction error)")
    print(f" 4. Median Absolute Error     : {med_ae:.2f} minutes")
    print(f"    (Error on a 'normal' day, ignoring extremes)")
    print(f" 5. Root Mean Sq Error (RMSE) : {rmse:.2f} minutes")
    print(f"    (Heavily penalizes massive misses)")
    print(f" 6. Maximum Error             : {max_err:.2f} minutes")
    print(f"    (The single worst guess out of all 2024 predictions)")
    print("="*60)


if __name__ == "__main__":
    run_real_minutes_performance_analysis()

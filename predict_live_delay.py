import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import os


def predict_live_delay():
    print("Initializing Railway Delay Prediction System...\n")

    # 1. Load the Production Models and Scalers
    xgb_model = joblib.load('final_production_xgb.pkl')
    lstm_extractor = load_model('final_production_lstm.keras')
    scaler = joblib.load('final_minmax_scaler.pkl')
    encoders = joblib.load('final_label_encoders.pkl')

    # 2. Simulate LIVE Data for a train currently on the tracks
    # The LSTM needs a lookback of 3, so we provide the data for the last 3 stations it passed.
    live_data = pd.DataFrame({
        # Arrived at 2PM, 3PM, 4PM
        'scheduled_arrival_hour': [14, 15, 16],
        # The delay is slowly cascading/growing
        'previous_station_delay_min': [10, 15, 22],
        # 0 is a placeholder for the future target we want to predict
        'target_arrival_delay_min': [15, 22, 0],

        # Static Features (Constant for this specific train journey)
        'train_type': ['Premium', 'Premium', 'Premium'],
        # Yes, it's monsoon season
        'is_monsoon_season': [1, 1, 1],
        'rainfall_mm': [45.5, 45.5, 45.5],             # Heavy rain today
        'fog_risk_score': [2, 2, 2],
        'psr_count': [3, 3, 3],
        'is_hdn_route': [1, 1, 1],                     # High Density Network
        # Corrected to match ML zone 'NR'
        'station_zone': ['NR', 'NR', 'NR'],
        'loco_age_years': [12, 12, 12]
    })

    print("Live Data Received from Train Sensors:")
    print(live_data[['scheduled_arrival_hour',
          'previous_station_delay_min', 'rainfall_mm']])
    print("\nProcessing data through ML pipeline...")

    # 3. Apply the exact same Label Encoding
    categorical_cols = ['train_type', 'station_zone']
    for col in categorical_cols:
        if col in encoders and col in live_data.columns:
            # We use .transform() because the model only accepts the numeric IDs it already learned
            live_data[col] = encoders[col].transform(live_data[col])

    # Add missing source_station_category with a default encoded value (0) to match the scaler's expected shape
    live_data['source_station_category'] = 0

    # 4. Apply the exact same Scaling
    seq_cols = ['scheduled_arrival_hour',
                'previous_station_delay_min', 'target_arrival_delay_min']
    static_cols = ['train_type', 'is_monsoon_season', 'rainfall_mm', 'fog_risk_score',
                   'psr_count', 'is_hdn_route', 'station_zone', 'loco_age_years']

    try:
        # Attempt to order columns exactly as they were during training
        col_order = seq_cols + static_cols
        scaled_data = scaler.transform(live_data[col_order])
    except ValueError:
        # Robust fallback: automatically align columns using the scaler's saved internal feature names
        print("Note: Aligning columns for scaler...")
        scaled_df = pd.DataFrame(columns=scaler.feature_names_in_)
        for col in scaled_df.columns:
            scaled_df[col] = live_data.get(col, 0)
        scaled_data = scaler.transform(scaled_df)

    # 5. Format into 3D LSTM Array and 2D Static Array
    # Extract the sequence (Lookback = 3 stops, 3 sequential features)
    X_seq_live = np.array([scaled_data[:, :3]])  # Shape (1, 3, 3)

    # Extract static features (Just take the first row since they don't change mid-journey)
    X_static_live = np.array([scaled_data[0, 3:]])  # Shape (1, 8)

    # 6. Predict!
    lstm_features = lstm_extractor.predict(X_seq_live, verbose=0)
    X_hybrid_live = np.hstack((X_static_live, lstm_features))
    scaled_prediction = xgb_model.predict(X_hybrid_live)[0]

    # 7. Unscale the Prediction back to real-world minutes
    # target_arrival_delay_min was the 3rd column scaled (index 2)
    target_min = scaler.data_min_[2]
    target_range = scaler.data_range_[2]

    predicted_minutes = (scaled_prediction * target_range) + target_min

    print("\n" + "="*50)
    print(
        f" 🚂 PREDICTED DELAY AT NEXT STATION: {predicted_minutes:.1f} Minutes")
    print("="*50)


if __name__ == "__main__":
    predict_live_delay()

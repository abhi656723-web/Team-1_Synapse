import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import joblib
import os


def process_final_production(filepath='advanced_train_delay_dataset_5_years.csv', output_file='final_production_arrays.npz', lookback=3):
    print("Loading 100% of dataset for final production model...")
    df = pd.read_csv(filepath)

    df = df.sort_values(
        by=['journey_id', 'stop_sequence']).reset_index(drop=True)

    # 1. Encode Categoricals (Fit on ALL Data)
    categorical_cols = ['train_type',
                        'station_zone', 'source_station_category']
    encoders = {}

    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le

    # Save encoders for future predictions
    joblib.dump(encoders, 'final_label_encoders.pkl')
    print("Label encoders saved to 'final_label_encoders.pkl'")

    # 2. Scale Numerical Data (Fit on ALL Data)
    seq_cols = ['scheduled_arrival_hour',
                'previous_station_delay_min', 'target_arrival_delay_min']
    static_cols = ['train_type', 'is_monsoon_season', 'rainfall_mm', 'fog_risk_score',
                   'psr_count', 'is_hdn_route', 'station_zone', 'loco_age_years']

    scaler = MinMaxScaler()
    df[seq_cols +
        static_cols] = scaler.fit_transform(df[seq_cols + static_cols])

    # Save scaler for future predictions
    joblib.dump(scaler, 'final_minmax_scaler.pkl')
    print("MinMaxScaler saved to 'final_minmax_scaler.pkl'")

    # 3. Windowing Helper Function
    def create_windows(data_subset):
        X_seq, X_static, y = [], [], []
        for journey, group in data_subset.groupby('journey_id'):
            group_seq = group[seq_cols].values
            group_static = group[static_cols].values
            group_targets = group['target_arrival_delay_min'].values

            for i in range(lookback, len(group)):
                X_seq.append(group_seq[i-lookback:i])
                X_static.append(group_static[i])
                y.append(group_targets[i])

        return np.array(X_seq), np.array(X_static), np.array(y)

    # 4. Build Matrices
    print("Generating final 3D sequences and 2D tabular arrays...")
    X_seq_full, X_static_full, y_full = create_windows(df)

    # 5. Save Final Arrays
    np.savez_compressed(output_file,
                        X_seq_full=X_seq_full,
                        X_static_full=X_static_full,
                        y_full=y_full)

    print(f"Final arrays successfully saved to '{output_file}'")


if __name__ == "__main__":
    process_final_production()

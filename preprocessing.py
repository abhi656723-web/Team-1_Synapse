import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import os


def preprocess_and_save_hybrid_dataset(filepath, output_filename='hybrid_preprocessed_arrays.npz', lookback=3):
    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"Cannot find '{filepath}'. Ensure the dataset generator has been run.")

    print(f"Loading '{filepath}' for preprocessing...")
    df = pd.read_csv(filepath)

    # 1. Sort Chronologically
    print("Sorting chronologically by journey and stop sequence...")
    df = df.sort_values(
        by=['journey_id', 'stop_sequence']).reset_index(drop=True)

    # 2. Encode Categoricals
    print("Encoding categorical variables...")
    le = LabelEncoder()
    df['train_type'] = le.fit_transform(df['train_type'])
    df['station_zone'] = le.fit_transform(df['station_zone'])
    df['source_station_category'] = le.fit_transform(
        df['source_station_category'])

    # 3. Define Feature Sets
    seq_cols = ['scheduled_arrival_hour',
                'previous_station_delay_min', 'target_arrival_delay_min']
    static_cols = ['train_type', 'is_monsoon_season', 'rainfall_mm', 'fog_risk_score',
                   'psr_count', 'is_hdn_route', 'station_zone', 'loco_age_years']

    # 4. Scale Numerical Data
    print("Scaling numerical features...")
    scaler = MinMaxScaler()
    df[seq_cols +
        static_cols] = scaler.fit_transform(df[seq_cols + static_cols])

    # 5. Windowing Function (3D and 2D Alignment)
    print("Generating time-series windows (this may take a moment)...")
    X_seq, X_static, y = [], [], []

    # Group by individual train journey
    for journey, group in df.groupby('journey_id'):
        group_seq = group[seq_cols].values
        group_static = group[static_cols].values
        group_targets = group['target_arrival_delay_min'].values

        # Slide the window across the 15 stops
        for i in range(lookback, len(group)):
            # The previous 'lookback' stops (3D Memory Array)
            X_seq.append(group_seq[i-lookback:i])
            # The static features of the current target stop (2D Tabular Array)
            X_static.append(group_static[i])
            # The actual delay of the current target stop
            y.append(group_targets[i])

    X_seq = np.array(X_seq)
    X_static = np.array(X_static)
    y = np.array(y)

    # 6. Synchronous Train/Test Split
    print("Splitting into train and test sets...")
    X_seq_train, X_seq_test, X_static_train, X_static_test, y_train, y_test = train_test_split(
        # False to respect time order
        X_seq, X_static, y, test_size=0.2, random_state=42, shuffle=False
    )

    print(f"X_seq shape (LSTM): {X_seq_train.shape}")
    print(f"X_static shape (XGBoost): {X_static_train.shape}")

    # 7. Save to NPZ file
    np.savez_compressed(output_filename,
                        X_seq_train=X_seq_train, X_seq_test=X_seq_test,
                        X_static_train=X_static_train, X_static_test=X_static_test,
                        y_train=y_train, y_test=y_test)

    print(f"Success! Preprocessed arrays saved to '{output_filename}'")
    return output_filename


if __name__ == "__main__":
    # Ensure your input CSV name matches the one generated in the previous step
    input_csv = 'advanced_train_delay_dataset_5_years.csv'
    preprocess_and_save_hybrid_dataset(input_csv)

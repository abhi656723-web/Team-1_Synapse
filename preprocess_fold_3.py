import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import os


def process_fold_3(filepath='advanced_train_delay_dataset_5_years.csv', output_file='fold_3_arrays.npz', lookback=3):
    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"Cannot find '{filepath}'. Ensure your CSV dataset is in the folder.")

    print("Loading dataset...")
    df = pd.read_csv(filepath)

    date_col = 'date' if 'date' in df.columns else 'journey_start_date'
    df[date_col] = pd.to_datetime(df[date_col])

    df = df.sort_values(
        by=['journey_id', 'stop_sequence']).reset_index(drop=True)

    # 1. Isolate Fold 3 Years (Train: 2020-2023, Test: 2024)
    train_df = df[df[date_col].dt.year.isin([2020, 2021, 2022, 2023])].copy()
    test_df = df[df[date_col].dt.year == 2024].copy()

    print(f"Training on 2020-2023 (Records: {len(train_df):,})")
    print(f"Testing on 2024 (Records: {len(test_df):,})")

    # 2. Encode Categoricals
    categorical_cols = ['train_type',
                        'station_zone', 'source_station_category']
    encoders = {}

    for col in categorical_cols:
        le = LabelEncoder()
        train_df[col] = le.fit_transform(train_df[col])

        test_classes = set(test_df[col].unique())
        train_classes = set(le.classes_)
        test_df[col] = test_df[col].apply(lambda x: le.transform([x])[
                                          0] if x in train_classes else 0)
        encoders[col] = le

    # 3. Scale Numerical Data
    seq_cols = ['scheduled_arrival_hour',
                'previous_station_delay_min', 'target_arrival_delay_min']
    static_cols = ['train_type', 'is_monsoon_season', 'rainfall_mm', 'fog_risk_score',
                   'psr_count', 'is_hdn_route', 'station_zone', 'loco_age_years']

    scaler = MinMaxScaler()
    train_df[seq_cols +
             static_cols] = scaler.fit_transform(train_df[seq_cols + static_cols])
    test_df[seq_cols +
            static_cols] = scaler.transform(test_df[seq_cols + static_cols])

    # 4. Windowing Helper Function
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

    # 5. Build Matrices
    print("Generating 3D sequences and 2D tabular arrays...")
    X_seq_train, X_static_train, y_train = create_windows(train_df)
    X_seq_test, X_static_test, y_test = create_windows(test_df)

    # 6. Save Fold 3 Arrays
    np.savez_compressed(output_file,
                        X_seq_train=X_seq_train, X_seq_test=X_seq_test,
                        X_static_train=X_static_train, X_static_test=X_static_test,
                        y_train=y_train, y_test=y_test)

    print(f"Fold 3 arrays successfully saved to '{output_file}'")


if __name__ == "__main__":
    process_fold_3()

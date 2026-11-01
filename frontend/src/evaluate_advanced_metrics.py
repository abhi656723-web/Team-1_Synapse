import os
import re
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, median_absolute_error


def find_file(candidates):
    for path in candidates:
        if os.path.exists(path):
            return path
    return None


def extract_target_column(df):
    # 1. Inspect existing scripts for target definition
    for script_name in ["evaluate_and_check.py", "train_model.py", os.path.join("..", "evaluate_and_check.py"), os.path.join("..", "train_model.py")]:
        if os.path.exists(script_name):
            try:
                with open(script_name, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                matches = re.findall(
                    r'(?:target|target_col)\s*=\s*["\']([^"\']+)["\']', content)
                if matches and matches[0] in df.columns:
                    return matches[0]
                matches_y = re.findall(
                    r'y\s*=\s*df\[["\']([^"\']+)["\']\]', content)
                if matches_y and matches_y[0] in df.columns:
                    return matches_y[0]
            except Exception:
                pass

    # 2. Heuristic: Target delay column (excluding previous_station and flags)
    candidates = [
        "arrival_delay_min", "arr_delay_min", "arrival_delay", "delay_min",
        "delay_minutes", "actual_delay_min", "station_delay_min", "target_delay"
    ]
    for c in candidates:
        if c in df.columns:
            return c

    delay_cols = [
        c for c in df.columns
        if "delay" in c.lower() and "prev" not in c.lower() and "flag" not in c.lower()
    ]
    if delay_cols:
        return delay_cols[0]

    return None


def engineer_features(df, expected_features):
    # Train and station categorical encodings
    if "train_num_cat" in expected_features and "train_num_cat" not in df.columns:
        train_col = "train_number" if "train_number" in df.columns else "train_no"
        if train_col in df.columns:
            df["train_num_cat"] = df[train_col].astype("category").cat.codes

    if "station_code_cat" in expected_features and "station_code_cat" not in df.columns:
        stn_col = "station_code" if "station_code" in df.columns else "station"
        if stn_col in df.columns:
            df["station_code_cat"] = df[stn_col].astype("category").cat.codes

    # Datetime feature engineering
    date_col = next(
        (c for c in df.columns if "date" in c.lower() or "day" in c.lower()), None)
    if date_col and df[date_col].dtype == object:
        dt_series = pd.to_datetime(df[date_col], errors="coerce")
        if "day_of_year" in expected_features and "day_of_year" not in df.columns:
            df["day_of_year"] = dt_series.dt.dayofyear
        if "month_num" in expected_features and "month_num" not in df.columns:
            df["month_num"] = dt_series.dt.month
        if "day_of_week_num" in expected_features and "day_of_week_num" not in df.columns:
            df["day_of_week_num"] = dt_series.dt.dayofweek
        if "quarter" in expected_features and "quarter" not in df.columns:
            df["quarter"] = dt_series.dt.quarter
        if "is_weekend_flag" in expected_features and "is_weekend_flag" not in df.columns:
            df["is_weekend_flag"] = dt_series.dt.dayofweek.isin(
                [5, 6]).astype(int)

    # Scheduled arrival hour
    sched_col = next((c for c in df.columns if "sched" in c.lower()
                     or "arr" in c.lower() or "time" in c.lower()), None)
    if sched_col and "sched_hour" in expected_features and "sched_hour" not in df.columns:
        if pd.api.types.is_numeric_dtype(df[sched_col]):
            df["sched_hour"] = df[sched_col]
        else:
            time_dt = pd.to_datetime(
                df[sched_col].astype(str), errors="coerce")
            df["sched_hour"] = time_dt.dt.hour.fillna(12).astype(int)

    # Fallback fill for any other missing numeric features
    for col in expected_features:
        if col not in df.columns:
            df[col] = 0

    return df


def run_evaluation():
    data_path = find_file([
        "train_delay_master_dataset_zero_leakage.csv",
        os.path.join("..", "train_delay_master_dataset_zero_leakage.csv"),
        os.path.join("..", "..", "train_delay_master_dataset_zero_leakage.csv")
    ])
    model_path = find_file([
        "future_delay_model.pkl",
        os.path.join("..", "future_delay_model.pkl"),
        os.path.join("..", "..", "future_delay_model.pkl")
    ])

    if not data_path or not model_path:
        print(
            f"[ERROR] Could not find dataset ({data_path}) or model ({model_path}).")
        return

    print("=" * 88)
    print("           SYNAPSE MODEL ADVANCED PERFORMANCE & DIRECTIONAL EVALUATION           ")
    print("=" * 88)
    print(f" Loaded Dataset : {data_path}")
    print(f" Loaded Model   : {model_path}")

    df = pd.read_csv(data_path)
    bundle = joblib.load(model_path)
    model = bundle["model"] if isinstance(
        bundle, dict) and "model" in bundle else bundle

    # Resolve features expected by the fitted model
    if hasattr(model, "feature_names_in_"):
        expected_features = list(model.feature_names_in_)
    elif isinstance(bundle, dict) and "features" in bundle:
        expected_features = bundle["features"]
    else:
        expected_features = [c for c in df.columns if "delay" not in c.lower()]

    target_col = extract_target_column(df)
    print(f" Target Column  : '{target_col}'")
    print(
        f" Feature Count  : {len(expected_features)} inputs aligned with model")

    # Engineer missing categorical and time features
    df = engineer_features(df, expected_features)

    X = df[expected_features]
    y = df[target_col]

    # Strict 80/20 Train-Test Holdout
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, df.index, test_size=0.20, random_state=42, shuffle=True
    )

    test_df = df.loc[idx_test].copy()
    y_pred = model.predict(X_test)
    test_df["actual"] = y_test.values
    test_df["predicted"] = y_pred
    test_df["abs_error"] = np.abs(test_df["actual"] - test_df["predicted"])
    test_df["signed_error"] = test_df["predicted"] - test_df["actual"]

    # Directional / Trend Accuracy (Relative to corridor mean delay)
    tr_id = "train_number" if "train_number" in test_df.columns else (
        "train_num_cat" if "train_num_cat" in test_df.columns else None)
    if tr_id:
        baseline = test_df.groupby(tr_id)["actual"].transform("mean")
    else:
        baseline = test_df["actual"].mean()

    actual_trend = (test_df["actual"] >= baseline).astype(int)
    predicted_trend = (test_df["predicted"] >= baseline).astype(int)
    directional_acc = np.mean(actual_trend == predicted_trend) * 100.0

    # Summary Metrics
    mae = mean_absolute_error(y_test, y_pred)
    medae = median_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    non_zero = test_df["actual"] > 2.0
    mape = (np.mean(test_df.loc[non_zero, "abs_error"] /
            test_df.loc[non_zero, "actual"])) * 100.0 if non_zero.sum() > 0 else 0.0

    acc_5 = (test_df["abs_error"] <= 5.0).mean() * 100.0
    acc_10 = (test_df["abs_error"] <= 10.0).mean() * 100.0
    acc_15 = (test_df["abs_error"] <= 15.0).mean() * 100.0
    acc_30 = (test_df["abs_error"] <= 30.0).mean() * 100.0

    print("\n" + "-" * 88)
    print("                        OVERALL GLOBAL BENCHMARK METRICS                        ")
    print("-" * 88)
    print(f" Holdout Test Records        : {len(test_df):,}")
    print(
        f" Directional Trend Accuracy  : {directional_acc:.2f}% (Correct Above/Below Normal)")
    print(
        f" Coefficient of Det. (R²)    : {r2:.4f} ({r2*100:.2f}% Variance Explained)")
    print(f" Mean Absolute Error (MAE)   : {mae:.2f} minutes")
    print(f" Median Absolute Error       : {medae:.2f} minutes")
    print(f" Root Mean Sq. Error (RMSE)  : {rmse:.2f} minutes")
    print(f" Mean Absolute Pct Err (MAPE): {mape:.2f}%")
    print(f" Punctuality Window (±5 min) : {acc_5:.2f}%")
    print(f" Buffer Window     (±10 min) : {acc_10:.2f}%")
    print(f" Operating Punct   (±15 min) : {acc_15:.2f}%")
    print(f" Wide Tolerance    (±30 min) : {acc_30:.2f}%")

    # Corridor Breakdown
    if tr_id:
        print("\n" + "=" * 88)
        print("                    CORRIDOR-LEVEL ACCURACY BREAKDOWN                           ")
        print("=" * 88)
        print(f"{'Train':<10} {'Holdout N':<12} {'MAE':<10} {'MedAE':<10} {'RMSE':<10} {'R²':<10} {'±15m Acc':<10} {'Dir. Acc'}")
        print("-" * 88)

        for tr, grp in test_df.groupby(tr_id):
            tr_mae = mean_absolute_error(grp["actual"], grp["predicted"])
            tr_medae = median_absolute_error(grp["actual"], grp["predicted"])
            tr_rmse = np.sqrt(mean_squared_error(
                grp["actual"], grp["predicted"]))
            tr_r2 = r2_score(grp["actual"], grp["predicted"]
                             ) if len(grp) > 1 else 0.0
            tr_acc15 = (grp["abs_error"] <= 15.0).mean() * 100.0
            tr_mean = grp["actual"].mean()
            tr_dir = np.mean((grp["actual"] >= tr_mean) == (
                grp["predicted"] >= tr_mean)) * 100.0
            print(f"{str(tr):<10} {len(grp):<12} {tr_mae:<10.2f} {tr_medae:<10.2f} {tr_rmse:<10.2f} {tr_r2:<10.4f} {tr_acc15:<9.1f}% {tr_dir:.1f}%")

    # Actual vs Predicted Head-to-Head Comparison
    print("\n" + "=" * 88)
    print("                HEAD-TO-HEAD SAMPLE COMPARISON (FIRST 15 TEST TRIPS)            ")
    print("=" * 88)
    sample = test_df[["actual", "predicted",
                      "abs_error", "signed_error"]].head(15)
    print(f"{'Trip Index':<12} {'Actual Delay':<16} {'Predicted Delay':<18} {'Absolute Error':<16} {'Status'}")
    print("-" * 88)
    for idx, row in sample.iterrows():
        status = "🟢 Precise (≤5m)" if row["abs_error"] <= 5 else (
            "🟡 Buffer (≤15m)" if row["abs_error"] <= 15 else "🔴 Deviation (>15m)")
        print(
            f"{idx:<12} {row['actual']:>6.1f} min        {row['predicted']:>6.1f} min          {row['abs_error']:>6.2f} min      {status}")
    print("=" * 88)


if __name__ == "__main__":
    run_evaluation()

"""Synapse FastAPI backend.
The existing XGBoost + LSTM prediction pipeline is intentionally preserved.
Additional feedback/actual-delay records are stored in a local SQLite database.
"""
from tensorflow.keras.models import load_model
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import json
import sqlite3
import os
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")


BASE_DIR = Path(__file__).resolve().parent.parent
XGB_PATH = BASE_DIR / "final_production_xgb.pkl"
LSTM_PATH = BASE_DIR / "final_production_lstm.keras"
SCALER_PATH = BASE_DIR / "final_minmax_scaler.pkl"
ENCODERS_PATH = BASE_DIR / "final_label_encoders.pkl"
DB_PATH = BASE_DIR / "synapse_feedback.db"
COACH_DATA_PATH = Path(__file__).resolve().parent / "coach_compositions.json"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            comment TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
        )""")
        conn.execute("""CREATE TABLE IF NOT EXISTS actual_delays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            train_number TEXT NOT NULL,
            station_code TEXT NOT NULL,
            journey_date TEXT NOT NULL,
            predicted_delay REAL NOT NULL,
            actual_delay REAL NOT NULL,
            absolute_error REAL NOT NULL,
            created_at TEXT NOT NULL
        )""")


class PredictionRequest(BaseModel):
    train_number: str = Field(min_length=1, max_length=20)
    station_code: str = Field(min_length=1, max_length=20)
    journey_date: str


class PredictionResponse(BaseModel):
    predicted_delay_minutes: float
    status_advisory: str
    factors: list


class RatingRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=1000)


class ActualDelayRequest(BaseModel):
    train_number: str = Field(min_length=1, max_length=20)
    station_code: str = Field(min_length=1, max_length=20)
    journey_date: str
    predicted_delay_minutes: float = Field(ge=0)
    actual_delay_minutes: float = Field(ge=0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    required = [XGB_PATH, LSTM_PATH, SCALER_PATH, ENCODERS_PATH]
    missing = [str(p) for p in required if not p.exists()]
    if missing:
        raise RuntimeError(
            "Missing ML artifact file(s): " + ", ".join(missing))
    app.state.xgb_model = joblib.load(XGB_PATH)
    app.state.lstm_extractor = load_model(LSTM_PATH)
    app.state.scaler = joblib.load(SCALER_PATH)
    app.state.encoders = joblib.load(ENCODERS_PATH)
    yield


app = FastAPI(title="Synapse AI Train Delay API",
              version="1.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[
                   "*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "Synapse API"}


@app.get("/coach-composition/{train_number}")
def get_coach_composition(train_number: str):
    """Return verified coach sequence for a train, or an honest unavailable response.

    Populate coach_compositions.json only with verified, train-specific data.
    This endpoint deliberately does not infer or fabricate coach sequences.
    """
    if not train_number.isdigit() or len(train_number) > 10:
        raise HTTPException(status_code=400, detail="Invalid train number.")

    if not COACH_DATA_PATH.exists():
        return {
            "train_number": train_number,
            "available": False,
            "coach_type": None,
            "last_updated": None,
            "source": None,
            "coaches": [],
            "message": "Coach composition currently unavailable for this train."
        }

    try:
        with COACH_DATA_PATH.open("r", encoding="utf-8") as file:
            records = json.load(file)
    except (OSError, json.JSONDecodeError):
        raise HTTPException(
            status_code=500, detail="Coach composition data file is invalid.")

    record = records.get(train_number) if isinstance(records, dict) else None
    if not isinstance(record, dict) or not isinstance(record.get("coaches"), list) or not record["coaches"]:
        return {
            "train_number": train_number,
            "available": False,
            "coach_type": None,
            "last_updated": None,
            "source": None,
            "coaches": [],
            "message": "Coach composition currently unavailable for this train."
        }

    # Validate sequence fields before returning data to the frontend.
    coaches = []
    for item in record["coaches"]:
        if not isinstance(item, dict) or not isinstance(item.get("position"), int):
            continue
        if not (item.get("coach_number") or item.get("designation")):
            continue
        coaches.append({
            "position": item["position"],
            "coach_number": str(item.get("coach_number") or item.get("designation")),
            "designation": str(item.get("designation") or ""),
            "category": str(item.get("category") or "")
        })
    coaches.sort(key=lambda coach: coach["position"])

    if not coaches:
        return {
            "train_number": train_number, "available": False, "coach_type": None,
            "last_updated": None, "source": None, "coaches": [],
            "message": "Coach composition currently unavailable for this train."
        }

    return {
        "train_number": train_number,
        "available": True,
        "coach_type": record.get("coach_type"),
        "last_updated": record.get("last_updated"),
        "source": record.get("source"),
        "coaches": coaches
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_delay(request: PredictionRequest):
    try:
        dt = datetime.strptime(request.journey_date.strip(), "%Y-%m-%d")
        month = dt.month
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Existing seasonal/context rules retained. These are NOT live weather readings.
    factors = []
    is_monsoon = 1 if month in [6, 7, 8, 9] else 0
    rainfall = 45.5 if is_monsoon else 0.0
    if is_monsoon:
        factors.append({"title": "Monsoon Weather",
                       "impact": "Seasonal rainfall assumption", "type": "orange"})

    fog = 2 if month in [12, 1, 2] else 0
    if fog > 0:
        factors.append(
            {"title": "Winter Fog", "impact": "Seasonal fog-risk assumption", "type": "orange"})

    is_festival = 1 if month in [10, 11] else 0
    if is_festival:
        factors.append({"title": "Festival Season",
                       "impact": "Calendar-based seasonal indicator", "type": "pink"})

    factors.append({"title": "Network Momentum",
                   "impact": "Fixed historical-sequence placeholder", "type": "purple"})

    # Preserve the original three-row feature construction and model input ordering.
    live_data = pd.DataFrame({
        'scheduled_arrival_hour': [14, 15, 16],
        'previous_station_delay_min': [10.0, 15.0, 22.0],
        'target_arrival_delay_min': [15.0, 22.0, 0.0],
        'train_type': ['Premium'] * 3,
        'is_monsoon_season': [is_monsoon] * 3,
        'rainfall_mm': [rainfall] * 3,
        'fog_risk_score': [fog] * 3,
        'psr_count': [3] * 3,
        'is_hdn_route': [1] * 3,
        'station_zone': ['NR'] * 3,
        'loco_age_years': [12] * 3
    })

    encoders = app.state.encoders
    scaler = app.state.scaler
    for col in ['train_type', 'station_zone']:
        if col in encoders:
            try:
                live_data[col] = encoders[col].transform(live_data[col])
            except ValueError:
                # Preserve original fallback behavior.
                live_data[col] = encoders[col].transform(['NR'] * 3)

    live_data['source_station_category'] = 0
    scaled_df = pd.DataFrame(columns=scaler.feature_names_in_)
    for col in scaled_df.columns:
        scaled_df[col] = live_data.get(col, 0)
    scaled_data = scaler.transform(scaled_df)

    X_seq_live = np.array([scaled_data[:, :3]])
    X_static_live = np.array([scaled_data[0, 3:]])
    lstm_features = app.state.lstm_extractor.predict(X_seq_live, verbose=0)
    X_hybrid_live = np.hstack((X_static_live, lstm_features))
    scaled_prediction = app.state.xgb_model.predict(X_hybrid_live)[0]
    target_min = scaler.data_min_[2]
    target_range = scaler.data_range_[2]
    predicted_minutes = (scaled_prediction * target_range) + target_min
    final_delay = max(0.0, round(float(predicted_minutes), 1))

    if final_delay > 60:
        advisory = "SEVERE DELAY (> 1 hr). System cascade detected."
    elif final_delay > 20:
        advisory = "MODERATE DELAY. Typical for current conditions."
    else:
        advisory = "ON TIME / MINIMAL DELAY (< 20 mins)."
    return PredictionResponse(predicted_delay_minutes=final_delay, status_advisory=advisory, factors=factors)


@app.post("/feedback")
def submit_feedback(request: RatingRequest):
    created = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.execute("INSERT INTO ratings(rating, comment, created_at) VALUES (?, ?, ?)",
                              (request.rating, request.comment.strip(), created))
        feedback_id = cursor.lastrowid
    return {"saved": True, "feedback_id": feedback_id, "message": "Thank you for your feedback."}


@app.post("/actual-delay")
def submit_actual_delay(request: ActualDelayRequest):
    try:
        datetime.strptime(request.journey_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400, detail="journey_date must use YYYY-MM-DD.")
    error = round(abs(request.predicted_delay_minutes -
                  request.actual_delay_minutes), 2)
    created = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.execute("""INSERT INTO actual_delays
            (train_number, station_code, journey_date, predicted_delay, actual_delay, absolute_error, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
                              (request.train_number, request.station_code, request.journey_date,
                               request.predicted_delay_minutes, request.actual_delay_minutes, error, created))
        record_id = cursor.lastrowid
    return {"saved": True, "record_id": record_id, "absolute_error_minutes": error}


@app.get("/analytics")
def get_analytics():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT predicted_delay, actual_delay, absolute_error FROM actual_delays").fetchall()
    if not rows:
        return {"count": 0, "message": "No actual-delay observations have been submitted yet."}
    predicted = np.array([r["predicted_delay"] for r in rows], dtype=float)
    actual = np.array([r["actual_delay"] for r in rows], dtype=float)
    errors = predicted - actual
    return {
        "count": int(len(rows)),
        "mae_minutes": round(float(np.mean(np.abs(errors))), 2),
        "rmse_minutes": round(float(np.sqrt(np.mean(errors ** 2))), 2),
        "r2": (round(float(1 - (np.sum(errors ** 2) / np.sum((actual - np.mean(actual)) ** 2))), 4) if len(actual) > 1 and np.sum((actual - np.mean(actual)) ** 2) > 0 else None),
        "note": "Calculated from user-submitted actual-delay observations; not a held-out test-set score."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

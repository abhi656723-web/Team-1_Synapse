"""
Main FastAPI application for AI Train Delay Prediction.

This module sets up:
1. One-time model loading at startup using the lifespan context manager.
2. CORS configuration for the React frontend.
3. Diagnostic routes (GET / and GET /health).
4. Prediction route (POST /predict) which uses future_delay_model.pkl and
   the exact feature preprocessing logic from predict.py.
"""

from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Union, Dict, Any, List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd


# ---------------------------------------------------------------------------
# 1. Model File Path Resolution
# ---------------------------------------------------------------------------
# Dynamically locate future_delay_model.pkl located in the project root directory
# (one level above this backend folder). This avoids hardcoding paths and works
# consistently regardless of the working directory where the server is launched.
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "future_delay_model.pkl"


# ---------------------------------------------------------------------------
# 2. Helper Functions (Reused from predict.py)
# ---------------------------------------------------------------------------
def add_minutes_to_time(time_str: str, delay_mins: float) -> str:
    """
    Calculates actual clock time by adding predicted delay (in minutes)
    to a scheduled time string ('HH:MM').
    Returns 'N/A' if time is missing or cannot be parsed.
    """
    if pd.isna(time_str) or str(time_str).strip() in ['—', '-', '', 'nan', 'None']:
        return "N/A"
    try:
        t = datetime.strptime(str(time_str).strip(), "%H:%M")
        actual_t = t + timedelta(minutes=float(delay_mins))
        return actual_t.strftime("%H:%M")
    except Exception:
        return "N/A"


# ---------------------------------------------------------------------------
# 3. Pydantic Schemas for Input Validation & Output Serialization
# ---------------------------------------------------------------------------
class PredictionRequest(BaseModel):
    train_number: Union[int, str] = Field(
        ...,
        description="Train number or identifier (e.g. 12002 or '12002')",
        examples=[12002]
    )
    station_code: str = Field(
        ...,
        description="IRCTC Station code (e.g. 'BPL', 'NDLS', 'AGC')",
        examples=["BPL"]
    )
    journey_date: str = Field(
        ...,
        description="Date of journey in YYYY-MM-DD format (e.g. '2026-09-22')",
        examples=["2026-09-22"]
    )


class PredictionResponse(BaseModel):
    train_number: str = Field(..., description="Train number")
    train_name: str = Field(..., description="Full train name")
    station_code: str = Field(..., description="Station code")
    station_name: str = Field(..., description="Full station name")
    journey_date: str = Field(..., description="Journey date (YYYY-MM-DD)")
    day_of_week: str = Field(..., description="Day name (e.g. Monday)")
    distance_from_source_km: float = Field(..., description="Distance in km from train source station")
    scheduled_arrival: str = Field(..., description="Scheduled arrival time (HH:MM)")
    scheduled_departure: str = Field(..., description="Scheduled departure time (HH:MM)")
    predicted_delay_minutes: float = Field(..., description="Predicted arrival delay in minutes")
    expected_actual_arrival: str = Field(..., description="Estimated actual arrival time (HH:MM)")
    expected_actual_departure: str = Field(..., description="Estimated actual departure time (HH:MM)")
    status_advisory: str = Field(..., description="Advisory status category")


# ---------------------------------------------------------------------------
# 4. Lifespan Context Manager (Load ML Model Once on Startup)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan handler:
    Loads future_delay_model.pkl once into memory when FastAPI starts up,
    preventing costly disk reads on every request.
    """
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Trained model artifact '{MODEL_PATH.name}' was not found at {MODEL_PATH}. "
            "Please ensure future_delay_model.pkl is placed in the project root."
        )

    print(f"Loading ML model artifacts from: {MODEL_PATH}")
    artifacts: Dict[str, Any] = joblib.load(MODEL_PATH)

    # Store artifacts in app.state for access inside endpoint handlers
    app.state.model = artifacts["model"]
    app.state.feature_cols = artifacts["feature_cols"]
    app.state.timetable_ref = artifacts["timetable_ref"]
    app.state.train_categories = artifacts["train_categories"]
    app.state.station_categories = artifacts["station_categories"]

    print("[OK] Model and timetable lookup data successfully loaded into memory.")
    yield
    print("Shutting down FastAPI application.")


# ---------------------------------------------------------------------------
# 5. FastAPI App & CORS Setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Train Delay Prediction API",
    description="FastAPI service for predicting Indian Railways train delays using a pre-trained ML model.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for the React frontend (running on Vite or CRA)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# 6. Basic Diagnostic Routes
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    """Root endpoint to confirm that the backend server is running."""
    return {
        "status": "online",
        "message": "AI Train Delay Prediction Backend is running successfully!",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint to verify service and model readiness."""
    model_loaded = hasattr(app.state, "model") and app.state.model is not None
    return {
        "status": "healthy",
        "service": "train-delay-prediction-backend",
        "model_loaded": model_loaded
    }


@app.get("/test-data")
def get_test_data():
    """
    Temporary testing endpoint:
    Returns 10 valid train number and station code combinations from the loaded timetable.
    """
    if not hasattr(app.state, "timetable_ref") or app.state.timetable_ref is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Timetable data is not initialized."
        )

    timetable: pd.DataFrame = app.state.timetable_ref
    required_cols = ["train_number", "station_code", "train_name", "station_name"]
    sample_data = timetable[required_cols].head(10).to_dict(orient="records")
    return sample_data


# ---------------------------------------------------------------------------
# 7. Prediction Endpoint (Reusing predict.py Preprocessing)
# ---------------------------------------------------------------------------
@app.post("/predict", response_model=PredictionResponse)
def predict_delay(request: PredictionRequest):
    """
    Predict train delay and calculate estimated actual arrival & departure times.
    Reuses the exact feature encoding, timetable lookup, and inference pipeline
    from predict.py.
    """
    if not hasattr(app.state, "model") or app.state.model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is not initialized."
        )

    # 1. Parse and validate the journey date
    try:
        dt = datetime.strptime(request.journey_date.strip(), "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format for '{request.journey_date}'. Expected format: YYYY-MM-DD (e.g. 2026-09-22)."
        )

    req_train_str = str(request.train_number).strip()
    req_station_code = request.station_code.strip().upper()

    timetable: pd.DataFrame = app.state.timetable_ref
    train_cats: List[Any] = app.state.train_categories
    station_cats: List[Any] = app.state.station_categories
    feature_cols: List[str] = app.state.feature_cols
    model = app.state.model

    # 2. Look up the train in the timetable reference catalog
    train_matches = timetable[
        timetable['train_number'].astype(str).str.strip() == req_train_str
    ]

    if train_matches.empty:
        available_trains = list(timetable['train_number'].astype(str).dropna().unique())[:10]
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Train number '{request.train_number}' was not found in the timetable. "
                f"Available trains include: {', '.join(available_trains)}"
            )
        )

    # 3. Look up the station along the train's route
    station_matches = train_matches[
        train_matches['station_code'].astype(str).str.strip().str.upper() == req_station_code
    ]

    if station_matches.empty:
        available_stations = list(train_matches['station_code'].astype(str).dropna().unique())
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Station '{req_station_code}' was not found on the route of Train {request.train_number}. "
                f"Valid stations for this train: {', '.join(available_stations)}"
            )
        )

    sel_station = station_matches.iloc[0]
    sel_train_name = str(sel_station.get('train_name', 'Unknown Train'))
    sel_station_name = str(sel_station.get('station_name', req_station_code))

    # 4. Resolve categorical codes (same logic as predict.py lines 78-81)
    train_code = 0
    for idx, cat in enumerate(train_cats):
        if str(cat).strip() == req_train_str:
            train_code = idx
            break

    station_code_idx = 0
    for idx, cat in enumerate(station_cats):
        if str(cat).strip().upper() == req_station_code:
            station_code_idx = idx
            break

    # 5. Extract calendar and date features (same as predict.py lines 91-95)
    month_num = dt.month
    day_of_week_num = dt.weekday()
    day_of_year = dt.timetuple().tm_yday
    quarter = (month_num - 1) // 3 + 1
    is_weekend_flag = 1 if day_of_week_num in [5, 6] else 0

    # 6. Build the input feature record (exact match to predict.py lines 83-99)
    record = {
        'train_num_cat': train_code,
        'station_code_cat': station_code_idx,
        'distance_from_source_km': float(sel_station.get('distance_from_source_km', 0.0)),
        'distance_from_previous_km': float(sel_station.get('distance_from_previous_km', 0.0)),
        'distance_to_destination_km': float(sel_station.get('distance_to_destination_km', 0.0)),
        'route_completion_ratio': float(sel_station.get('route_completion_ratio', 0.0)),
        'sched_hour': float(sel_station.get('sched_hour', 12.0)),
        'month_num': month_num,
        'day_of_week_num': day_of_week_num,
        'day_of_year': day_of_year,
        'quarter': quarter,
        'is_weekend_flag': is_weekend_flag,
        'is_junction': int(sel_station.get('is_junction', 0)),
        'is_major_junction': int(sel_station.get('is_major_junction', 0)),
        'is_crossing_bottleneck': int(sel_station.get('is_crossing_bottleneck', 0))
    }

    # 7. Construct feature DataFrame and generate prediction
    try:
        input_df = pd.DataFrame([record])[feature_cols]
        raw_pred = float(model.predict(input_df)[0])
        predicted_delay = max(0.0, round(raw_pred, 1))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {str(exc)}"
        )

    # 8. Compute expected actual arrival and departure
    sched_arr = str(sel_station.get('scheduled_arrival', 'N/A'))
    sched_dep = str(sel_station.get('scheduled_departure', 'N/A'))
    actual_arr = add_minutes_to_time(sched_arr, predicted_delay)
    actual_dep = add_minutes_to_time(sched_dep, predicted_delay)

    # 9. Determine status advisory (exact match to predict.py lines 128-133)
    if predicted_delay > 60:
        status_advisory = "SEVERE DELAY (> 1 hr). Plan buffer time."
    elif predicted_delay > 20:
        status_advisory = "MODERATE DELAY. Typical for this section."
    else:
        status_advisory = "ON TIME / MINIMAL DELAY (< 20 mins)."

    return PredictionResponse(
        train_number=req_train_str,
        train_name=sel_train_name,
        station_code=req_station_code,
        station_name=sel_station_name,
        journey_date=request.journey_date.strip(),
        day_of_week=dt.strftime("%A"),
        distance_from_source_km=float(sel_station.get('distance_from_source_km', 0.0)),
        scheduled_arrival=sched_arr,
        scheduled_departure=sched_dep,
        predicted_delay_minutes=predicted_delay,
        expected_actual_arrival=actual_arr,
        expected_actual_departure=actual_dep,
        status_advisory=status_advisory
    )


# ---------------------------------------------------------------------------
# 8. Direct Execution Convenience
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

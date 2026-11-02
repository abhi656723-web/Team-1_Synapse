# AI Train Delay Prediction - Backend Service

Welcome to the backend service of the **AI Train Delay Prediction System**. This backend is built using **Python**, **FastAPI**, and **Uvicorn** to serve live machine learning delay predictions to the React frontend.

---

## 📁 Directory Structure

```text
backend/
├── main.py                     # FastAPI application with ML startup loader, CORS, and endpoints
├── services/                   # Modular service layer
│   ├── __init__.py             # Python package marker
│   └── realtime_service.py     # Real-time train tracking client, caching & fallback simulator
├── .env.example                # Template for environment variables (RapidAPI key)
├── .env                        # Local configuration file (git-ignored)
├── test_realtime.py            # Automated end-to-end test suite for backend endpoints
├── requirements.txt            # Python dependencies required to run backend, ML & real-time service
└── README.md                   # Complete documentation and testing guide (this file)
```

---

## 📄 What Each File Does

### 1. `main.py`
- **One-time ML Model Loading:** Uses FastAPI's `lifespan` context manager to load `future_delay_model.pkl` from the project root into memory (`app.state`) **once on startup**.
- **CORS Middleware (`CORSMiddleware`):** Configured so that the React frontend (running on Vite at `http://localhost:5173` or Create React App at `http://localhost:3000`) can communicate seamlessly with this backend.
- **Diagnostic Routes:**
  - `GET /`: Returns confirmation that the backend is online.
  - `GET /health`: Verifies server health and confirms the ML model is loaded (`"model_loaded": true`).
- **Prediction Route (`POST /predict`):**
  - Accepts `train_number`, `station_code`, and `journey_date`.
  - Reuses the exact timetable lookup, categorical encodings, date features, and model inference from `predict.py`.
  - Calculates scheduled vs. estimated actual times and status advisory.
  - Returns structured JSON with comprehensive error handling (HTTP 400 for invalid dates, HTTP 404 for unknown trains or stations).
- **Real-Time Live Status Route (`GET /train/{train_number}/live`):**
  - Fetches live running position, current delay in minutes, expected arrival/departure, and upcoming stops.
  - Backed by `RealTimeTrainService` with in-memory TTL caching (90 seconds).

### 2. `services/realtime_service.py`
- Handles asynchronous HTTP requests to external railway data providers via `httpx`.
- Enforces an in-memory TTL cache (90s) to prevent quota exhaustion and reduce network latency.
- Provides a high-fidelity fallback simulator based on timetable routes so development and testing are never blocked if the external API is offline or unconfigured.

### 3. `test_realtime.py`
- Independent automated test suite verifying health, prediction regression, live endpoints, cache hits, and error handling.


### 2. `requirements.txt`
Specifies the essential Python packages:
- `fastapi`: High-performance API framework.
- `uvicorn[standard]`: ASGI web server.
- `joblib`: Deserializes the trained model bundle (`future_delay_model.pkl`).
- `pandas`: Handles the in-memory timetable lookup catalog and tabular feature vectors.
- `scikit-learn`: Runs inference with the trained `HistGradientBoostingRegressor` model.
- `numpy`: Numerical calculations supporting scikit-learn and pandas.

### 3. `README.md`
This guide, providing setup commands, API documentation, and testing examples.

---

## 🚀 Getting Started (Step-by-Step Guide)

Open your terminal (PowerShell or Command Prompt):

### Step 1: Navigate to the `backend` Folder
```powershell
cd d:\Synapse\backend
```

### Step 2: Create a Python Virtual Environment
*(Skip if already created)*
```powershell
python -m venv .venv
```

### Step 3: Activate the Virtual Environment
* **On Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
  *(If you see an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and then run the command again).*

* **On Windows (Command Prompt `cmd`):**
  ```cmd
  .venv\Scripts\activate.bat
  ```

* **On macOS / Linux:**
  ```bash
  source .venv/bin/activate
  ```

### Step 4: Install the Required Packages
```powershell
pip install -r requirements.txt
```

### Step 5: Start the FastAPI Server
```powershell
uvicorn main:app --reload --port 8000
```
*(Or run `python main.py`).*

On startup, you will see:
```text
Loading ML model artifacts from: ...\future_delay_model.pkl
[OK] Model and timetable lookup data successfully loaded into memory.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

---

## 📡 API Endpoints & Testing

### 1. `GET /` — Service Status
- **URL:** `http://127.0.0.1:8000/`
- **Response:**
  ```json
  {
    "status": "online",
    "message": "AI Train Delay Prediction Backend is running successfully!",
    "docs_url": "/docs"
  }
  ```

### 2. `GET /health` — Health Check
- **URL:** `http://127.0.0.1:8000/health`
- **Response:**
  ```json
  {
    "status": "healthy",
    "service": "train-delay-prediction-backend",
    "model_loaded": true
  }
  ```

### 3. `POST /predict` — Train Delay Prediction

#### Request Body (`application/json`):
```json
{
  "train_number": 12623,
  "station_code": "KPD",
  "journey_date": "2026-09-22"
}
```

#### Response Body (`200 OK`):
```json
{
  "train_number": "12623",
  "train_name": "Chennai Mail",
  "station_code": "KPD",
  "station_name": "Katpadi Junction",
  "journey_date": "2026-09-22",
  "day_of_week": "Tuesday",
  "distance_from_source_km": 130.0,
  "scheduled_arrival": "21:13",
  "scheduled_departure": "21:15",
  "predicted_delay_minutes": 10.1,
  "expected_actual_arrival": "21:23",
  "expected_actual_departure": "21:25",
  "status_advisory": "ON TIME / MINIMAL DELAY (< 20 mins)."
}
```

#### Error Responses:
- **HTTP 400 Bad Request:** If date format is invalid (expected `YYYY-MM-DD`).
- **HTTP 404 Not Found:** If `train_number` is not recognized, or if `station_code` is not along that train's route (includes a list of valid stations for that train in the error detail).

### 4. `GET /train/{train_number}/live` — Real-Time Live Running Status

#### Example Request:
`GET http://127.0.0.1:8000/train/12623/live`

#### Response Body (`200 OK`):
```json
{
  "train_number": "12623",
  "train_name": "Chennai Mail",
  "is_running": true,
  "current_station_code": "KPD",
  "current_station_name": "Katpadi Junction",
  "delay_minutes": 14.5,
  "status_message": "Departed Katpadi Junction (KPD). Running 14 mins late.",
  "last_updated": "10:15 AM",
  "scheduled_arrival": "21:13",
  "expected_arrival": "21:27",
  "scheduled_departure": "21:15",
  "expected_departure": "21:29",
  "upcoming_stations": [
    {
      "station_code": "JTJ",
      "station_name": "Jolarpettai Junction",
      "distance_from_source_km": 214.0,
      "scheduled_arrival": "23:08",
      "expected_arrival": "23:22"
    }
  ],
  "source": "simulated_timetable",
  "cached": false
}
```


---

## 🧪 How to Test Locally

### Option A: Interactive Swagger UI (Recommended)
1. Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.
2. Click on **POST /predict** -> **Try it out**.
3. Use the sample JSON payload and click **Execute**.

### Option B: PowerShell
```powershell
$body = @{
    train_number = 12623
    station_code = "KPD"
    journey_date = "2026-09-22"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/predict" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
```

### Option C: cURL
```bash
curl -X POST "http://127.0.0.1:8000/predict" \
     -H "Content-Type: application/json" \
     -d "{\"train_number\": 12623, \"station_code\": \"KPD\", \"journey_date\": \"2026-09-22\"}"
```

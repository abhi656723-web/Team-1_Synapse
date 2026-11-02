"""
Clean synchronous/async test runner with explicit progress reporting.
"""

import sys
import time
from pathlib import Path
from fastapi import HTTPException

t0 = time.time()
print(f"[{time.time()-t0:.1f}s] Starting runner...", flush=True)

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

import main
print(f"[{time.time()-t0:.1f}s] Main imported successfully.", flush=True)

import joblib
print(f"[{time.time()-t0:.1f}s] Loading artifacts directly into app.state...", flush=True)
artifacts = joblib.load(main.MODEL_PATH)
print(f"[{time.time()-t0:.1f}s] Artifacts loaded! Initializing app.state...", flush=True)

main.app.state.model = artifacts["model"]
main.app.state.feature_cols = artifacts["feature_cols"]
main.app.state.timetable_ref = artifacts["timetable_ref"]
main.app.state.train_categories = artifacts["train_categories"]
main.app.state.station_categories = artifacts["station_categories"]
main.app.state.realtime_service = main.RealTimeTrainService()
print(f"[{time.time()-t0:.1f}s] app.state fully populated! Ready for testing.", flush=True)

import asyncio

async def test_all():
    print("\n" + "=" * 70, flush=True)
    print("      SYNAPSE FASTAPI ENDPOINTS & REAL-TIME SERVICE TEST SUITE", flush=True)
    print("=" * 70, flush=True)

    # 1. Test /health
    print("\n[TEST 1] Testing Health Handler: health_check()...", flush=True)
    h = main.health_check()
    assert h["status"] == "healthy", f"Health status bad: {h}"
    assert h["model_loaded"] is True, "Model not loaded"
    print(f"  --> PASS: Server healthy, model_loaded=True. Payload: {h}", flush=True)

    # 2. Test /predict (Existing ML Model Regression Test)
    print("\n[TEST 2] Testing ML Prediction: predict_delay()...", flush=True)
    req = main.PredictionRequest(train_number=12623, station_code="KPD", journey_date="2026-09-22")
    pred = main.predict_delay(req)
    assert pred.train_number == "12623"
    assert pred.station_code == "KPD"
    assert pred.predicted_delay_minutes >= 0.0
    assert pred.expected_actual_arrival != "N/A"
    print(f"  --> PASS: Existing ML prediction 100% operational!", flush=True)
    print(f"            Train          : {pred.train_number} ({pred.train_name})", flush=True)
    print(f"            Target Station : {pred.station_name} [{pred.station_code}]", flush=True)
    print(f"            Scheduled Arr  : {pred.scheduled_arrival} -> Expected Actual: {pred.expected_actual_arrival}", flush=True)
    print(f"            Predicted Delay: {pred.predicted_delay_minutes} mins", flush=True)
    print(f"            Advisory       : {pred.status_advisory}", flush=True)

    # 3. Test /train/{train_number}/live across all 3 supported trains
    trains = [("12623", "Chennai Mail"), ("12625", "Kerala Express"), ("16345", "Netravati Express")]
    for t_num, t_name in trains:
        print(f"\n[TEST 3] Testing Live Status: get_live_train_status('{t_num}')...", flush=True)
        live = await main.get_live_train_status(t_num)
        assert live.train_number == t_num
        assert live.is_running is True
        assert live.current_station_code != ""
        assert live.current_station_name != ""
        assert live.delay_minutes >= 0.0
        assert len(live.upcoming_stations) > 0
        print(f"  --> PASS: {live.train_number} ({live.train_name})", flush=True)
        print(f"            Current Station : {live.current_station_name} [{live.current_station_code}]", flush=True)
        print(f"            Status Message  : {live.status_message}", flush=True)
        print(f"            Live Delay      : {live.delay_minutes} mins", flush=True)
        print(f"            Scheduled Arr   : {live.scheduled_arrival} | Expected Arr: {live.expected_arrival}", flush=True)
        print(f"            Upcoming Stops  : {len(live.upcoming_stations)} stations", flush=True)
        print(f"            Source          : {live.source} (Cached: {live.cached})", flush=True)

    # 4. In-Memory TTL Cache Hit
    print("\n[TEST 4] Testing Cache Hit: get_live_train_status('12623') again...", flush=True)
    cached_live = await main.get_live_train_status("12623")
    assert cached_live.cached is True, "Expected cached=True on immediate repeat call"
    print("  --> PASS: Verified in-memory cache hit (cached=True).", flush=True)

    # 5. Error Handling: Unknown Train (404)
    print("\n[TEST 5] Testing Unknown Train: get_live_train_status('99999')...", flush=True)
    try:
        await main.get_live_train_status("99999")
        assert False, "Should have raised 404"
    except HTTPException as exc:
        assert exc.status_code == 404
        print(f"  --> PASS: Correctly raised HTTP 404: {exc.detail}", flush=True)

    # 6. Error Handling: Invalid Non-Numeric Train (400)
    print("\n[TEST 6] Testing Invalid Train Identifier: get_live_train_status('invalid_train')...", flush=True)
    try:
        await main.get_live_train_status("invalid_train")
        assert False, "Should have raised 400"
    except HTTPException as exc:
        assert exc.status_code == 400
        print(f"  --> PASS: Correctly raised HTTP 400: {exc.detail}", flush=True)

    print("\n" + "=" * 70, flush=True)
    print("    [SUCCESS] ALL 6 DIRECT INTEGRATION TESTS PASSED WITH 100% SUCCESS!", flush=True)
    print("=" * 70, flush=True)

asyncio.run(test_all())
print(f"\n[DONE] Whole test suite completed in {time.time()-t0:.2f} seconds.", flush=True)

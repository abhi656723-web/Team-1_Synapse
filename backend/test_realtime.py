"""
Clean test runner verifying the merged Synapse FastAPI backend endpoints and real-time service.
"""

import sys
import time
from pathlib import Path
from fastapi import HTTPException
import asyncio

t0 = time.time()
print(f"[{time.time()-t0:.1f}s] Starting runner...", flush=True)

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

import main
print(f"[{time.time()-t0:.1f}s] Main imported successfully.", flush=True)

# Initialize RealTimeTrainService and SQLite DB for testing
main.init_db()
main.app.state.realtime_service = main.RealTimeTrainService()
print(f"[{time.time()-t0:.1f}s] app.state initialized.", flush=True)

async def test_all():
    print("\n" + "=" * 70, flush=True)
    print("      SYNAPSE FASTAPI ENDPOINTS & REAL-TIME SERVICE TEST SUITE", flush=True)
    print("=" * 70, flush=True)

    # 1. Test /health
    print("\n[TEST 1] Testing Health Handler: health()...", flush=True)
    h = main.health()
    assert h["status"] == "ok", f"Health status bad: {h}"
    assert h["service"] == "Synapse API", "Service name bad"
    print(f"  --> PASS: Server healthy. Payload: {h}", flush=True)

    # 2. Test /coach-composition/{train_number}
    print("\n[TEST 2] Testing Coach Composition: get_coach_composition('12623')...", flush=True)
    comp = main.get_coach_composition("12623")
    assert comp["train_number"] == "12623", "Train number mismatch"
    print(f"  --> PASS: Coach composition returned {len(comp['coaches'])} coaches.", flush=True)

    # 3. Test /train/{train_number}/live (Live Running Status)
    print("\n[TEST 3] Testing Real-Time Live Train Status: get_live_train_status('12623')...", flush=True)
    live_data = await main.get_live_train_status("12623")
    assert live_data.train_number == "12623", f"Train mismatch: {live_data.train_number}"
    assert live_data.current_station is not None, "Missing current station"
    assert live_data.delay_minutes >= 0, f"Negative delay: {live_data.delay_minutes}"
    print(f"  --> PASS: Live status retrieved! Train: {live_data.train_name} ({live_data.train_number})", flush=True)
    print(f"            Source: {live_data.source}, Current Station: {live_data.current_station} ({live_data.station_name})", flush=True)
    print(f"            Delay: {live_data.delay_minutes} min, Status: {live_data.status_advisory}", flush=True)

    # 4. Test In-Memory TTL Cache
    print("\n[TEST 4] Testing Cache Hit for second request on '12623'...", flush=True)
    cached_live = await main.get_live_train_status("12623")
    assert cached_live.cached is True, "Second request should be served from in-memory cache"
    print(f"  --> PASS: In-memory TTL cache working as expected (cached=True)!", flush=True)

    # 5. Test Invalid Train Number validation
    print("\n[TEST 5] Testing Error Handling for invalid train number: 'INVALID999'...", flush=True)
    try:
        await main.get_live_train_status("INVALID999")
        assert False, "Expected HTTPException for invalid train number"
    except HTTPException as e:
        assert e.status_code == 400
        print(f"  --> PASS: Properly rejected with HTTP {e.status_code}: {e.detail}", flush=True)

    print("\n" + "=" * 70, flush=True)
    print("      ALL ENDPOINT & REAL-TIME SERVICE TESTS PASSED PERFECTLY!")
    print("=" * 70 + "\n", flush=True)

if __name__ == "__main__":
    asyncio.run(test_all())

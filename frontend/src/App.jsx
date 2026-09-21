import { useState } from "react";
import "./App.css";
const API_URL = "http://127.0.0.1:8000";

/* =========================================================
   TRAIN DATA
   ========================================================= */

const trains = {
  "12625": {
    name: "Kerala Express",
    route: "Thiruvananthapuram → New Delhi",
    stations: [
      "TVC",
      "VAK",
      "QLN",
      "KYJ",
      "MVLK",
      "CNGR",
      "TRVL",
      "CGY",
      "KTYM",
      "VARD",
      "ERN",
      "AWY",
      "TCR",
      "OTP",
      "PGT",
      "CBE",
      "TUP",
      "ED",
      "SA",
      "JTJ",
      "KPD",
      "CTO",
      "TPTY",
      "RU",
      "GDR",
      "NLR",
      "BZA",
      "WL",
      "RDM",
      "SKZR",
      "BPQ",
      "CD",
      "SEGM",
      "NGP",
      "ET",
      "BPL",
      "BINA",
      "VGLJ",
      "GWL",
      "AGC",
      "MTJ",
      "FDB",
      "NZM",
      "NDLS",
    ],
  },

  "12623": {
    name: "Chennai Mail",
    route: "Chennai → New Delhi",
    stations: [
      "MAS",
      "AJJ",
      "KPD",
      "JTJ",
      "SA",
      "ED",
      "TUP",
      "CBE",
      "PGT",
      "OTP",
      "TCR",
      "AWY",
      "ERN",
    ],
  },

  "16345": {
    name: "Netravati Express",
    route: "Lokmanya Tilak Terminus → Thiruvananthapuram",
    stations: [
      "LTT",
      "PNVL",
      "RN",
      "MAO",
      "KAWR",
      "UD",
      "CAN",
      "CLT",
      "TIR",
      "SRR",
      "TCR",
      "AWY",
      "ERN",
      "QLN",
      "TVC",
    ],
  },
};


/* =========================================================
   CUSTOM TRAIN ICON
   ========================================================= */

function TrainIcon({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 31V16C8 9 14 5 24 5H40C49 5 56 10 56 17V31"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M8 31H56"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M17 17H29"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M35 17H48"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <circle
        cx="18"
        cy="37"
        r="4"
        fill="currentColor"
      />

      <circle
        cx="46"
        cy="37"
        r="4"
        fill="currentColor"
      />

      <path
        d="M14 43H50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* =========================================================
   OTHER SMALL ICONS
   ========================================================= */

function CalendarIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2V6" />
      <path d="M8 2V6" />
      <path d="M3 10H21" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 10C20 15 12 22 12 22C12 22 4 15 4 10C4 5.6 7.6 2 12 2C16.4 2 20 5.6 20 10Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3L13.5 9.5L20 11L13.5 12.5L12 19L10.5 12.5L4 11L10.5 9.5L12 3Z" />
    </svg>
  );
}


/* =========================================================
   APP
   ========================================================= */

function App() {

  /* -------------------------------------------------------
     Input modes
     ------------------------------------------------------- */

  const [trainMode, setTrainMode] = useState("select");
  const [stationMode, setStationMode] = useState("select");
  const [dateMode, setDateMode] = useState("select");


  /* -------------------------------------------------------
     Input values
     ------------------------------------------------------- */

  const [trainNumber, setTrainNumber] = useState("12625");
  const [manualTrain, setManualTrain] = useState("");

  const [station, setStation] = useState("NDLS");
  const [manualStation, setManualStation] = useState("");

  const [date, setDate] = useState("2026-07-25");

  const [showCalendar, setShowCalendar] = useState(false);


  /* -------------------------------------------------------
     Calendar
     ------------------------------------------------------- */

  const [currentMonth, setCurrentMonth] = useState(
    new Date(2026, 6, 1)
  );


  /* -------------------------------------------------------
     Result
     ------------------------------------------------------- */

  const [showResult, setShowResult] = useState(false);
  const [prediction, setPrediction] = useState(null);


  /* -------------------------------------------------------
     Current train
     ------------------------------------------------------- */

  const selectedTrainData =
    trains[trainNumber] || trains["12625"];

  const availableStations =
    selectedTrainData.stations;


  /* =======================================================
     CALENDAR CALCULATIONS
     ======================================================= */

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }


  const monthName =
    currentMonth.toLocaleString("default", {
      month: "long",
    });


  /* =======================================================
     DATE SELECTION
     ======================================================= */

  const selectDate = (day) => {

    const formattedDate =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    setDate(formattedDate);

    setShowCalendar(false);
  };


  /* =======================================================
     TRAIN CHANGE
     ======================================================= */

  const handleTrainChange = (value) => {

    setTrainNumber(value);

    const newStations =
      trains[value]?.stations || [];

    if (newStations.length > 0) {
      setStation(newStations[newStations.length - 1]);
    }
  };


  /* =======================================================
     PREDICT
     ======================================================= */

  const handlePredict = async () => {

    try {
      const finalTrainNumber =
        trainMode === "select"
          ? trainNumber
          : manualTrain;

      const finalStation =
        stationMode === "select"
          ? station
          : manualStation;

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          train_number: Number(finalTrainNumber),
          station_code: finalStation,
          journey_date: date,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();


      setPrediction(data);

      setShowResult(true);

      setTimeout(() => {
        document
          .getElementById("prediction-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);

    } catch (error) {
      console.error("Prediction error:", error);
      alert("Unable to generate a prediction for the selected train, station, or date.");
    }
  };
  /* =======================================================
     DISPLAY VALUES
     ======================================================= */

  const displayedTrain =
    trainMode === "select"
      ? trainNumber
      : manualTrain || "12625";

  const displayedTrainName =
    trainMode === "select"
      ? selectedTrainData.name
      : "Train";

  const displayedStation =
    stationMode === "select"
      ? station
      : manualStation || "NDLS";


  /* =======================================================
     JSX
     ======================================================= */

  return (
    <div className="app">


      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-logo">
            <TrainIcon size={34} />
          </div>

          <div>
            <div className="brand-name">
              Synapse
            </div>

            <div className="brand-subtitle">
              AI Train Delay Prediction
            </div>
          </div>

        </div>


        <nav>

          <a
            href="#predict"
            className="nav-active"
          >
            Predict
          </a>

          <a href="#how-it-works">
            How it works
          </a>

          <a href="#about">
            About
          </a>

        </nav>

      </header>


      {/* =====================================================
          HERO
          ===================================================== */}

      <main>

        <section
          className="hero"
          id="predict"
        >

          <div className="hero-content">

            <div className="ai-badge">

              <span className="ai-dot"></span>

              AI-POWERED PREDICTION

            </div>


            <h1>

              Know your train's delay

              <span>
                {" "}before it happens.
              </span>

            </h1>


            <p>

              Select or enter your train, station and journey date.
              Synapse predicts the expected arrival delay before your journey.

            </p>

          </div>

        </section>


        {/* =================================================
            INPUT CARD
            ================================================= */}

        <section className="prediction-card">


          <div className="card-heading">

            <div className="card-title-area">

              <div className="card-icon">
                <TrainIcon size={28} />
              </div>

              <div>

                <h2>
                  Predict Train Delay
                </h2>

                <p>
                  Enter your journey details below.
                </p>

              </div>

            </div>


            <div className="status-pill">

              <span></span>

              Model Ready

            </div>

          </div>


          <div className="input-grid">


            {/* =============================================
                TRAIN NUMBER
                ============================================= */}

            <div className="input-section">

              <div className="field-header">

                <label>
                  Train Number
                </label>

                <div className="mode-switch">

                  <button
                    className={
                      trainMode === "select"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setTrainMode("select")
                    }
                  >
                    Select
                  </button>

                  <button
                    className={
                      trainMode === "manual"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setTrainMode("manual")
                    }
                  >
                    Manual
                  </button>

                </div>

              </div>


              {trainMode === "select" ? (

                <div className="select-wrapper">

                  <TrainIcon size={21} />

                  <select
                    value={trainNumber}
                    onChange={(e) =>
                      handleTrainChange(e.target.value)
                    }
                  >

                    <option value="12625">
                      12625 — Kerala Express
                    </option>

                    <option value="12623">
                      12623 — Chennai Mail
                    </option>

                    <option value="16345">
                      16345 — Netravati Express
                    </option>

                  </select>

                </div>

              ) : (

                <input
                  type="text"
                  className="normal-input"
                  placeholder="Enter train number e.g. 12625"
                  value={manualTrain}
                  onChange={(e) =>
                    setManualTrain(e.target.value)
                  }
                />

              )}


              {trainMode === "select" && (
                <div className="field-help">
                  {selectedTrainData.route}
                </div>
              )}

            </div>


            {/* =============================================
                STATION
                ============================================= */}

            <div className="input-section">

              <div className="field-header">

                <label>
                  Station to Check
                </label>

                <div className="mode-switch">

                  <button
                    className={
                      stationMode === "select"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setStationMode("select")
                    }
                  >
                    Select
                  </button>

                  <button
                    className={
                      stationMode === "manual"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setStationMode("manual")
                    }
                  >
                    Manual
                  </button>

                </div>

              </div>


              {stationMode === "select" ? (

                <div className="select-wrapper">

                  <LocationIcon />

                  <select
                    value={station}
                    onChange={(e) =>
                      setStation(e.target.value)
                    }
                  >

                    {availableStations.map(
                      (code) => (
                        <option
                          key={code}
                          value={code}
                        >
                          {code}
                        </option>
                      )
                    )}

                  </select>

                </div>

              ) : (

                <input
                  type="text"
                  className="normal-input"
                  placeholder="Enter station code e.g. NDLS"
                  value={manualStation}
                  onChange={(e) =>
                    setManualStation(
                      e.target.value.toUpperCase()
                    )
                  }
                />

              )}


              <div className="field-help">
                Choose a station on the selected train route
              </div>

            </div>


            {/* =============================================
                DATE
                ============================================= */}

            <div className="input-section">

              <div className="field-header">

                <label>
                  Journey Date
                </label>

                <div className="mode-switch">

                  <button
                    className={
                      dateMode === "select"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setDateMode("select")
                    }
                  >
                    Calendar
                  </button>

                  <button
                    className={
                      dateMode === "manual"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setDateMode("manual")
                    }
                  >
                    Manual
                  </button>

                </div>

              </div>


              {dateMode === "manual" ? (

                <input
                  type="text"
                  className="normal-input"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                />

              ) : (

                <div className="calendar-wrapper">

                  <button
                    className="date-input"
                    onClick={() =>
                      setShowCalendar(
                        !showCalendar
                      )
                    }
                  >

                    <CalendarIcon />

                    <span>
                      {date}
                    </span>

                    <span className="calendar-arrow">
                      ⌄
                    </span>

                  </button>


                  {showCalendar && (

                    <div className="calendar-popup">

                      <div className="calendar-header">

                        <button
                          onClick={() =>
                            setCurrentMonth(
                              new Date(
                                year,
                                month - 1,
                                1
                              )
                            )
                          }
                        >
                          ‹
                        </button>

                        <strong>
                          {monthName} {year}
                        </strong>

                        <button
                          onClick={() =>
                            setCurrentMonth(
                              new Date(
                                year,
                                month + 1,
                                1
                              )
                            )
                          }
                        >
                          ›
                        </button>

                      </div>


                      <div className="calendar-weekdays">

                        {[
                          "Su",
                          "Mo",
                          "Tu",
                          "We",
                          "Th",
                          "Fr",
                          "Sa",
                        ].map(
                          (day) => (
                            <span key={day}>
                              {day}
                            </span>
                          )
                        )}

                      </div>


                      <div className="calendar-grid">

                        {calendarDays.map(
                          (day, index) => {

                            if (!day) {

                              return (
                                <span
                                  key={
                                    `empty-${index}`
                                  }
                                  className="empty-day"
                                />
                              );

                            }


                            const formattedDate =
                              `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


                            const selected =
                              date ===
                              formattedDate;


                            return (

                              <button
                                key={day}
                                className={
                                  selected
                                    ? "selected-day"
                                    : ""
                                }
                                onClick={() =>
                                  selectDate(day)
                                }
                              >
                                {day}
                              </button>

                            );

                          }
                        )}

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              PREDICT BUTTON
              ================================================= */}

          <button
            className="predict-button"
            onClick={handlePredict}
          >

            <SparkIcon />

            <span>
              Predict Delay
            </span>

            <span className="arrow">
              →
            </span>

          </button>


          <p className="demo-note">
            Live prediction powered by the Synapse AI model.
          </p>

        </section>


        {/* =================================================
            PREDICTION RESULT
            ================================================= */}

        {showResult && (

          <section
            className="result-section"
            id="prediction-result"
          >


            {/* =============================================
                RESULT HEADER
                ============================================= */}

            <div className="result-header">


              <div>

                <div className="result-label">
                  PREDICTION RESULT
                </div>

                <h2>
                  {displayedTrainName}
                </h2>

                <p>
                  Train {displayedTrain}
                  <span> · </span>
                  Station {displayedStation}
                  <span> · </span>
                  {date}
                </p>

              </div>


              {/* =========================================
                  CONFIDENCE
                  ========================================= */}

              <div className="confidence">

                <div className="confidence-top">

                  <div>

                    <div className="confidence-label">
                      Prediction Status
                    </div>

                    <div className="confidence-value">
                      Ready
                    </div>

                  </div>

                  <div className="confidence-shield">
                    ✓
                  </div>

                </div>


                <div className="confidence-bar">

                  <div></div>

                </div>

              </div>

            </div>


            {/* =============================================
                MAIN RESULT
                ============================================= */}

            <div className="delay-main">


              {/* DELAY */}

              <div className="delay-card">

                <div className="result-card-label">
                  PREDICTED DELAY
                </div>

                <div className="delay-number">
                  {prediction?.predicted_delay_minutes ?? "--"}
                  <span>
                    min
                  </span>
                </div>

                <div className="delay-status">
                  {prediction?.status_advisory ?? "Prediction pending"}
                </div>

              </div>


              {/* SCHEDULED */}

              <div className="time-box">

                <div className="time-icon">
                  <CalendarIcon />
                </div>

                <div>

                  <span>
                    Scheduled Arrival
                  </span>

                  <strong>
                    {prediction?.scheduled_arrival ?? "--:--"}
                  </strong>

                  <small>
                    Expected timetable
                  </small>

                </div>

              </div>


              <div className="time-arrow">
                →
              </div>


              {/* EXPECTED */}

              <div className="time-box expected">

                <div className="time-icon">
                  <span className="clock-dot">
                    ◷
                  </span>
                </div>

                <div>

                  <span>
                    Expected Arrival
                  </span>

                  <strong>
                    {prediction?.expected_actual_arrival ?? "--:--"}
                  </strong>

                  <small>
                    Predicted actual time
                  </small>

                </div>

              </div>

            </div>


            {/* =============================================
                REASONS
                ============================================= */}

            <div className="factors-section">


              <div className="factors-title">

                <div>

                  <h3>
                    Reasons for Prediction
                  </h3>

                  <p>
                    Factors that contributed to the predicted delay
                  </p>

                </div>

              </div>


              <div className="factor-grid">


                {/* WEEKEND */}

                <div className="factor-card">

                  <div className="factor-icon weekend">
                    W
                  </div>

                  <div className="factor-content">

                    <div className="factor-heading">

                      <strong>
                        Weekend Pattern
                      </strong>

                      <span>
                        High impact
                      </span>

                    </div>

                    <p>
                      Historical weekend services show higher average delays.
                    </p>

                    <div className="factor-progress">

                      <div
                        className="progress-orange"
                        style={{
                          width: "85%",
                        }}
                      />

                    </div>

                    <div className="factor-percentage">
                      85%
                    </div>

                  </div>

                </div>


                {/* RAINFALL */}

                <div className="factor-card">

                  <div className="factor-icon rain">
                    R
                  </div>

                  <div className="factor-content">

                    <div className="factor-heading">

                      <strong>
                        Rainfall
                      </strong>

                      <span>
                        Medium impact
                      </span>

                    </div>

                    <p>
                      Weather conditions may increase travel time along the route.
                    </p>

                    <div className="factor-progress">

                      <div
                        className="progress-blue"
                        style={{
                          width: "62%",
                        }}
                      />

                    </div>

                    <div className="factor-percentage">
                      62%
                    </div>

                  </div>

                </div>


                {/* HISTORICAL */}

                <div className="factor-card">

                  <div className="factor-icon history">
                    H
                  </div>

                  <div className="factor-content">

                    <div className="factor-heading">

                      <strong>
                        Historical Delay
                      </strong>

                      <span>
                        High impact
                      </span>

                    </div>

                    <p>
                      Similar journeys have recorded significant arrival delays.
                    </p>

                    <div className="factor-progress">

                      <div
                        className="progress-pink"
                        style={{
                          width: "78%",
                        }}
                      />

                    </div>

                    <div className="factor-percentage">
                      78%
                    </div>

                  </div>

                </div>


                {/* ROUTE */}

                <div className="factor-card">

                  <div className="factor-icon route">
                    T
                  </div>

                  <div className="factor-content">

                    <div className="factor-heading">

                      <strong>
                        Route Conditions
                      </strong>

                      <span>
                        Medium impact
                      </span>

                    </div>

                    <p>
                      Operational and route conditions influence the predicted arrival.
                    </p>

                    <div className="factor-progress">

                      <div
                        className="progress-green"
                        style={{
                          width: "56%",
                        }}
                      />

                    </div>

                    <div className="factor-percentage">
                      56%
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            HOW IT WORKS
            ================================================= */}

        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="section-title">

            <span>
              HOW SYNAPSE WORKS
            </span>

            <h2>
              From journey details to prediction.
            </h2>

          </div>


          <div className="steps">


            <div className="step">

              <div className="step-number">
                01
              </div>

              <div className="step-icon">
                <TrainIcon size={28} />
              </div>

              <h3>
                Enter Journey
              </h3>

              <p>
                Select or manually enter your train,
                station and journey date.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                02
              </div>

              <div className="step-icon">
                ✦
              </div>

              <h3>
                Analyze Factors
              </h3>

              <p>
                Historical, weather and journey-related
                factors are considered.
              </p>

            </div>


            <div className="step">

              <div className="step-number">
                03
              </div>

              <div className="step-icon">
                ↗
              </div>

              <h3>
                Predict Delay
              </h3>

              <p>
                The ML model estimates the expected
                arrival delay and confidence.
              </p>

            </div>


          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer id="about">

        <div className="footer-brand">

          <div className="footer-logo">
            <TrainIcon size={32} />
          </div>

          <div>

            <div className="footer-name">
              Synapse
            </div>

            <div className="footer-subtitle">
              AI Train Delay Prediction
            </div>

          </div>

        </div>


        <p>
          © 2026 Synapse &nbsp; | &nbsp;
          AI-Powered Train Delay Prediction System
        </p>

      </footer>

    </div>
  );
}

export default App;
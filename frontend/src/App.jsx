import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

/* =========================================================
   TRAIN DATA
   ========================================================= */

const trains = [
  {
    number: "12625",
    name: "Kerala Express",
    route: "Thiruvananthapuram → New Delhi",
    stations: [
      ["TVC", "Thiruvananthapuram Central"],
      ["VAK", "Varkala Sivagiri"],
      ["QLN", "Kollam Junction"],
      ["KYJ", "Kayamkulam Junction"],
      ["MVLK", "Mavelikara"],
      ["CNGR", "Chengannur"],
      ["TRVL", "Tiruvalla"],
      ["CGY", "Changanasseri"],
      ["KTYM", "Kottayam"],
      ["VARD", "Vaikom Road"],
      ["ERN", "Ernakulam Town"],
      ["AWY", "Aluva"],
      ["TCR", "Thrissur"],
      ["OTP", "Ottapalam"],
      ["PGT", "Palakkad"],
      ["CBE", "Coimbatore"],
      ["TUP", "Tiruppur"],
      ["ED", "Erode"],
      ["SA", "Salem"],
      ["JTJ", "Jolarpettai"],
      ["KPD", "Katpadi"],
      ["CTO", "Chittoor"],
      ["TPTY", "Tirupati"],
      ["RU", "Renigunta"],
      ["GDR", "Gudur"],
      ["NLR", "Nellore"],
      ["BZA", "Vijayawada"],
      ["WL", "Warangal"],
      ["RDM", "Ramagundam"],
      ["SKZR", "Sirpur Kaghaznagar"],
      ["BPQ", "Balharshah"],
      ["CD", "Chandrapur"],
      ["SEGM", "Sewagram"],
      ["NGP", "Nagpur"],
      ["ET", "Itarsi"],
      ["BPL", "Bhopal"],
      ["BINA", "Bina"],
      ["VGLJ", "Virangana Lakshmibai Jhansi"],
      ["GWL", "Gwalior"],
      ["AGC", "Agra Cantt"],
      ["MTJ", "Mathura"],
      ["FDB", "Faridabad"],
      ["NZM", "Hazrat Nizamuddin"],
      ["NDLS", "New Delhi"],
    ],
  },
  {
    number: "12623",
    name: "Chennai Mail",
    route: "Chennai Central → New Delhi",
    stations: [
      ["MAS", "Chennai Central"],
      ["GDR", "Gudur"],
      ["BZA", "Vijayawada"],
      ["WL", "Warangal"],
      ["NGP", "Nagpur"],
      ["BPL", "Bhopal"],
      ["NDLS", "New Delhi"],
    ],
  },
  {
    number: "16345",
    name: "Netravati Express",
    route: "Thiruvananthapuram → Lokmanya Tilak",
    stations: [
      ["TVC", "Thiruvananthapuram Central"],
      ["QLN", "Kollam Junction"],
      ["ERS", "Ernakulam"],
      ["TCR", "Thrissur"],
      ["CLT", "Kozhikode"],
      ["CAN", "Kannur"],
      ["MAQ", "Mangaluru"],
      ["UD", "Udupi"],
      ["KAWR", "Karwar"],
      ["RN", "Ratnagiri"],
      ["PNVL", "Panvel"],
      ["LTT", "Lokmanya Tilak Terminus"],
    ],
  },
];

/* =========================================================
   ICONS
   ========================================================= */

function TrainIcon({ size = 21 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="3" width="14" height="15" rx="3" />
      <path d="M5 12h14" />
      <path d="M8 7h2" />
      <path d="M14 7h2" />
      <path d="M8 21l2-3" />
      <path d="M16 21l-2-3" />
      <circle cx="9" cy="14.5" r="1" />
      <circle cx="15" cy="14.5" r="1" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 3v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* =========================================================
   LOGO
   ========================================================= */

function SynapseLogo({ small = false }) {
  return (
    <div className={`synapse-logo ${small ? "small" : ""}`}>
      <img
        src="/Synapse-logo.png"
        alt="Synapse"
        className="synapse-logo-image"
      />

      <div className="synapse-logo-text">
        <div className="synapse-name">Synapse</div>

        <div className="synapse-tagline">
          AI Train Delay Prediction
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODERN TRAIN DROPDOWN
   ========================================================= */

function TrainDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected =
    trains.find((train) => train.number === value) || trains[0];

  const filtered = trains.filter((train) => {
    const text =
      `${train.number} ${train.name} ${train.route}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="modern-dropdown">

      <button
        className={`dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >

        <div className="dropdown-left">

          <div className="dropdown-icon">
            <TrainIcon />
          </div>

          <div className="selected-text">

            <strong>
              {selected.number} — {selected.name}
            </strong>

            <span>
              {selected.route}
            </span>

          </div>

        </div>

        <ChevronDown />

      </button>

      {open && (
        <>

          <div
            className="dropdown-backdrop"
            onClick={() => setOpen(false)}
          />

          <div className="dropdown-menu">

            <div className="dropdown-search">

              <SearchIcon />

              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search train..."
              />

            </div>

            <div className="dropdown-list">

              {filtered.map((train) => {

                const active =
                  train.number === selected.number;

                return (
                  <button
                    key={train.number}
                    className={`dropdown-option ${active ? "selected" : ""
                      }`}
                    onClick={() => {
                      onChange(train.number);
                      setOpen(false);
                      setSearch("");
                    }}
                  >

                    <div className="option-icon">
                      <TrainIcon size={19} />
                    </div>

                    <div className="option-content">

                      <strong>
                        {train.number} — {train.name}
                      </strong>

                      <span>
                        {train.route}
                      </span>

                    </div>

                    {active && (
                      <div className="option-check">
                        <CheckIcon />
                      </div>
                    )}

                  </button>
                );
              })}

            </div>

          </div>
        </>
      )}

    </div>
  );
}

/* =========================================================
   MODERN STATION DROPDOWN
   ========================================================= */

function StationDropdown({
  stations,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected =
    stations.find((station) => station[0] === value) ||
    stations[stations.length - 1];

  const filtered = stations.filter(([code, name]) => {

    const text =
      `${code} ${name}`.toLowerCase();

    return text.includes(search.toLowerCase());

  });

  return (
    <div className="modern-dropdown">

      <button
        className={`dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >

        <div className="dropdown-left">

          <div className="dropdown-icon station-icon">
            <LocationIcon />
          </div>

          <div className="selected-text">

            <strong>
              {selected[0]} — {selected[1]}
            </strong>

            <span>
              Station on selected train route
            </span>

          </div>

        </div>

        <ChevronDown />

      </button>

      {open && (
        <>

          <div
            className="dropdown-backdrop"
            onClick={() => setOpen(false)}
          />

          <div className="dropdown-menu station-menu">

            <div className="dropdown-search">

              <SearchIcon />

              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search station or code..."
              />

            </div>

            <div className="dropdown-count">
              {filtered.length} stations available
            </div>

            <div className="dropdown-list">

              {filtered.map(([code, name]) => {

                const active =
                  code === selected[0];

                return (
                  <button
                    key={code}
                    className={`dropdown-option ${active ? "selected" : ""
                      }`}
                    onClick={() => {
                      onChange(code);
                      setOpen(false);
                      setSearch("");
                    }}
                  >

                    <div className="station-code">
                      {code}
                    </div>

                    <div className="option-content">

                      <strong>
                        {name}
                      </strong>

                      <span>
                        {code} station
                      </span>

                    </div>

                    {active && (
                      <div className="option-check">
                        <CheckIcon />
                      </div>
                    )}

                  </button>
                );
              })}

            </div>

          </div>

        </>
      )}

    </div>
  );
}

/* =========================================================
   CALENDAR
   ========================================================= */

function CalendarPopup({
  selectedDate,
  onSelect,
}) {
  const [month, setMonth] = useState(6);
  const [year, setYear] = useState(2026);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  const changeMonth = (direction) => {

    let newMonth = month + direction;
    let newYear = year;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const days = [];

  for (let i = 0; i < firstDay; i++) {

    days.push(
      <div key={`empty-${i}`} />
    );

  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const formatted =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const active =
      formatted === selectedDate;

    days.push(

      <button
        key={day}
        className={`calendar-day ${active ? "active" : ""
          }`}
        onClick={() =>
          onSelect(formatted)
        }
      >
        {day}
      </button>

    );

  }

  return (
    <div className="calendar-popup">

      <div className="calendar-top">

        <div>

          <span>
            Select journey date
          </span>

          <strong>
            {monthNames[month]} {year}
          </strong>

        </div>

        <div className="calendar-nav">

          <button
            onClick={() =>
              changeMonth(-1)
            }
          >
            ‹
          </button>

          <button
            onClick={() =>
              changeMonth(1)
            }
          >
            ›
          </button>

        </div>

      </div>

      <div className="calendar-weekdays">

        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (
          <span key={day}>
            {day}
          </span>
        ))}

      </div>

      <div className="calendar-grid">
        {days}
      </div>

    </div>
  );
}

/* =========================================================
   REASON
   ========================================================= */

function Reason({
  title,
  impact,
  percentage,
  type,
}) {
  return (
    <div className="reason">

      <div className="reason-top">

        <span className="reason-title">
          {title}
        </span>

        <span className="reason-impact">
          {impact}
        </span>

      </div>

      <div className="reason-bar">

        <div
          className={`reason-progress ${type}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <span className="reason-number">
        {percentage}%
      </span>

    </div>
  );
}

/* =========================================================
   PREDICTION PAGE
   ========================================================= */

function PredictionPage({
  trainNumber,
  setTrainNumber,
  station,
  setStation,
  date,
  setDate,
  onPredict,
  loading,
}) {
  const [trainMode, setTrainMode] =
    useState("select");

  const [stationMode, setStationMode] =
    useState("select");

  const [dateMode, setDateMode] =
    useState("calendar");

  const [manualTrain, setManualTrain] =
    useState("12625");

  const [manualStation, setManualStation] =
    useState("NDLS");

  const [showCalendar, setShowCalendar] =
    useState(false);

  const selectedTrain =
    trains.find(
      (train) =>
        train.number === trainNumber
    ) || trains[0];

  return (
    <>

      {/* =================================================
          HERO
          ================================================= */}

      <section className="hero">

        <div className="hero-inner">

          <div className="hero-content">

            <div className="hero-pill">
              <span />
              AI-POWERED PREDICTION
            </div>

            <h1>
              Know your train's delay
              <br />
              <span>
                before it happens.
              </span>
            </h1>

            <p>
              Select or enter your train, station and journey date.
              <br />
              Synapse predicts the expected arrival delay.
            </p>

          </div>

          <div className="hero-logo">

            <div className="hero-logo-circle circle-one" />

            <div className="hero-logo-circle circle-two" />

            <img
              src="/Synapse-logo.png"
              alt="Synapse train"
            />

          </div>

        </div>

      </section>

      {/* =================================================
          FORM
          ================================================= */}

      <main className="main-content">

        <section className="prediction-card">

          <div className="prediction-header">

            <div className="prediction-title-area">

              <div className="prediction-icon">
                <TrainIcon size={24} />
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

            <div className="model-ready">

              <span />

              Model Ready

            </div>

          </div>

          <div className="input-grid">

            {/* =================================================
                TRAIN
                ================================================= */}

            <div className="input-section">

              <div className="input-label-row">

                <label>
                  Train Number
                </label>

                <div className="mode-toggle">

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

                <TrainDropdown
                  value={trainNumber}
                  onChange={(value) => {

                    setTrainNumber(value);

                    const train =
                      trains.find(
                        (t) =>
                          t.number === value
                      );

                    if (train) {

                      setStation(
                        train.stations[
                        train.stations.length - 1
                        ][0]
                      );

                    }

                  }}
                />

              ) : (

                <div className="manual-box">

                  <TrainIcon />

                  <input
                    value={manualTrain}
                    onChange={(e) =>
                      setManualTrain(
                        e.target.value
                      )
                    }
                    placeholder="Enter train number"
                  />

                </div>

              )}

            </div>

            {/* =================================================
                STATION
                ================================================= */}

            <div className="input-section">

              <div className="input-label-row">

                <label>
                  Station to Check
                </label>

                <div className="mode-toggle">

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

                <StationDropdown
                  stations={
                    selectedTrain.stations
                  }
                  value={station}
                  onChange={setStation}
                />

              ) : (

                <div className="manual-box">

                  <LocationIcon />

                  <input
                    value={manualStation}
                    onChange={(e) =>
                      setManualStation(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="Enter station code"
                  />

                </div>

              )}

              <p className="input-helper">
                Choose a station on the selected train route
              </p>

            </div>

            {/* =================================================
                DATE
                ================================================= */}

            <div className="input-section date-section">

              <div className="input-label-row">

                <label>
                  Journey Date
                </label>

                <div className="mode-toggle">

                  <button
                    className={
                      dateMode === "calendar"
                        ? "active"
                        : ""
                    }
                    onClick={() => {

                      setDateMode("calendar");
                      setShowCalendar(true);

                    }}
                  >
                    Calendar
                  </button>

                  <button
                    className={
                      dateMode === "manual"
                        ? "active"
                        : ""
                    }
                    onClick={() => {

                      setDateMode("manual");
                      setShowCalendar(false);

                    }}
                  >
                    Manual
                  </button>

                </div>

              </div>

              {dateMode === "calendar" ? (

                <div className="date-wrapper">

                  <button
                    className={`date-box ${showCalendar
                      ? "open"
                      : ""
                      }`}
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

                    <ChevronDown />

                  </button>

                  {showCalendar && (
                    <>

                      <div
                        className="calendar-backdrop"
                        onClick={() =>
                          setShowCalendar(false)
                        }
                      />

                      <CalendarPopup
                        selectedDate={date}
                        onSelect={(value) => {

                          setDate(value);
                          setShowCalendar(false);

                        }}
                      />

                    </>
                  )}

                </div>

              ) : (

                <div className="manual-box">

                  <CalendarIcon />

                  <input
                    value={date}
                    onChange={(e) =>
                      setDate(
                        e.target.value
                      )
                    }
                    placeholder="YYYY-MM-DD"
                  />

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              PREDICT BUTTON
              ================================================= */}

          <button
            className="predict-button"
            onClick={() => {
              const finalTrain =
                trainMode === "select"
                  ? trainNumber
                  : manualTrain.trim();

              const finalStation =
                stationMode === "select"
                  ? station
                  : manualStation.trim().toUpperCase();

              const finalDate =
                date.trim();

              onPredict({
                trainNumber: finalTrain,
                station: finalStation,
                date: finalDate,
              });
            }}
            disabled={loading}
          >


            {loading
              ? "Predicting..."
              : "Predict Delay"}

            {!loading && <ArrowRight />}

          </button>

        </section>

      </main>

    </>
  );
}

/* =========================================================
   RESULT PAGE
   ========================================================= */

function ResultPage({
  trainNumber,
  station,
  date,
  prediction,
  onBack,
}) {
  const train =
    trains.find(
      (item) =>
        item.number === String(trainNumber)
    ) || trains[0];

  const stationData =
    train.stations.find(
      (item) => item[0] === station
    ) ||
    train.stations[
    train.stations.length - 1
    ];

  const predictedDelay =
    prediction
      ? Math.round(
        prediction.predicted_delay_minutes
      )
      : 0;

  const scheduledArrival =
    prediction?.scheduled_arrival ||
    "--:--";

  const expectedArrival =
    prediction?.expected_actual_arrival ||
    "--:--";

  const advisory =
    prediction?.status_advisory ||
    "Prediction available.";

  /*
   * The backend currently does not provide
   * a real confidence percentage.
   *
   * Therefore the old hardcoded 98%
   * is intentionally not displayed.
   */

  const delayFactor = Math.min(
    100,
    Math.max(
      5,
      Math.round(
        (Math.abs(predictedDelay) / 300) * 100
      )
    )
  );

  const routeProgress = prediction
    ? Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (
            prediction.distance_from_source_km /
            Math.max(
              prediction.distance_from_source_km +
              prediction.distance_to_destination_km,
              1
            )
          ) * 100
        )
      )
    )
    : 0;

  return (
    <main className="result-page">

      {/* =================================================
          BACK
          ================================================= */}

      <button
        className="back-button"
        onClick={onBack}
      >
        <ArrowLeft />
        New Prediction
      </button>

      {/* =================================================
          RESULT HERO
          ================================================= */}

      <section className="result-hero">

        <div className="result-hero-left">

          <div className="result-pill">
            PREDICTION RESULT
          </div>

          <h1>
            {prediction?.train_name ||
              train.name}
          </h1>

          <p className="result-route">

            Train{" "}
            {prediction?.train_number ||
              train.number}

            <span>•</span>

            {prediction?.station_code ||
              stationData[0]}

            <span>•</span>

            {prediction?.journey_date ||
              date}

          </p>

          <div className="delay-result">

            <span className="delay-result-label">
              Predicted Delay
            </span>

            <div className="delay-result-number">

              {predictedDelay}

              <span>
                min
              </span>

            </div>

            <div className="delay-result-status">
              {advisory}
            </div>

          </div>

        </div>

        {/* =================================================
            MODEL STATUS
            ================================================= */}

        <div className="confidence-large">

          <div className="confidence-icon-large">
            <ShieldIcon />
          </div>

          <span>
            Prediction Status
          </span>

          <strong>
            Ready
          </strong>

          <div className="confidence-large-bar">

            <div
              style={{
                width: "100%",
              }}
            />

          </div>

          <p>
            Prediction generated by Synapse ML model
          </p>

        </div>

      </section>

      {/* =================================================
          EXPECTED ARRIVAL
          ================================================= */}

      <section className="arrival-card">

        <div className="arrival-heading">

          <div>

            <span>
              EXPECTED ARRIVAL
            </span>

            <h2>
              Arrival time prediction
            </h2>

          </div>

          <div className="route-badge">
            {prediction?.station_name ||
              stationData[1]}
          </div>

        </div>

        <div className="arrival-times">

          {/* SCHEDULED */}

          <div className="arrival-time">

            <span>
              Scheduled Arrival
            </span>

            <strong>
              {scheduledArrival}
            </strong>

            <small>
              Expected timetable
            </small>

          </div>

          {/* LINE */}

          <div className="arrival-line">

            <div className="line-dot" />

            <div className="line" />

            <ArrowRight />

            <div className="line" />

            <div className="line-dot purple" />

          </div>

          {/* EXPECTED */}

          <div className="arrival-time expected-time">

            <span>
              Expected Arrival
            </span>

            <strong>
              {expectedArrival}
            </strong>

            <small>
              Predicted actual time
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          DETAILS
          ================================================= */}

      <section className="details-grid">

        {/* =================================================
            REASONS
            ================================================= */}

        <div className="reasons-card result-reasons">

          <div className="card-heading">

            <div>

              <span>
                ANALYSIS
              </span>

              <h2>
                Reasons for Prediction
              </h2>

            </div>

            <div className="analysis-badge">
              Model Factors
            </div>

          </div>

          <Reason
            title="Predicted Delay"
            impact="Model output"
            percentage={delayFactor}
            type="orange"
          />

          <Reason
            title="Route Position"
            impact="Model input"
            percentage={routeProgress}
            type="purple"
          />

          <Reason
            title="Journey Day"
            impact="Model input"
            percentage={
              prediction ? 100 : 0
            }
            type="pink"
          />

          <Reason
            title="Station Information"
            impact="Model input"
            percentage={
              prediction ? 100 : 0
            }
            type="green"
          />

          <p
            style={{
              marginTop: "18px",
              fontSize: "12px",
              color: "#777",
              lineHeight: "1.5",
            }}
          >
            These indicators represent model inputs and
            output information. They are not individual
            feature-importance percentages.
          </p>

        </div>

        {/* =================================================
            JOURNEY DETAILS
            ================================================= */}

        <div className="journey-card">

          <div className="card-heading">

            <div>

              <span>
                JOURNEY
              </span>

              <h2>
                Journey Details
              </h2>

            </div>

          </div>

          <div className="journey-row">

            <span>
              Train
            </span>

            <strong>
              {prediction?.train_number ||
                train.number}
              {" — "}
              {prediction?.train_name ||
                train.name}
            </strong>

          </div>

          <div className="journey-row">

            <span>
              Route
            </span>

            <strong>
              {train.route}
            </strong>

          </div>

          <div className="journey-row">

            <span>
              Station
            </span>

            <strong>
              {prediction?.station_code ||
                stationData[0]}
              {" — "}
              {prediction?.station_name ||
                stationData[1]}
            </strong>

          </div>

          <div className="journey-row">

            <span>
              Distance from Source
            </span>

            <strong>
              {prediction
                ? `${prediction.distance_from_source_km} km`
                : "--"}
            </strong>

          </div>

          <div className="journey-row">

            <span>
              Distance to Destination
            </span>

            <strong>
              {prediction
                ? `${prediction.distance_to_destination_km} km`
                : "--"}
            </strong>

          </div>

          <div className="journey-row">

            <span>
              Day
            </span>

            <strong>
              {prediction?.day_of_week ||
                "--"}
            </strong>

          </div>

          <div className="journey-row">

            <span>
              Journey Date
            </span>

            <strong>
              {prediction?.journey_date ||
                date}
            </strong>

          </div>

        </div>

      </section>

      {/* =================================================
          INFORMATION
          ================================================= */}

      <section className="result-information">

        <div className="information-icon">
          <ShieldIcon />
        </div>

        <div>

          <strong>
            About this prediction
          </strong>

          <p>
            Synapse uses the trained machine-learning
            model together with train, station, timetable,
            route and journey-date information to estimate
            the expected delay at the selected station.
          </p>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {

  const [page, setPage] =
    useState("predict");

  const [trainNumber, setTrainNumber] =
    useState("12625");

  const [station, setStation] =
    useState("NDLS");

  const [date, setDate] =
    useState("2026-07-25");

  const [prediction, setPrediction] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     REAL BACKEND PREDICTION
     ======================================================= */
  const handlePredict = async ({
    trainNumber: inputTrainNumber,
    station: inputStation,
    date: inputDate,
  }) => {
    setLoading(true);
    setError("");

    const finalTrainNumber =
      String(inputTrainNumber).trim();

    const finalStation =
      String(inputStation).trim().toUpperCase();

    const finalDate =
      String(inputDate).trim();

    if (!finalTrainNumber) {
      setError("Please enter a train number.");
      setLoading(false);
      return;
    }

    if (!finalStation) {
      setError("Please enter a station code.");
      setLoading(false);
      return;
    }

    if (!finalDate) {
      setError("Please enter a journey date.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            train_number: Number(finalTrainNumber),
            station_code: finalStation,
            journey_date: finalDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Prediction request failed."
        );
      }

      setPrediction(data);

      setTrainNumber(
        String(data.train_number)
      );

      setStation(
        data.station_code
      );

      setDate(
        data.journey_date
      );

      setPage("result");

    } catch (err) {
      console.error(
        "Prediction error:",
        err
      );

      setError(
        err.message ||
        "Could not connect to the prediction server."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* ===================================================
          NAVBAR
          =================================================== */}

      <header className="navbar">

        <div className="navbar-inner">

          <button
            className="logo-button"
            onClick={() =>
              setPage("predict")
            }
          >

            <SynapseLogo />

          </button>

          <nav className="nav-links">

            <button
              className={
                page === "predict"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPage("predict")
              }
            >
              Predict
            </button>

            <button>
              Train Status
            </button>

            <button>
              About
            </button>

            <div className="avatar">
              A
            </div>

          </nav>

        </div>

      </header>

      {/* ===================================================
          PAGE
          =================================================== */}

      {page === "predict" ? (

        <>

          <PredictionPage

            trainNumber={
              trainNumber
            }

            setTrainNumber={
              setTrainNumber
            }

            station={
              station
            }

            setStation={
              setStation
            }

            date={
              date
            }

            setDate={
              setDate
            }

            onPredict={
              handlePredict
            }

            loading={
              loading
            }

          />

          {/* =================================================
              ERROR MESSAGE
              ================================================= */}

          {error && (

            <div
              style={{
                maxWidth: "1100px",
                margin: "0 auto 30px",
                padding: "14px 18px",
                borderRadius: "10px",
                background: "#fff1f1",
                border: "1px solid #ffd0d0",
                color: "#c62828",
                fontSize: "14px",
              }}
            >

              <strong>
                Prediction Error:
              </strong>

              <br />

              {error}

            </div>

          )}

        </>

      ) : (

        <ResultPage

          trainNumber={
            prediction?.train_number ||
            trainNumber
          }

          station={
            prediction?.station_code ||
            station
          }

          date={
            prediction?.journey_date ||
            date
          }

          prediction={
            prediction
          }

          onBack={() =>
            setPage("predict")
          }

        />

      )}

      {/* ===================================================
          LOADING OVERLAY
          =================================================== */}

      {loading && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(255,255,255,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >

          <div
            style={{
              background: "white",
              padding: "25px 35px",
              borderRadius: "14px",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.12)",
              textAlign: "center",
            }}
          >

            <strong
              style={{
                display: "block",
                fontSize: "18px",
                marginBottom: "8px",
              }}
            >
              Predicting delay...
            </strong>

            <span
              style={{
                color: "#777",
                fontSize: "13px",
              }}
            >
              Synapse is processing the journey data.
            </span>

          </div>

        </div>

      )}

      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="footer">

        <SynapseLogo small />

        <div className="footer-right">
          © 2026 Synapse | AI-Powered Train Delay Prediction System
        </div>

      </footer>

    </div>
  );
}

export default App;
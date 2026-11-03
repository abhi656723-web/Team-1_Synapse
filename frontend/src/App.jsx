import React, { useEffect, useState } from "react";
import "./App.css";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const KEYS = { theme: "synapse-theme", favorites: "synapse-favorites", recent: "synapse-recent", history: "synapse-history", prefs: "synapse-preferences" };
const readStore = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } };

const trains = [
  {
    number: "12625", name: "Kerala Express", route: "Thiruvananthapuram → New Delhi",
    stations: [["TVC", "Thiruvananthapuram Central"], ["VAK", "Varkala Sivagiri"], ["QLN", "Kollam Jn"], ["KYJ", "Kayamkulam Jn"], ["MVLK", "Mavelikara"], ["CNGR", "Chengannur"], ["TRVL", "Tiruvalla"], ["CGY", "Changanasseri"], ["KTYM", "Kottayam"], ["ERN", "Ernakulam Town"], ["AWY", "Aluva"], ["TCR", "Thrissur"], ["OTP", "Ottapalam"], ["PGT", "Palakkad Jn"], ["CBE", "Coimbatore Jn"], ["TUP", "Tiruppur"], ["ED", "Erode Jn"], ["SA", "Salem Jn"], ["JTJ", "Jolarpettai"], ["KPD", "Katpadi Jn"], ["CTO", "Chittoor"], ["TPTY", "Tirupati"], ["RU", "Renigunta Jn"], ["GDR", "Gudur Jn"], ["NLR", "Nellore"], ["BZA", "Vijayawada Jn"], ["WL", "Warangal"], ["RDM", "Ramagundam"], ["SKZR", "Sirpur Kaghaznagar"], ["BPQ", "Balharshah"], ["CD", "Chandrapur"], ["SEGM", "Sewagram"], ["NGP", "Nagpur"], ["ET", "Itarsi Jn"], ["BPL", "Bhopal Jn"], ["BINA", "Bina Jn"], ["VGLJ", "VGL Jhansi"], ["GWL", "Gwalior Jn"], ["AGC", "Agra Cantt"], ["MTJ", "Mathura Jn"], ["FDB", "Faridabad"], ["NZM", "Hazrat Nizamuddin"], ["NDLS", "New Delhi"]]
  },
  {
    number: "12623", name: "Chennai Mail", route: "Chennai Central → New Delhi",
    stations: [["MAS", "Chennai Central"], ["GDR", "Gudur Jn"], ["NLR", "Nellore"], ["OGL", "Ongole"], ["BZA", "Vijayawada Jn"], ["KMT", "Khammam"], ["WL", "Warangal"], ["BPQ", "Balharshah"], ["NGP", "Nagpur"], ["ET", "Itarsi Jn"], ["BPL", "Bhopal Jn"], ["VGLJ", "VGL Jhansi"], ["GWL", "Gwalior Jn"], ["AGC", "Agra Cantt"], ["MTJ", "Mathura Jn"], ["NDLS", "New Delhi"]]
  },
  {
    number: "12951", name: "Mumbai Rajdhani", route: "Mumbai Central → New Delhi",
    stations: [["MMCT", "Mumbai Central"], ["BVI", "Borivali"], ["ST", "Surat"], ["BRC", "Vadodara Jn"], ["RTM", "Ratlam Jn"], ["KOTA", "Kota Jn"], ["NDLS", "New Delhi"]]
  },
  {
    number: "12002", name: "Bhopal Shatabdi", route: "New Delhi → Rani Kamlapati",
    stations: [["NDLS", "New Delhi"], ["MTJ", "Mathura Jn"], ["AGC", "Agra Cantt"], ["DHO", "Dholpur"], ["MRA", "Morena"], ["GWL", "Gwalior Jn"], ["VGLJ", "VGL Jhansi"], ["BINA", "Bina Jn"], ["BPL", "Bhopal Jn"], ["RKMP", "Rani Kamlapati"]]
  },
  {
    number: "22436", name: "Vande Bharat Express", route: "New Delhi → Varanasi",
    stations: [["NDLS", "New Delhi"], ["CNB", "Kanpur Central"], ["PRYJ", "Prayagraj Jn"], ["BSB", "Varanasi Jn"]]
  },
  {
    number: "12273", name: "Howrah Duronto", route: "Howrah → New Delhi",
    stations: [["HWH", "Howrah Jn"], ["ASN", "Asansol Jn"], ["JSME", "Jasidih Jn"], ["PNBE", "Patna Jn"], ["DDU", "Pt DD Upadhyaya Jn"], ["CNB", "Kanpur Central"], ["NDLS", "New Delhi"]]
  },
  {
    number: "12810", name: "Howrah Mail", route: "Mumbai CSMT → Howrah",
    stations: [["CSMT", "Mumbai CSMT"], ["DR", "Dadar"], ["TNA", "Thane"], ["KYN", "Kalyan Jn"], ["KSRA", "Kasara"], ["IGP", "Igatpuri"], ["NK", "Nashik Road"], ["MMR", "Manmad Jn"], ["JL", "Jalgaon Jn"], ["BSL", "Bhusaval Jn"], ["AK", "Akola Jn"], ["BD", "Badnera Jn"], ["WR", "Wardha Jn"], ["NGP", "Nagpur"], ["G", "Gondia Jn"], ["DURG", "Durg"], ["R", "Raipur Jn"], ["BSP", "Bilaspur Jn"], ["JSG", "Jharsuguda Jn"], ["ROU", "Rourkela"], ["TATA", "Tatanagar Jn"], ["KGP", "Kharagpur Jn"], ["SRC", "Santragachi Jn"], ["HWH", "Howrah Jn"]]
  },
  {
    number: "16345", name: "Netravati Express", route: "Thiruvananthapuram → Lokmanya Tilak",
    stations: [["TVC", "Thiruvananthapuram"], ["QLN", "Kollam Jn"], ["KYJ", "Kayamkulam Jn"], ["ALLP", "Alappuzha"], ["ERS", "Ernakulam Jn"], ["AWY", "Aluva"], ["TCR", "Thrissur"], ["SRR", "Shoranur Jn"], ["TIR", "Tirur"], ["CLT", "Kozhikode"], ["BDJ", "Vadakara"], ["TLY", "Thalassery"], ["CAN", "Kannur"], ["PAY", "Payyanur"], ["KZE", "Kanhangad"], ["KGQ", "Kasaragod"], ["MAJN", "Mangaluru Jn"], ["UD", "Udupi"], ["KUDA", "Kundapura"], ["BYNR", "Mookambika Road"], ["BTJL", "Bhatkal"], ["MRDW", "Murdeshwar"], ["KT", "Kumta"], ["KAWR", "Karwar"], ["MAO", "Madgaon"], ["KRMI", "Karmali"], ["KUDL", "Kudal"], ["RN", "Ratnagiri"], ["CHI", "Chiplun"], ["PNVL", "Panvel"], ["TNA", "Thane"], ["LTT", "Lokmanya Tilak Terminus"]]
  },
  {
    number: "12615", name: "Grand Trunk Express", route: "Chennai Central → New Delhi",
    stations: [["MAS", "Chennai Central"], ["GDR", "Gudur Jn"], ["NLR", "Nellore"], ["OGL", "Ongole"], ["TEL", "Tenali Jn"], ["BZA", "Vijayawada Jn"], ["KMT", "Khammam"], ["WL", "Warangal"], ["RDM", "Ramagundam"], ["SKZR", "Sirpur Kaghaznagar"], ["BPQ", "Balharshah"], ["CD", "Chandrapur"], ["WR", "Wardha Jn"], ["NGP", "Nagpur"], ["PAR", "Pandhurna"], ["BZU", "Betul"], ["ET", "Itarsi Jn"], ["BPL", "Bhopal Jn"], ["BINA", "Bina Jn"], ["VGLJ", "VGL Jhansi"], ["GWL", "Gwalior Jn"], ["AGC", "Agra Cantt"], ["MTJ", "Mathura Jn"], ["FDB", "Faridabad"], ["NZM", "Hazrat Nizamuddin"], ["NDLS", "New Delhi"]]
  },
  {
    number: "12841", name: "Coromandel Express", route: "Shalimar → Chennai Central",
    stations: [["SHM", "Shalimar"], ["SRC", "Santragachi Jn"], ["KGP", "Kharagpur Jn"], ["BLS", "Baleshwar"], ["BHC", "Bhadrak"], ["JJKR", "Jajpur K Road"], ["CTC", "Cuttack"], ["BBS", "Bhubaneswar"], ["KUR", "Khurda Road Jn"], ["BAM", "Brahmapur"], ["PSA", "Palasa"], ["VSKP", "Visakhapatnam"], ["RJY", "Rajahmundry"], ["TDD", "Tadepalligudem"], ["EE", "Eluru"], ["BZA", "Vijayawada Jn"], ["MAS", "Chennai Central"]]
  },
  {
    number: "12137", name: "Punjab Mail", route: "Mumbai CSMT → Firozpur Cantt",
    stations: [["CSMT", "Mumbai CSMT"], ["DR", "Dadar"], ["TNA", "Thane"], ["KYN", "Kalyan Jn"], ["KSRA", "Kasara"], ["IGP", "Igatpuri"], ["NK", "Nashik Road"], ["MMR", "Manmad Jn"], ["JL", "Jalgaon Jn"], ["BSL", "Bhusaval Jn"], ["BAU", "Burhanpur"], ["KNW", "Khandwa"], ["ET", "Itarsi Jn"], ["BPL", "Bhopal Jn"], ["BINA", "Bina Jn"], ["VGLJ", "VGL Jhansi"], ["GWL", "Gwalior Jn"], ["AGC", "Agra Cantt"], ["MTJ", "Mathura Jn"], ["FDB", "Faridabad"], ["NZM", "Hazrat Nizamuddin"], ["NDLS", "New Delhi"], ["BGZ", "Bahadurgarh"], ["ROK", "Rohtak Jn"], ["JIND", "Jind Jn"], ["BTI", "Bathinda Jn"], ["FDK", "Faridkot"], ["FZR", "Firozpur Cantt"]]
  },
  {
    number: "12301", name: "Howrah Rajdhani", route: "Howrah → New Delhi",
    stations: [["HWH", "Howrah Jn"], ["ASN", "Asansol Jn"], ["DHN", "Dhanbad Jn"], ["PNME", "Parasnath"], ["GAYA", "Gaya Jn"], ["DDU", "Pt DD Upadhyaya Jn"], ["PRYJ", "Prayagraj Jn"], ["CNB", "Kanpur Central"], ["NDLS", "New Delhi"]]
  },
  {
    number: "12627", name: "Karnataka Express", route: "Bengaluru → New Delhi",
    stations: [["SBC", "KSR Bengaluru"], ["BNC", "Bengaluru Cantt"], ["YNK", "Yelahanka Jn"], ["HUP", "Hindupur"], ["DMM", "Dharmavaram Jn"], ["ATP", "Anantapur"], ["GTL", "Guntakal Jn"], ["RC", "Raichur"], ["WADI", "Wadi"], ["KLBG", "Kalaburagi"], ["SUR", "Solapur"], ["DD", "Daund Jn"], ["ANG", "Ahmednagar"], ["BAP", "Belapur"], ["KPG", "Kopargaon"], ["MMR", "Manmad Jn"], ["BSL", "Bhusaval Jn"], ["KNW", "Khandwa"], ["ET", "Itarsi Jn"], ["BPL", "Bhopal Jn"], ["BINA", "Bina Jn"], ["VGLJ", "VGL Jhansi"], ["GWL", "Gwalior Jn"], ["AGC", "Agra Cantt"], ["MTJ", "Mathura Jn"], ["NZM", "Hazrat Nizamuddin"], ["NDLS", "New Delhi"]]
  },
  {
    number: "12925", name: "Paschim Express", route: "Bandra Terminus → Amritsar",
    stations: [["BDTS", "Bandra Terminus"], ["BVI", "Borivali"], ["VAPI", "Vapi"], ["BL", "Valsad"], ["NVS", "Navsari"], ["ST", "Surat"], ["BH", "Bharuch Jn"], ["BRC", "Vadodara Jn"], ["GDA", "Godhra Jn"], ["DHD", "Dahod"], ["RTM", "Ratlam Jn"], ["NAD", "Nagda Jn"], ["KOTA", "Kota Jn"], ["SWM", "Sawai Madhopur"], ["GGC", "Gangapur City"], ["BXN", "Bayana Jn"], ["BTE", "Bharatpur Jn"], ["MTJ", "Mathura Jn"], ["FDB", "Faridabad"], ["NZM", "Hazrat Nizamuddin"], ["NDLS", "New Delhi"], ["SZM", "Sabzi Mandi"], ["SNP", "Sonipat"], ["PNP", "Panipat Jn"], ["UMB", "Ambala Cantt Jn"], ["SIR", "Sirhind Jn"], ["LDH", "Ludhiana Jn"], ["PGW", "Phagwara Jn"], ["JUC", "Jalandhar City"], ["BEAS", "Beas"], ["ASR", "Amritsar Jn"]]
  },
  {
    number: "12727", name: "Godavari Express", route: "Visakhapatnam → Hyderabad",
    stations: [["VSKP", "Visakhapatnam"], ["DVD", "Duvvada"], ["AKP", "Anakapalle"], ["TUNI", "Tuni"], ["ANV", "Annavaram"], ["SLO", "Samalkot Jn"], ["RJY", "Rajahmundry"], ["NDD", "Nidadavolu Jn"], ["TDD", "Tadepalligudem"], ["EE", "Eluru"], ["BZA", "Vijayawada Jn"], ["KMT", "Khammam"], ["MABD", "Mahbubabad"], ["WL", "Warangal"], ["KZJ", "Kazipet Jn"], ["SC", "Secunderabad Jn"], ["HYB", "Hyderabad Deccan"]]
  },
  {
    number: "12295", name: "Sanghamitra Express", route: "SMVT Bengaluru → Danapur",
    stations: [["SMVB", "SMVT Bengaluru"], ["KJM", "Krishnarajapuram"], ["BWT", "Bangarapet"], ["JTJ", "Jolarpettai"], ["KPD", "Katpadi Jn"], ["AJJ", "Arakkonam Jn"], ["MAS", "Chennai Central"], ["GDR", "Gudur Jn"], ["NLR", "Nellore"], ["OGL", "Ongole"], ["BZA", "Vijayawada Jn"], ["KMT", "Khammam"], ["WL", "Warangal"], ["RDM", "Ramagundam"], ["SKZR", "Sirpur Kaghaznagar"], ["BPQ", "Balharshah"], ["CD", "Chandrapur"], ["SEGM", "Sewagram"], ["NGP", "Nagpur"], ["BZU", "Betul"], ["ET", "Itarsi Jn"], ["PPI", "Pipariya"], ["NU", "Narsinghpur"], ["JBP", "Jabalpur"], ["KTE", "Katni"], ["MYR", "Maihar"], ["STA", "Satna"], ["PCOI", "Prayagraj Chheoki"], ["MZP", "Mirzapur"], ["DDU", "Pt DD Upadhyaya Jn"], ["DLN", "Dildarnagar Jn"], ["BXR", "Buxar"], ["ARA", "Ara Jn"], ["DNR", "Danapur"]]
  },
  {
    number: "11019", name: "Konark Express", route: "Mumbai CSMT → Bhubaneswar",
    stations: [["CSMT", "Mumbai CSMT"], ["DR", "Dadar"], ["TNA", "Thane"], ["KYN", "Kalyan Jn"], ["KJT", "Karjat"], ["LNL", "Lonavala"], ["PUNE", "Pune Jn"], ["DD", "Daund Jn"], ["SUR", "Solapur"], ["KLBG", "Kalaburagi"], ["WADI", "Wadi"], ["TDU", "Tandur"], ["VKB", "Vikarabad Jn"], ["SC", "Secunderabad Jn"], ["KZJ", "Kazipet Jn"], ["WL", "Warangal"], ["MABD", "Mahbubabad"], ["KMT", "Khammam"], ["BZA", "Vijayawada Jn"], ["EE", "Eluru"], ["TDD", "Tadepalligudem"], ["NDD", "Nidadavolu Jn"], ["RJY", "Rajahmundry"], ["SLO", "Samalkot Jn"], ["TUNI", "Tuni"], ["AKP", "Anakapalle"], ["VSKP", "Visakhapatnam"], ["VZM", "Vizianagaram Jn"], ["CHE", "Srikakulam Road"], ["PSA", "Palasa"], ["BAM", "Brahmapur"], ["BALU", "Balugaon"], ["KUR", "Khurda Road Jn"], ["BBS", "Bhubaneswar"]]
  },
  {
    number: "12431", name: "Trivandrum Rajdhani", route: "Thiruvananthapuram → Hazrat Nizamuddin",
    stations: [["TVC", "Thiruvananthapuram"], ["QLN", "Kollam Jn"], ["ALLP", "Alappuzha"], ["ERS", "Ernakulam Jn"], ["TCR", "Thrissur"], ["SRR", "Shoranur Jn"], ["CLT", "Kozhikode"], ["CAN", "Kannur"], ["KGQ", "Kasaragod"], ["MAJN", "Mangaluru Jn"], ["UD", "Udupi"], ["KAWR", "Karwar"], ["MAO", "Madgaon"], ["RN", "Ratnagiri"], ["PNVL", "Panvel"], ["BSR", "Vasai Road"], ["ST", "Surat"], ["BRC", "Vadodara Jn"], ["RTM", "Ratlam Jn"], ["KOTA", "Kota Jn"], ["NZM", "Hazrat Nizamuddin"]]
  },
  {
    number: "22691", name: "Bengaluru Rajdhani", route: "Bengaluru → Hazrat Nizamuddin",
    stations: [["SBC", "KSR Bengaluru"], ["SSPN", "Sri Sathya Sai Prashanthi Nilayam"], ["DMM", "Dharmavaram Jn"], ["GTL", "Guntakal Jn"], ["RC", "Raichur"], ["SC", "Secunderabad Jn"], ["KZJ", "Kazipet Jn"], ["BPQ", "Balharshah"], ["NGP", "Nagpur"], ["BPL", "Bhopal Jn"], ["VGLJ", "VGL Jhansi"], ["GWL", "Gwalior Jn"], ["AGC", "Agra Cantt"], ["NZM", "Hazrat Nizamuddin"]]
  },
  {
    number: "12555", name: "Gorakhdham Express", route: "Gorakhpur → Bathinda",
    stations: [["GKP", "Gorakhpur Jn"], ["KLD", "Khalilabad"], ["BST", "Basti"], ["MUR", "Mankapur Jn"], ["GD", "Gonda Jn"], ["LKO", "Lucknow NR"], ["ON", "Unnao Jn"], ["CNB", "Kanpur Central"], ["NDLS", "New Delhi"], ["BGZ", "Bahadurgarh"], ["ROK", "Rohtak Jn"], ["KLNK", "Kalanaur Kalan"], ["BNW", "Bhiwani Jn"], ["HSR", "Hisar Jn"], ["STD", "Sirsa"], ["BTI", "Bathinda Jn"]]
  }
];

function useIstClock(timeFormat = "24h") {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id); }, []);
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: timeFormat === "12h" }).format(now);
}
function Modal({ title, onClose, children, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className={`modal ${wide ? "modal-wide" : ""}`} onMouseDown={e => e.stopPropagation()}><header className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close">×</button></header>{children}</section></div>;
}
function App() {
  const [page, setPage] = useState("predict");
  const [trainNumber, setTrainNumber] = useState("12625");
  const [station, setStation] = useState("NDLS");
  const [date, setDate] = useState(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
  const [trainInputMode, setTrainInputMode] = useState("select");
  const [stationInputMode, setStationInputMode] = useState("select");
  const [dateInputMode, setDateInputMode] = useState("picker");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => readStore(KEYS.theme, "light"));
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState("");
  const [favorites, setFavorites] = useState(() => readStore(KEYS.favorites, []));
  const [recent, setRecent] = useState(() => readStore(KEYS.recent, []));
  const [history, setHistory] = useState(() => readStore(KEYS.history, []));
  const [prefs, setPrefs] = useState(() => readStore(KEYS.prefs, { timeFormat: "24h", alertsEnabled: false, alertThreshold: 30 }));
  const [helpQuery, setHelpQuery] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [actualDelay, setActualDelay] = useState("");
  const [actualMessage, setActualMessage] = useState("");
  const [actualSubmitting, setActualSubmitting] = useState(false);
  const [actualSubmitted, setActualSubmitted] = useState(false);
  const [coachData, setCoachData] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const clock = useIstClock(prefs.timeFormat);
  const selectedTrain = trains.find(t => t.number === String(trainNumber)) || trains[0];
  const selectedStation = selectedTrain?.stations?.find(s => s[0] === station) || [station, `${station} Station`];

  useEffect(() => { document.documentElement.dataset.theme = theme; writeStore(KEYS.theme, theme); }, [theme]);
  useEffect(() => { writeStore(KEYS.favorites, favorites); }, [favorites]);
  useEffect(() => { writeStore(KEYS.recent, recent); }, [recent]);
  useEffect(() => { writeStore(KEYS.history, history); }, [history]);
  useEffect(() => { writeStore(KEYS.prefs, prefs); }, [prefs]);

  useEffect(() => {
    if (page !== "result" || !trainNumber) return;
    let cancelled = false;
    setCoachLoading(true); setCoachError(""); setCoachData(null); setSelectedCoach(null);
    fetch(`${API_URL}/coach-composition/${encodeURIComponent(trainNumber)}`)
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.detail || "Could not load coach composition."); return body; })
      .then(body => { if (!cancelled) setCoachData(body); })
      .catch(error => { if (!cancelled) setCoachError(error.message || "Coach composition is unavailable."); })
      .finally(() => { if (!cancelled) setCoachLoading(false); });
    return () => { cancelled = true; };
  }, [page, trainNumber]);

  const toggleFavorite = (number) => setFavorites(old => old.includes(number) ? old.filter(x => x !== number) : [...old, number]);
  const recordRecent = (item) => setRecent(old => [item, ...old.filter(x => !(x.train_number === item.train_number && x.station_code === item.station_code && x.journey_date === item.journey_date))].slice(0, 12));

  async function handlePredict(payload) {
    const t = String(payload.trainNumber || "").trim();
    const st = String(payload.station || "").trim().toUpperCase();
    const d = String(payload.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(`${d}T00:00:00`))) { setError("Enter a valid journey date in YYYY-MM-DD format."); return; }
    if (!t || !st) { setError("Please enter both train number and station code."); return; }
    setLoading(true); setError(""); setActualMessage("");
    try {
      const response = await fetch(`${API_URL}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ train_number: t, station_code: st, journey_date: d }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || "Prediction request failed.");
      setPrediction(body); setTrainNumber(t); setStation(st); setDate(d);
      const item = { train_number: t, train_name: trains.find(x => x.number === t)?.name || `Train ${t}`, station_code: st, journey_date: d, predicted_delay_minutes: body.predicted_delay_minutes, status_advisory: body.status_advisory, predicted_at: new Date().toISOString(), factors: body.factors || [] };
      setHistory(old => [item, ...old].slice(0, 100)); recordRecent({ train_number: t, station_code: st, journey_date: d, searched_at: new Date().toISOString() });
      setActualDelay(""); setActualMessage(""); setActualSubmitted(false); setPage("result");
      if (prefs.alertsEnabled && Number(body.predicted_delay_minutes) >= Number(prefs.alertThreshold) && "Notification" in window && Notification.permission === "granted") new Notification("Synapse delay alert", { body: `${item.train_name}: predicted delay ${Math.round(body.predicted_delay_minutes)} minutes at ${st}.` });
    } catch (e) { setError(e.message || "Could not connect to the Synapse API."); }
    finally { setLoading(false); }
  }

  async function submitRating(e) {
    e.preventDefault();
    if (ratingSubmitting || ratingSubmitted) return;
    setRatingMessage("");
    if (!rating) { setRatingMessage("Please select a star rating."); return; }
    setRatingSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, comment: feedback }) });
      const body = await res.json();
      if (!res.ok || body.saved !== true) throw new Error(body.detail || "Feedback could not be confirmed as saved.");
      setRatingSubmitted(true);
    } catch (e) { setRatingMessage(`${e.message} Your feedback has not been confirmed as saved.`); }
    finally { setRatingSubmitting(false); }
  }

  async function submitActual(e) {
    e.preventDefault();
    if (actualSubmitting || actualSubmitted) return;
    setActualMessage("");
    const value = Number(actualDelay);
    if (actualDelay === "" || !Number.isFinite(value) || value < 0) { setActualMessage("Enter a valid actual delay (0 or more minutes)."); return; }
    setActualSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/actual-delay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ train_number: String(trainNumber), station_code: station, journey_date: date, predicted_delay_minutes: Number(prediction.predicted_delay_minutes), actual_delay_minutes: value }) });
      const body = await res.json();
      if (!res.ok || body.saved !== true) throw new Error(body.detail || "Could not confirm that the actual delay was saved.");
      setActualSubmitted(true);
    } catch (e) { setActualMessage(e.message || "Actual delay submission failed."); }
    finally { setActualSubmitting(false); }
  }
  async function loadAnalytics() {
    setPage("analytics");
    try { const res = await fetch(`${API_URL}/analytics`); const body = await res.json(); if (!res.ok) throw new Error(body.detail || "Analytics unavailable"); setAnalytics(body); }
    catch { setAnalytics({ count: 0, message: "Analytics endpoint unavailable. Start the updated FastAPI backend." }); }
  }
  async function sharePrediction() {
    const text = `Synapse prediction\nTrain: ${trainNumber} - ${selectedTrain?.name || ""}\nStation: ${station}\nJourney date: ${date}\nPredicted delay: ${prediction?.predicted_delay_minutes} minutes\nAdvisory: ${prediction?.status_advisory}\nPrediction is an estimate, not an official railway update.`;
    try { if (navigator.share) await navigator.share({ title: "Synapse train delay prediction", text }); else { await navigator.clipboard.writeText(text); alert("Prediction copied to clipboard."); } }
    catch (e) { if (e.name !== "AbortError") { try { await navigator.clipboard.writeText(text); alert("Prediction copied to clipboard."); } catch { alert(text); } } }
  }
  function downloadReport() { window.print(); }
  async function enableAlerts() {
    if (prefs.alertsEnabled) { setPrefs(p => ({ ...p, alertsEnabled: false })); return; }
    if (!("Notification" in window)) { alert("Browser notifications are not supported."); return; }
    const permission = await Notification.requestPermission();
    setPrefs(p => ({ ...p, alertsEnabled: permission === "granted" }));
  }
  function openMenu(name) { setMenuOpen(false); if (name === "about") setModal("about"); else if (name === "settings" || name === "help" || name === "rate") { if (name === "rate") { setRatingSubmitted(false); setRatingMessage(""); setRating(0); setFeedback(""); } setModal(name); } }

  const helpItems = [
    ["How to make a prediction", "Choose one of the 20 listed trains or enter a train number manually. Select a station code and journey date, then press Predict Delay."],
    ["Understanding the result", "The predicted delay is the output of the configured ML pipeline. The advisory groups the result into on-time, moderate or severe categories."],
    ["Factors", "The current backend returns date-based seasonal indicators. They are not live weather observations or SHAP explanations."],
    ["Coach composition", "Coach details are shown only when verified composition data has been added. The supplied project does not include verified coach data."],
    ["Backend not reachable", "Start the FastAPI server and check the VITE_API_URL setting. The default is http://127.0.0.1:8000."],
    ["Prediction failed", "Check that all four ML artifact files exist at the configured backend paths and that the train, station and date inputs are valid."],
    ["Disclaimer", "Synapse predictions are estimates generated by a machine-learning model. They are not official Indian Railways announcements or guaranteed train-running information."]
  ];
  const filteredHelp = helpItems.filter(([a, b]) => `${a} ${b}`.toLowerCase().includes(helpQuery.toLowerCase()));

  return <div className="app-shell">
    <header className="topbar"><div className="brand" onClick={() => setPage("predict")} role="button" tabIndex="0"><img className="brand-logo" src="/Synapse-logo.png" alt="Synapse logo" /><div><strong>Synapse</strong><small>AI Train Delay Prediction</small></div></div>
      <div className="topbar-right"><div className="rail-clock"><span className="clock-dot" /><div><small>RAILWAY TIME · IST</small><strong>{clock}</strong></div></div><button className="theme-quick" onClick={() => setTheme(t => t === "light" ? "dark" : "light")} aria-label="Toggle theme">{theme === "light" ? "☾" : "☀"}</button>
        <div className="menu-wrap"><button className="icon-button" onClick={() => setMenuOpen(v => !v)} aria-label="Open menu">⋮</button>{menuOpen && <><button className="menu-dismiss" onClick={() => setMenuOpen(false)} aria-label="Close menu" /><div className="dropdown-panel"><button onClick={() => openMenu("settings")}>⚙ Settings</button><button onClick={() => openMenu("help")}>? Help / User Manual</button><button onClick={() => openMenu("rate")}>★ Rate Synapse</button><button onClick={() => openMenu("about")}>ⓘ About Synapse</button></div></>}</div>
      </div>
    </header>
    <nav className="main-nav"><button className={page === "predict" || page === "result" ? "active" : ""} onClick={() => setPage("predict")}>Predict</button><button className={page === "history" ? "active" : ""} onClick={() => setPage("history")}>History</button><button className={page === "analytics" ? "active" : ""} onClick={loadAnalytics}>Analytics</button><button className={page === "routes" ? "active" : ""} onClick={() => setPage("routes")}>Train Routes</button></nav>

    {page === "predict" && <>
      <section className="hero hero-text-only"><div><span className="eyebrow">AI-POWERED TRAIN DELAY PREDICTION</span><h1>Know your train's delay<br /><em>before it happens.</em></h1><p>Select your train, station and journey date to generate an ML-based delay estimate.</p></div></section>
      <main className="content"><section className="panel prediction-panel"><div className="panel-title"><div><span className="eyebrow">NEW PREDICTION</span><h2>Plan your journey</h2><p>Enter the details below.</p></div><span className="status-chip">● ML API</span></div>
        <div className="form-grid manual-capable-grid">
          <label className="manual-capable-field">
            <span className="field-heading"><span>Train number</span><span className="field-mode-toggle"><button type="button" className={trainInputMode === "select" ? "active" : ""} onClick={() => setTrainInputMode("select")}>List</button><button type="button" className={trainInputMode === "manual" ? "active" : ""} onClick={() => setTrainInputMode("manual")}>Manual</button></span></span>
            {trainInputMode === "select" ? <select value={trainNumber} onChange={e => { setTrainNumber(e.target.value); const t = trains.find(x => x.number === e.target.value); if (t) setStation(t.stations[t.stations.length - 1][0]); }}>{trains.map(t => <option key={t.number} value={t.number}>{t.number} — {t.name}</option>)}</select> : <input type="text" inputMode="numeric" autoComplete="off" maxLength={10} placeholder="Enter train number" value={trainNumber} onChange={e => setTrainNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} />}
          </label>
          <label className="manual-capable-field">
            <span className="field-heading"><span>Station code</span><span className="field-mode-toggle"><button type="button" className={stationInputMode === "select" ? "active" : ""} onClick={() => setStationInputMode("select")}>List</button><button type="button" className={stationInputMode === "manual" ? "active" : ""} onClick={() => setStationInputMode("manual")}>Manual</button></span></span>
            {stationInputMode === "select" ? <select value={station} onChange={e => setStation(e.target.value)}>{(selectedTrain?.stations || []).map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select> : <input type="text" autoComplete="off" maxLength={20} placeholder="Enter station code" value={station} onChange={e => setStation(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20))} />}
          </label>
          <label className="manual-capable-field">
            <span className="field-heading"><span>Journey date</span><span className="field-mode-toggle"><button type="button" className={dateInputMode === "picker" ? "active" : ""} onClick={() => setDateInputMode("picker")}>Calendar</button><button type="button" className={dateInputMode === "manual" ? "active" : ""} onClick={() => setDateInputMode("manual")}>Manual</button></span></span>
            {dateInputMode === "picker" ? <input type="date" value={date} onChange={e => setDate(e.target.value)} /> : <input type="text" inputMode="numeric" autoComplete="off" maxLength={10} placeholder="YYYY-MM-DD" value={date} onChange={e => setDate(e.target.value.slice(0, 10))} />}
          </label>
        </div>
        <div className="form-actions"><button className="primary-button" disabled={loading} onClick={() => handlePredict({ trainNumber, station, date })}>{loading ? "Predicting…" : "Predict delay →"}</button><button className={`secondary-button ${favorites.includes(trainNumber) ? "saved" : ""}`} onClick={() => toggleFavorite(trainNumber)}>{favorites.includes(trainNumber) ? "★ Saved" : "☆ Favourite train"}</button></div>
        {favorites.length > 0 && <div className="inline-list"><strong>Favourite trains</strong>{favorites.map(n => <button key={n} onClick={() => { setTrainNumber(n); const t = trains.find(x => x.number === n); if (t) setStation(t.stations[t.stations.length - 1][0]); }}>{n} · {trains.find(t => t.number === n)?.name || "Train"}</button>)}</div>}
      </section>
        {error && <div className="error-banner">{error}</div>}
        {recent.length > 0 && <section className="panel"><div className="section-head"><div><span className="eyebrow">QUICK ACCESS</span><h2>Recent searches</h2></div><button className="text-button" onClick={() => setRecent([])}>Clear</button></div><div className="recent-list">{recent.slice(0, 5).map((r, i) => <button key={i} onClick={() => { setTrainNumber(r.train_number); setStation(r.station_code); setDate(r.journey_date); }}><strong>{r.train_number} · {trains.find(t => t.number === r.train_number)?.name || "Train"}</strong><span>{r.station_code} · {r.journey_date}</span></button>)}</div></section>}
      </main></>}

    {page === "result" && prediction && <main className="content result-content"><button className="text-button back-link" onClick={() => setPage("predict")}>← New prediction</button><section className="result-banner"><div><span className="eyebrow">PREDICTION RESULT</span><h1>{selectedTrain?.name || `Train ${trainNumber}`}</h1><p>{trainNumber} · {station} · {date}</p></div><div className="delay-value"><strong>{Math.round(prediction.predicted_delay_minutes)}</strong><span>minutes predicted delay</span></div><div className="advisory">{prediction.status_advisory}</div></section>
      <div className="two-col"><section className="panel"><span className="eyebrow">MODEL OUTPUT</span><h2>Date-based context indicators</h2><p className="muted">These indicators are returned by the current backend. They are not live weather readings or individual SHAP contributions.</p>{(prediction.factors || []).map((f, i) => <div className="factor-row" key={i}><div><strong>{f.title}</strong><span>{f.impact}</span></div><span className="factor-tag">Context</span></div>)}</section><section className="panel"><span className="eyebrow">JOURNEY DETAILS</span><h2>Selected journey</h2><div className="detail-row"><span>Train</span><strong>{trainNumber} — {selectedTrain?.name}</strong></div><div className="detail-row"><span>Route</span><strong>{selectedTrain?.route}</strong></div><div className="detail-row"><span>Station</span><strong>{selectedStation[0]} — {selectedStation[1]}</strong></div><div className="detail-row"><span>Journey date</span><strong>{date}</strong></div></section></div>
      <div className="two-col"><section className="panel coach-panel"><span className="eyebrow">TRAIN INFORMATION</span><h2>Coach Composition</h2><p className="muted">Coach order from the locomotive to the last coach. Composition is displayed only when verified data is available.</p>
        {coachLoading ? <div className="empty-state">Loading coach composition…</div> : coachError ? <div className="empty-state">{coachError}</div> : !coachData || !Array.isArray(coachData.coaches) || coachData.coaches.length === 0 ? <div className="empty-state">Coach composition currently unavailable for this train.</div> : <>
          <div className="coach-meta"><span>{coachData.coach_type || "Coach type not verified"}</span><span>Updated: {coachData.last_updated || "Not available"}</span></div>
          <div className="coach-sequence"><div className="coach-engine">LOCO</div>{coachData.coaches.map((coach, index) => <button type="button" key={`${coach.position}-${coach.coach_number}-${index}`} className={`coach-card ${selectedCoach === index ? "selected" : ""}`} onClick={() => setSelectedCoach(index)}><small>{coach.position}</small><strong>{coach.coach_number || coach.designation}</strong><span>{coach.category || coach.designation}</span></button>)}</div>
          {selectedCoach !== null && coachData.coaches[selectedCoach] && <div className="coach-detail"><strong>{coachData.coaches[selectedCoach].coach_number || coachData.coaches[selectedCoach].designation}</strong><span>Position {coachData.coaches[selectedCoach].position} · {coachData.coaches[selectedCoach].category || "Category not specified"}</span></div>}
          <p className="muted small">Source: {coachData.source || "Not supplied"}</p>
        </>}
      </section><section className="panel"><span className="eyebrow">SHARE YOUR RESULT</span><h2>Prediction report</h2><p className="muted">Share this estimate or use your browser's print dialog to save a PDF copy.</p><div className="button-row"><button className="secondary-button" onClick={sharePrediction}>Share prediction</button><button className="primary-button" onClick={downloadReport}>Print / Save PDF</button></div></section></div>
      <section className="panel"><span className="eyebrow">MODEL EVALUATION</span><h2>Record actual delay after your journey</h2><p className="muted">This helps compare a prediction with an actual observation. Submitted values are stored in the local backend database and are not used to retrain the model.</p>{actualSubmitted ? <div className="submission-success"><span className="success-check">✓</span><h3>Thank You!</h3><p>Thank you for contributing the actual train delay. Your submission has been recorded successfully and will help us evaluate prediction performance.</p></div> : <form className="actual-form" onSubmit={submitActual}><label>Actual arrival delay (minutes)<input type="number" min="0" step="0.1" value={actualDelay} onChange={e => setActualDelay(e.target.value)} placeholder="e.g. 18" required /></label><button className="primary-button" type="submit" disabled={actualSubmitting}>{actualSubmitting ? "Submitting…" : "Submit actual delay"}</button></form>}{actualMessage && <p className="form-message error-text">{actualMessage}</p>}</section>
    </main>}

    {page === "history" && <main className="content"><section className="panel"><div className="section-head"><div><span className="eyebrow">YOUR DEVICE</span><h2>Prediction history</h2></div><button className="text-button" onClick={() => { if (confirm("Clear prediction history on this device?")) setHistory([]); }}>Clear history</button></div>{history.length === 0 ? <div className="empty-state">No predictions saved on this device yet.</div> : <div className="table-wrap"><table><thead><tr><th>Train</th><th>Station</th><th>Date</th><th>Predicted delay</th><th>Advisory</th><th></th></tr></thead><tbody>{history.map((h, i) => <tr key={`${h.predicted_at}-${i}`}><td>{h.train_number} · {h.train_name}</td><td>{h.station_code}</td><td>{h.journey_date}</td><td>{h.predicted_delay_minutes} min</td><td>{h.status_advisory}</td><td><button className="text-button" onClick={() => { setTrainNumber(h.train_number); setStation(h.station_code); setDate(h.journey_date); setPrediction(h); setPage("result"); }}>Open</button></td></tr>)}</tbody></table></div>}</section></main>}

    {page === "analytics" && <main className="content"><section className="panel"><span className="eyebrow">EVALUATION FROM SUBMITTED ACTUALS</span><h2>Model performance</h2>{!analytics ? <p>Loading analytics…</p> : analytics.count > 0 ? <><div className="metric-grid"><div className="metric"><span>Observations</span><strong>{analytics.count}</strong></div><div className="metric"><span>MAE</span><strong>{analytics.mae_minutes} min</strong></div><div className="metric"><span>RMSE</span><strong>{analytics.rmse_minutes} min</strong></div><div className="metric"><span>R²</span><strong>{analytics.r2 === null ? "N/A" : analytics.r2}</strong></div></div><p className="muted">Metrics are calculated from {analytics.count} user-submitted actual-delay observations. This is not a substitute for a held-out test-set evaluation.</p></> : <div className="empty-state">{analytics.message || "No actual-delay observations have been submitted yet. MAE and RMSE will appear after data is collected."}</div>}</section><section className="panel"><span className="eyebrow">RESEARCH FEATURES</span><h2>Advanced ML analysis</h2><p className="muted">SHAP explanations, a what-if simulator and station-by-station predicted delay trends are not enabled because the supplied inference code does not expose validated per-request model inputs or route-level predictions. They should be connected only after the model's training feature schema is verified.</p></section></main>}

    {page === "routes" && <main className="content"><section className="panel"><span className="eyebrow">TRAIN ROUTE</span><h2>{selectedTrain?.name}</h2><p className="muted">Route stops below come from the train list supplied with your project. No station coordinates were provided, so an accurate map cannot yet be drawn.</p><div className="route-list">{(selectedTrain?.stations || []).map(([code, name], i) => <div className={`route-stop ${code === station ? "current" : ""}`} key={`${code}-${i}`}><span className="route-dot" /><div><strong>{name}</strong><small>{code}{code === station ? " · Selected station" : ""}</small></div></div>)}</div></section></main>}

    {modal === "settings" && <Modal title="Settings" onClose={() => setModal("")}><div className="settings-list"><label>Appearance<select value={theme} onChange={e => setTheme(e.target.value)}><option value="light">Light mode</option><option value="dark">Dark mode</option></select></label><label>Clock timezone<input value="Asia/Kolkata (IST)" readOnly /></label><label>Time format<select value={prefs.timeFormat} onChange={e => setPrefs(p => ({ ...p, timeFormat: e.target.value }))}><option value="24h">24-hour</option><option value="12h">12-hour (clock remains IST)</option></select></label><label>Delay alert threshold<select value={prefs.alertThreshold} onChange={e => setPrefs(p => ({ ...p, alertThreshold: Number(e.target.value) }))}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label><button className="secondary-button" onClick={enableAlerts}>{prefs.alertsEnabled ? "Disable browser alerts" : "Enable browser alerts"}</button><button className="text-button danger-text" onClick={() => { setTheme("light"); setPrefs({ timeFormat: "24h", alertsEnabled: false, alertThreshold: 30 }); }}>Reset preferences</button><p className="muted small">Alerts are checked only when you run a prediction in this browser. They do not monitor trains continuously.</p></div></Modal>}
    {modal === "help" && <Modal title="Help / User Manual" onClose={() => setModal("")} wide><input className="search-input" placeholder="Search help topics…" value={helpQuery} onChange={e => setHelpQuery(e.target.value)} /><div className="help-list">{filteredHelp.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></Modal>}
    {modal === "rate" && <Modal title="Rate Synapse" onClose={() => setModal("")}>{ratingSubmitted ? <div className="submission-success"><span className="success-check">✓</span><h3>Thank You!</h3><p>Thank you for sharing your feedback. Your response has been submitted successfully.</p></div> : <form onSubmit={submitRating} className="rating-form"><p>How would you rate your experience?</p><div className="stars">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} className={n <= rating ? "selected" : ""} onClick={() => setRating(n)} aria-label={`${n} stars`}>★</button>)}</div><label>Optional feedback<textarea rows="4" value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={1000} placeholder="Tell us what could be improved…" /></label><button className="primary-button" type="submit" disabled={ratingSubmitting}>{ratingSubmitting ? "Submitting…" : "Submit rating"}</button>{ratingMessage && <p className="form-message error-text">{ratingMessage}</p>}</form>}</Modal>}
    {modal === "about" && <Modal title="About Synapse" onClose={() => setModal("")}><p><strong>Synapse</strong> is an AI-powered train delay prediction system developed by students of the <strong>College of Engineering Poonjar</strong>. Powered by an XGBoost + LSTM inference pipeline, the system incorporates a wide range of dynamic features and influencing factors to deliver more accurate and reliable train delay predictions. By leveraging data-driven insights and advanced machine learning techniques, Synapse aims to improve delay forecasting and provide users with better-informed travel expectations.</p><p className="muted"><em>Version 1.1 · Predictions are estimates and are not official railway information.</em></p></Modal>}
    {loading && <div className="loading-overlay"><div className="loading-card"><div className="spinner" /><strong>Generating prediction…</strong><span>Waiting for the Synapse ML API.</span></div></div>}
    <footer className="footer"><span>Synapse · AI Train Delay Prediction</span><span>Estimates only · Not an official railway service</span></footer>
  </div>;
}
export default App;

# SEBI PIT Regulatory Surveillance & Verification Engine

Automated RegTech surveillance and regulatory verification platform assessing compliance with **SEBI (Prohibition of Insider Trading) Regulations, 2015** and the **SEBI PIT (Amendment) Regulations, 2020**.

The system ingests live **Regulation 7(2) Form C** market filings from the National Stock Exchange of India (NSE) and BSE, performs multi-year market holiday mathematics, auto-determines applicable law based on statutory amendment dates, and outputs three-state cited verdicts (`COMPLIANT`, `NON-COMPLIANT`, `INSUFFICIENT EVIDENCE`) with evidence remediation paths.

---

## Key Features

- **Temporal Regulation Version Dispatcher**: Automatically evaluates transaction dates against the **July 17, 2020** statutory cutoff:
  - **Trades < July 17, 2020**: Evaluated under original **SEBI PIT Regulations, 2015**.
  - **Trades ≥ July 17, 2020**: Evaluated under **SEBI PIT (Amendment) Regulations, 2020** enforcing mandatory Structured Digital Databases (Reg 3(5)) and statutory quarter-end trading window closures (Schedule B Clause 4(2)).
- **Official Market Holiday Engine (`holidays.py`)**: Excludes weekends (Saturdays & Sundays) and a curated list of **74 recognized NSE/BSE holidays (2022–2026)** to compute statutory 2-trading-day disclosure deadlines and 48-hour post-UPSI blackout reopening dates.
- **The 4 Statutory Verification Pillars**:
  1. **₹10 Lakh Value Threshold**: Flags trades exceeding ₹10,00,000 in a calendar quarter without pre-clearance.
  2. **Trading Window Blackout**: Detects trades executed within closed financial results windows (+48h rule).
  3. **Continual Disclosure Latency**: Flags delays exceeding 2 market trading days for Reg 7(2)(a) and 7(2)(b).
  4. **Contra-Trade 6-Month Lock-in**: Identifies reverse positions (`BUY` followed by `SELL` or vice-versa) within 180 calendar days under Schedule B Clause 10.
- **3-State Cited Assessment & Stretch Goal**: Outputs `COMPLIANT`, `NON-COMPLIANT`, or `INSUFFICIENT EVIDENCE` with exact clause citations, evidence sources, and remediation guidance for missing records.
- **Dynamic Multi-CSV Ingestion**: Drop any official NSE Form C CSV into `backend/app/data/`—the engine automatically cleans headers, parses live XBRL XML links, and updates the dashboard immediately upon refresh.
- **Modern React Dashboard**: Built with Vite, Tailwind CSS, and Zustand featuring KPI metrics, `PRE-2020` / `POST-2020` filter tabs, an interactive Requirements Map modal, and reactive audit timelines.

---

## Tech Stack

- **Backend**: Python 3.14 / 3.x, FastAPI, Uvicorn, Pydantic, python-dateutil
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React, Zustand
- **Data & Formats**: NSE/BSE Regulation 7(2) Form C Disclosures, XBRL XML, JSON

---

## Project Structure

```text
sebi-pit-engine/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI server and surveillance endpoints
│   │   ├── core/
│   │   │   ├── engine.py            # Version-controlled SEBI deterministic rules engine
│   │   │   ├── holidays.py          # Market holiday & trading day countdown math (74 holidays)
│   │   │   └── csv_ingestion.py     # Multi-CSV & live XBRL XML parser with mtime caching
│   │   └── data/
│   │       ├── cases.json           # Ground-truth benchmark cases across top listed entities
│   │       └── *.csv                # Live NSE/BSE Form C disclosures
│   ├── requirements.txt             # Python dependencies
│   └── start_backend.bat            # 1-Click backend launcher
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Root React application
    │   ├── components/
    │   │   ├── Dashboard.jsx        # Main UI Shell & Requirements Map modal
    │   │   ├── KPIRow.jsx           # Dynamic volume & violation KPI cards
    │   │   ├── CaseTable.jsx        # Expanded surveillance dossiers table with status filters
    │   │   └── AuditTrail.jsx       # Reactive timeline, legal citations & stretch goal callouts
    │   └── store/
    │       └── useCaseStore.js      # Centralized Zustand reactive store
    ├── package.json                 # Node dependencies
    ├── vite.config.js               # Vite dev server & reverse proxy configuration
    └── start_frontend.bat           # 1-Click frontend launcher
```

---

## How to Run the Project

### Prerequisites
- **Python 3.10+** installed
- **Node.js (v18+)** and **npm** installed

---

### Step 1: Start the Backend (FastAPI)

#### Option A — 1-Click Launch (Windows)
Double-click:
```text
sebi-pit-engine\backend\start_backend.bat
```

#### Option B — Manual Command Line
Open a terminal, navigate to `backend/`, set up the virtual environment, and run:
```powershell
cd sebi-pit-engine\backend

# 1. Create and activate virtual environment (first time only)
python -m venv venv
.\venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start Uvicorn server
uvicorn app.main:app --reload --port 8000
```

- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **Evaluated Cases Feed:** `http://localhost:8000/api/cases`

---

### Step 2: Start the Frontend (React + Vite)

#### Option A — 1-Click Launch (Windows)
Double-click:
```text
sebi-pit-engine\frontend\start_frontend.bat
```

#### Option B — Manual Command Line
Open a **second** terminal, navigate to `frontend/`, and run:
```powershell
cd sebi-pit-engine\frontend

# 1. Install dependencies (first time only)
npm install

# 2. Start Vite dev server
npm run dev
```

- **Surveillance UI Dashboard:** `http://localhost:5173`

---

## How to Add New Market Data

1. Download any **Regulation 7(2) Form C** CSV from the NSE or BSE website.
2. Save or drop the `.csv` file directly into:
   ```text
   sebi-pit-engine/backend/app/data/
   ```
3. Open or refresh the frontend dashboard (`http://localhost:5173`) and click **"Refresh Feed"**.
4. The engine will automatically sanitize headers, extract transaction details from the XML links, apply the proper law version and market holiday math, and render the evaluated dossiers.

---

## License

This project is licensed under the MIT License.

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os

from .core.engine import SEBIPITEngine, ENGINE_VERSION
from .core.holidays import OFFICIAL_MARKET_HOLIDAYS
from .core.csv_ingestion import load_cases_from_csv

app = FastAPI(
    title="SEBI PIT Compliance & Surveillance Engine API",
    version="1.0.0",
    description="Regulatory automated engine assessing SEBI Prohibition of Insider Trading (PIT) compliance, market holiday math, trading window closures, and contra-trades."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SEBIPITEngine()

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CASES_FILE = os.path.join(DATA_DIR, "cases.json")


def load_raw_cases() -> List[Dict[str, Any]]:
    cases = []
    
    # 1. Load curated benchmark cases if available
    if os.path.exists(CASES_FILE):
        try:
            with open(CASES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                cases.extend(data.get("cases", []))
        except Exception as e:
            print(f"Error reading {CASES_FILE}: {e}")

    # 2. Dynamically ingest all CSV files in data/
    if os.path.exists(DATA_DIR):
        existing_ids = {c.get("case_id") for c in cases}
        for fname in os.listdir(DATA_DIR):
            if fname.lower().endswith(".csv"):
                csv_path = os.path.join(DATA_DIR, fname)
                try:
                    csv_cases = load_cases_from_csv(csv_path)
                    for cc in csv_cases:
                        if cc.get("case_id") not in existing_ids:
                            cases.append(cc)
                            existing_ids.add(cc.get("case_id"))
                except Exception as e:
                    print(f"Error loading {fname}: {e}")

    return cases


@app.get("/")
def root():
    return {
        "service": "SEBI PIT Engine Surveillance API",
        "engine_version": ENGINE_VERSION,
        "status": "online"
    }


@app.get("/api/cases")
def get_all_cases():
    """
    Returns all cases dynamically evaluated against the SEBI PIT engine.
    """
    raw_cases = load_raw_cases()
    evaluated = []
    for c in raw_cases:
        eval_result = engine.evaluate_case(c)
        # Merge source metadata for UI rich display
        merged = {
            **c,
            "evaluation": eval_result
        }
        evaluated.append(merged)
    return {
        "total_cases": len(evaluated),
        "cases": evaluated
    }


@app.get("/api/cases/{case_id}")
def get_case_detail(case_id: str):
    raw_cases = load_raw_cases()
    found = next((c for c in raw_cases if c.get("case_id").lower() == case_id.lower()), None)
    if not found:
        raise HTTPException(status_code=404, detail="Case ID not found")
    
    evaluation = engine.evaluate_case(found)
    return {
        **found,
        "evaluation": evaluation
    }


@app.get("/api/analytics")
def get_analytics():
    raw_cases = load_raw_cases()
    total_cases = len(raw_cases)
    total_value = 0.0
    critical_breaches = 0
    clean_cases = 0
    high_risk_cases = 0

    for c in raw_cases:
        eval_res = engine.evaluate_case(c)
        total_value += eval_res.get("total_traded_value", 0)
        status = eval_res.get("status")
        if status == "NON_COMPLIANT_CRITICAL":
            critical_breaches += 1
        elif status == "NON_COMPLIANT_HIGH":
            high_risk_cases += 1
        elif status == "COMPLIANT":
            clean_cases += 1

    return {
        "total_cases_screened": total_cases,
        "total_volume_inr": total_value,
        "critical_violations": critical_breaches,
        "high_risk_violations": high_risk_cases,
        "clean_compliance_cases": clean_cases,
        "compliance_rate_percent": round((clean_cases / total_cases * 100), 1) if total_cases > 0 else 0,
        "active_holidays_tracked": len(OFFICIAL_MARKET_HOLIDAYS),
        "engine_version": ENGINE_VERSION
    }


@app.get("/api/holidays")
def get_holidays():
    """Returns official recognized market holidays."""
    holidays = sorted([d.isoformat() for d in OFFICIAL_MARKET_HOLIDAYS])
    return {
        "calendar_years": "2022-2026",
        "total_holidays": len(holidays),
        "market": "NSE / BSE India",
        "holidays": holidays
    }


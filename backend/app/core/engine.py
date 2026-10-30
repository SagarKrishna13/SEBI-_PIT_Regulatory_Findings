"""
SEBI (Prohibition of Insider Trading) Regulations, 2015 - Regulatory Rules Engine
Version: SEBI_PIT_V2015_AMENDED_2020

Regulatory Clauses Evaluated:
1. Reg 4(1): Trading while in possession of UPSI / Trading Window Closure violations.
2. Reg 7(2)(a): Continual Disclosure violation (Value > INR 10 Lakhs within 2 trading days).
3. Reg 7(2)(b): Company-to-Exchange Disclosure violation (within 2 trading days of receipt).
4. Clause 10 Schedule B: Contra-Trade Violation (Opposite position within 6 months).
5. Pre-clearance checks for transactions exceeding prescribed threshold (INR 10,00,000).
"""

from datetime import datetime, date
from typing import Dict, List, Any
from .holidays import is_market_trading_day, count_trading_days_between, add_trading_days

ENGINE_VERSION = "SEBI_PIT_V2015_AMENDED_2020"
VALUE_THRESHOLD_DISCLOSURE = 1000000.0  # 10 Lakhs INR
CONTRA_TRADE_DAYS_WINDOW = 180          # 6 months (~180 days)
TRADING_WINDOW_POST_UPSI_HOURS = 48    # Minimum 48 hours post disclosure (approx 2 trading days)


def parse_date(date_str: str) -> date:
    if not date_str:
        return None
    return datetime.strptime(date_str, "%Y-%m-%d").date()


class SEBIPITEngine:
    def __init__(self, version: str = ENGINE_VERSION):
        self.version = version

    def evaluate_case(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes deterministic SEBI PIT regulatory checks on case trades.
        """
        violations: List[Dict[str, Any]] = []
        audit_events: List[Dict[str, Any]] = []

        case_id = case_data.get("case_id")
        company = case_data.get("company_name")
        insider = case_data.get("insider_name")
        trades = case_data.get("trades", [])

        tw_closure_date = parse_date(case_data.get("trading_window_closure_date"))
        upsi_disclosure_date = parse_date(case_data.get("upsi_disclosure_date"))
        disclosure_to_co = parse_date(case_data.get("disclosure_to_company_date"))
        disclosure_to_ex = parse_date(case_data.get("disclosure_to_exchange_date"))
        pre_clearance = case_data.get("pre_clearance_obtained", False)

        total_traded_value = sum(t.get("trade_value", 0) for t in trades)

        # Audit Event: Intake
        audit_events.append({
            "timestamp": f"{case_data.get('trading_window_closure_date', '2024-01-01')}T09:00:00Z",
            "phase": "WINDOW_CLOSURE",
            "title": "Trading Window Closure Instituted",
            "description": f"Trading window closed by Compliance Officer for UPSI: {case_data.get('upsi_type')}",
            "severity": "INFO"
        })

        # Calculate Window Reopen Date (48 hours / 2 trading days after public UPSI disclosure)
        window_reopen_date = None
        if upsi_disclosure_date:
            window_reopen_date = add_trading_days(upsi_disclosure_date, 2)
            audit_events.append({
                "timestamp": f"{upsi_disclosure_date.isoformat()}T18:30:00Z",
                "phase": "UPSI_PUBLIC_DISCLOSURE",
                "title": "UPSI Disclosed to Stock Exchanges",
                "description": f"Material event disclosed. Trading window remains shut until {window_reopen_date.isoformat()} (+48 hours trading day rule).",
                "severity": "INFO"
            })

        # 1. Trading Window Violation Check (Reg 4(1) & Schedule B Clause 4)
        for t in trades:
            t_date = parse_date(t.get("trade_date"))
            audit_events.append({
                "timestamp": f"{t.get('trade_date')}T11:15:00Z",
                "phase": "TRADE_EXECUTION",
                "title": f"Trade Executed: {t.get('trade_type')} {t.get('quantity')} shares @ INR {t.get('price_per_share')}",
                "description": f"Execution value: INR {t.get('trade_value'):,.2f} on {t.get('exchange')}",
                "severity": "INFO"
            })

            # Check if trade happened inside closed window
            if tw_closure_date and window_reopen_date:
                if tw_closure_date <= t_date < window_reopen_date:
                    violations.append({
                        "regulation": "SEBI PIT Reg 4(1) read with Schedule B Clause 4",
                        "title": "Trading Window Closure Violation",
                        "severity": "CRITICAL",
                        "trade_id": t.get("trade_id"),
                        "details": f"Trade executed on {t_date.isoformat()} during blackout period ({tw_closure_date.isoformat()} to {window_reopen_date.isoformat()}).",
                        "penalty_risk": "Impounding of unlawful gains under Section 11B; Penalty up to INR 25 Crore or 3x profits."
                    })
                    audit_events.append({
                        "timestamp": f"{t.get('trade_date')}T11:16:00Z",
                        "phase": "BREACH_DETECTED",
                        "title": "Breach: Trading Window Blackout Violation",
                        "description": f"Trade {t.get('trade_id')} occurred while Trading Window was officially closed.",
                        "severity": "CRITICAL"
                    })

            # Check Pre-clearance requirements for value > 10 Lakhs
            if t.get("trade_value", 0) > VALUE_THRESHOLD_DISCLOSURE and not pre_clearance:
                violations.append({
                    "regulation": "SEBI PIT Schedule B Clause 6",
                    "title": "Absence of Mandatory Pre-Clearance",
                    "severity": "HIGH",
                    "trade_id": t.get("trade_id"),
                    "details": f"Trade value INR {t.get('trade_value'):,.2f} exceeds threshold limit of INR 10 Lakhs without obtaining pre-clearance from Compliance Officer.",
                    "penalty_risk": "Internal disciplinary action, wage freeze, and SEBI adjudication proceedings."
                })

        # 2. Continual Disclosure Violation (Reg 7(2)(a) - Insider to Company within 2 trading days)
        if total_traded_value >= VALUE_THRESHOLD_DISCLOSURE:
            earliest_trade_date = min(parse_date(t.get("trade_date")) for t in trades)
            if disclosure_to_co:
                trading_days_taken = count_trading_days_between(earliest_trade_date, disclosure_to_co)
                if trading_days_taken > 2:
                    violations.append({
                        "regulation": "SEBI PIT Reg 7(2)(a)",
                        "title": "Delayed Continual Disclosure to Listed Entity",
                        "severity": "HIGH",
                        "trade_id": "ALL_TRADES",
                        "details": f"Disclosure submitted {trading_days_taken} trading days post-trade (Deadline: 2 trading days, actual submission on {disclosure_to_co.isoformat()}).",
                        "penalty_risk": "Adjudication penalty under Section 15A(b) of SEBI Act (INR 1 Lakh/day or INR 1 Crore)."
                    })
                    audit_events.append({
                        "timestamp": f"{disclosure_to_co.isoformat()}T17:00:00Z",
                        "phase": "DELAYED_DISCLOSURE",
                        "title": "Statutory Delay: Form C Delayed",
                        "description": f"Regulation 7(2)(a) breached by {trading_days_taken - 2} trading day(s).",
                        "severity": "WARNING"
                    })
            else:
                violations.append({
                    "regulation": "SEBI PIT Reg 7(2)(a)",
                    "title": "Total Non-Disclosure to Company",
                    "severity": "CRITICAL",
                    "trade_id": "ALL_TRADES",
                    "details": "No Form C disclosure filed by insider for trades exceeding INR 10 Lakh threshold.",
                    "penalty_risk": "Referral to SEBI Enforcement Division."
                })

        # 3. Company-to-Exchange Disclosure (Reg 7(2)(b) - Company to BSE/NSE within 2 trading days)
        if disclosure_to_co and disclosure_to_ex:
            co_to_ex_days = count_trading_days_between(disclosure_to_co, disclosure_to_ex)
            if co_to_ex_days > 2:
                violations.append({
                    "regulation": "SEBI PIT Reg 7(2)(b)",
                    "title": "Delayed Dissemination by Listed Entity to Exchanges",
                    "severity": "MEDIUM",
                    "trade_id": "ENTITY_FILING",
                    "details": f"Company took {co_to_ex_days} trading days to notify NSE/BSE after receiving Form C (Statutory maximum: 2 trading days).",
                    "penalty_risk": "SEBI notice to Listed Entity Compliance Officer."
                })

        # 4. Contra-Trade Check (Schedule B Clause 10 - Opposite position within 6 months)
        if len(trades) >= 2:
            sorted_trades = sorted(trades, key=lambda x: x.get("trade_date"))
            for i in range(len(sorted_trades)):
                for j in range(i + 1, len(sorted_trades)):
                    t1 = sorted_trades[i]
                    t2 = sorted_trades[j]
                    d1 = parse_date(t1.get("trade_date"))
                    d2 = parse_date(t2.get("trade_date"))
                    day_diff = (d2 - d1).days

                    if day_diff <= CONTRA_TRADE_DAYS_WINDOW:
                        # Check opposite direction: BUY followed by SELL or SELL followed by BUY
                        if {t1.get("trade_type"), t2.get("trade_type")} == {"BUY", "SELL"}:
                            violations.append({
                                "regulation": "SEBI PIT Schedule B Clause 10",
                                "title": "Contra-Trade Restriction Breach (6-Month Lock-in)",
                                "severity": "CRITICAL",
                                "trade_id": f"{t1.get('trade_id')} & {t2.get('trade_id')}",
                                "details": f"Opposite transactions ({t1.get('trade_type')} on {d1} and {t2.get('trade_type')} on {d2}) executed within {day_diff} days (< 180 days).",
                                "penalty_risk": "Disgorgement of full profit made to Investor Protection and Education Fund (IPEF) & statutory penalties."
                            })
                            audit_events.append({
                                "timestamp": f"{t2.get('trade_date')}T15:30:00Z",
                                "phase": "CONTRA_TRADE_DETECTED",
                                "title": "Contra-Trade Violation Detected",
                                "description": f"Reverse order executed within {day_diff} calendar days.",
                                "severity": "CRITICAL"
                            })

        # Status Assignment
        critical_count = sum(1 for v in violations if v["severity"] == "CRITICAL")
        high_count = sum(1 for v in violations if v["severity"] == "HIGH")

        if critical_count > 0:
            status = "NON_COMPLIANT_CRITICAL"
        elif high_count > 0:
            status = "NON_COMPLIANT_HIGH"
        elif len(violations) > 0:
            status = "NON_COMPLIANT_MODERATE"
        else:
            status = "COMPLIANT"

        # Calculate risk score (0 - 100)
        risk_score = min(100, (critical_count * 40) + (high_count * 25) + (len(violations) * 10))

        return {
            "case_id": case_id,
            "company_name": company,
            "insider_name": insider,
            "status": status,
            "risk_score": risk_score,
            "engine_version": self.version,
            "total_traded_value": total_traded_value,
            "violations": violations,
            "audit_trail": sorted(audit_events, key=lambda x: x["timestamp"]),
            "evaluation_timestamp": datetime.utcnow().isoformat() + "Z"
        }

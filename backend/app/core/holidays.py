from datetime import date, timedelta
from typing import Set

# Comprehensive Multi-Year Indian Stock Market (NSE/BSE) Recognized Trading Holidays (2022-2026)
# Excludes regular Saturdays and Sundays
OFFICIAL_MARKET_HOLIDAYS: Set[date] = {
    # 2022 Holidays
    date(2022, 1, 26),   # Republic Day
    date(2022, 3, 1),    # Mahashivratri
    date(2022, 3, 18),   # Holi
    date(2022, 4, 14),   # Dr. Ambedkar/Mahavir Jayanti
    date(2022, 4, 15),   # Good Friday
    date(2022, 5, 3),    # Id-Ul-Fitr
    date(2022, 8, 9),    # Muharram
    date(2022, 8, 15),   # Independence Day
    date(2022, 8, 31),   # Ganesh Chaturthi
    date(2022, 10, 5),   # Dussehra
    date(2022, 10, 24),  # Diwali Laxmi Pujan
    date(2022, 10, 26),  # Diwali Balipratipada
    date(2022, 11, 8),   # Gurunanak Jayanti

    # 2023 Holidays
    date(2023, 1, 26),   # Republic Day
    date(2023, 3, 7),    # Holi
    date(2023, 3, 30),   # Ram Navami
    date(2023, 4, 4),    # Mahavir Jayanti
    date(2023, 4, 7),    # Good Friday
    date(2023, 4, 14),   # Dr. Ambedkar Jayanti
    date(2023, 5, 1),    # Maharashtra Day
    date(2023, 6, 29),   # Bakri Id
    date(2023, 8, 15),   # Independence Day
    date(2023, 9, 19),   # Ganesh Chaturthi
    date(2023, 10, 2),   # Mahatma Gandhi Jayanti
    date(2023, 10, 24),  # Dussehra
    date(2023, 11, 14),  # Diwali Balipratipada
    date(2023, 11, 27),  # Gurunanak Jayanti
    date(2023, 12, 25),  # Christmas

    # 2024 Holidays
    date(2024, 1, 22),   # Special Holiday
    date(2024, 1, 26),   # Republic Day
    date(2024, 3, 8),    # Mahashivratri
    date(2024, 3, 25),   # Holi
    date(2024, 3, 29),   # Good Friday
    date(2024, 4, 11),   # Id-Ul-Fitr
    date(2024, 4, 17),   # Shri Ram Navami
    date(2024, 5, 1),    # Maharashtra Day
    date(2024, 5, 20),   # General Parliamentary Elections (Mumbai)
    date(2024, 6, 17),   # Bakri Id
    date(2024, 7, 17),   # Moharram
    date(2024, 8, 15),   # Independence Day
    date(2024, 10, 2),   # Mahatma Gandhi Jayanti
    date(2024, 11, 1),   # Diwali Laxmi Pujan
    date(2024, 11, 15),  # Gurunanak Jayanti
    date(2024, 12, 25),  # Christmas

    # 2025 Holidays
    date(2025, 2, 26),   # Mahashivratri
    date(2025, 3, 14),   # Holi
    date(2025, 3, 31),   # Id-Ul-Fitr
    date(2025, 4, 10),   # Shri Mahavir Jayanti
    date(2025, 4, 14),   # Dr. Ambedkar Jayanti
    date(2025, 4, 18),   # Good Friday
    date(2025, 5, 1),    # Maharashtra Day
    date(2025, 8, 15),   # Independence Day
    date(2025, 8, 27),   # Ganesh Chaturthi
    date(2025, 10, 2),   # Mahatma Gandhi Jayanti/Dussehra
    date(2025, 10, 21),  # Diwali Laxmi Pujan
    date(2025, 10, 22),  # Diwali-Balipratipada
    date(2025, 11, 5),   # Prakash Gurpurb (Gurunanak Jayanti)
    date(2025, 12, 25),  # Christmas

    # 2026 Holidays
    date(2026, 1, 15),   # Municipal Election (Maharashtra)
    date(2026, 1, 26),   # Republic Day
    date(2026, 3, 3),    # Holi
    date(2026, 3, 26),   # Shri Ram Navami
    date(2026, 3, 31),   # Shri Mahavir Jayanti
    date(2026, 4, 3),    # Good Friday
    date(2026, 4, 14),   # Dr. Ambedkar Jayanti
    date(2026, 5, 1),    # Maharashtra Day
    date(2026, 5, 28),   # Bakri Id
    date(2026, 6, 26),   # Muharram
    date(2026, 9, 14),   # Ganesh Chaturthi
    date(2026, 10, 2),   # Mahatma Gandhi Jayanti
    date(2026, 10, 20),  # Dussehra
    date(2026, 11, 10),  # Diwali Balipratipada
    date(2026, 11, 24),  # Prakash Gurpurb
    date(2026, 12, 25),  # Christmas
}

# Alias for backwards compatibility
NSE_BSE_HOLIDAYS_2024 = OFFICIAL_MARKET_HOLIDAYS


def is_market_trading_day(d: date) -> bool:
    """Checks if a given date is an active NSE/BSE trading day (excluding weekends and official exchange holidays)."""
    if d.weekday() >= 5:  # 5: Saturday, 6: Sunday
        return False
    if d in OFFICIAL_MARKET_HOLIDAYS:
        return False
    return True


def add_trading_days(start_date: date, trading_days: int) -> date:
    """
    Computes future target date adding N active market trading days,
    skipping weekends and official SEBI/NSE holiday lists.
    """
    current = start_date
    added = 0
    while added < trading_days:
        current += timedelta(days=1)
        if is_market_trading_day(current):
            added += 1
    return current


def count_trading_days_between(start_date: date, end_date: date) -> int:
    """
    Counts market trading days between two dates (exclusive of start_date, inclusive of end_date).
    """
    if start_date >= end_date:
        return 0
    
    current = start_date + timedelta(days=1)
    trading_days = 0
    while current <= end_date:
        if is_market_trading_day(current):
            trading_days += 1
        current += timedelta(days=1)
    return trading_days

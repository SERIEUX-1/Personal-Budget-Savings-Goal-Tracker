#!/usr/bin/env python3
"""
processing.py
--------------
Search, filter, totals, reports, and other processing logic - matching
the assessment brief's suggested module structure directly.

This is where every "look across the whole dataset and find/summarise
something" operation lives, for BOTH transactions and goals:
    - search_transactions / search_goals   (search & filter)
    - monthly_summary_report, daily_summary_report,
      daily_detail_lookup, category_breakdown_report  (totals & reports)
    - savings_progress_report, auto_generate_report_for_new_month  (reports)

transactions.py and goals.py, by contrast, only manage individual
records (create/view/update/delete one record at a time) - they don't
know how to search across many records or summarise them. That's the
job of this file.
"""

from datetime import datetime

from validation import get_non_empty_string, get_valid_date, get_valid_choice, VALID_TYPES
from transactions import view_transactions
from goals import view_goals, goal_progress_percent


# ---------------------------------------------------------------------------
# SEARCH / FILTER
# ---------------------------------------------------------------------------

def search_transactions(data):
    """Search transactions by category, type, or a date range."""
    print("\n--- Search / Filter Transactions ---")
    print("1. By category")
    print("2. By type (income/expense)")
    print("3. By date range")
    choice = get_valid_choice("Choose an option (1-3): ", ["1", "2", "3"])

    if choice == "1":
        term = get_non_empty_string("Enter category (or part of it): ").lower()
        results = [t for t in data["transactions"] if term in t["category"].lower()]
    elif choice == "2":
        t_type = get_valid_choice("Type (income/expense): ", VALID_TYPES)
        results = [t for t in data["transactions"] if t["type"] == t_type]
    else:
        start = get_valid_date("Start date (YYYY-MM-DD): ")
        end = get_valid_date("End date (YYYY-MM-DD): ")
        results = [t for t in data["transactions"] if start <= t["date"] <= end]

    print(f"\nFound {len(results)} matching transaction(s).")
    view_transactions(data, results)


def search_goals(data):
    """Search/filter savings goals by goal category (case-insensitive, partial match)."""
    print("\n--- Search / Filter Savings Goals ---")
    term = get_non_empty_string("Enter goal category (or part of it): ").lower()
    results = [g for g in data["goals"] if term in g["goal_category"].lower()]

    print(f"\nFound {len(results)} matching goal(s).")
    view_goals(data, results)


# ---------------------------------------------------------------------------
# TOTALS / REPORTS - shared aggregation helpers
# ---------------------------------------------------------------------------

def _build_period_summary(data, period_key_func):
    """
    Group all transactions into periods (e.g. by month or by exact day)
    into a dictionary of totals and category breakdowns. `period_key_func`
    decides what a "period" is - e.g. t["date"][:7] for month, or
    t["date"] for a single day. This one function backs the monthly,
    daily, and auto-generated reports, so the aggregation logic only
    exists once.

    Returns: {period_key: {"income_total": .., "expense_total": ..,
                            "income_categories": {...}, "expense_categories": {...}}, ...}
    """
    summary = {}
    for t in data["transactions"]:
        period = period_key_func(t)
        if period not in summary:
            summary[period] = {
                "income_total": 0.0,
                "expense_total": 0.0,
                "income_categories": {},
                "expense_categories": {},
            }

        period_data = summary[period]
        category_key = f"{t['type']}_categories"      # "income_categories" or "expense_categories"
        total_key = f"{t['type']}_total"               # "income_total" or "expense_total"

        period_data[total_key] += t["amount"]
        period_data[category_key][t["category"]] = (
            period_data[category_key].get(t["category"], 0.0) + t["amount"]
        )

    return summary


def _print_period_block(period_label, period_data):
    """Print one period's (a month, or a single day) totals and category breakdowns."""
    income = period_data["income_total"]
    expense = period_data["expense_total"]
    net = income - expense
    percent_saved = (net / income) * 100 if income else 0.0

    print(f"\n===== {period_label} =====")
    print(f"Total income:  {income:>10.2f}")
    print(f"Total expense: {expense:>10.2f}")
    print(f"Net balance:   {net:>10.2f}  ({percent_saved:.1f}% of income saved)")

    if period_data["income_categories"]:
        print("\n  Income by category:")
        for category, total in sorted(
            period_data["income_categories"].items(), key=lambda item: item[1], reverse=True
        ):
            percent = (total / income) * 100 if income else 0.0
            print(f"    {category:<20}{total:>10.2f}{percent:>8.1f}%")

    if period_data["expense_categories"]:
        print("\n  Expenses by category:")
        for category, total in sorted(
            period_data["expense_categories"].items(), key=lambda item: item[1], reverse=True
        ):
            percent = (total / expense) * 100 if expense else 0.0
            print(f"    {category:<20}{total:>10.2f}{percent:>8.1f}%")


# ---------------------------------------------------------------------------
# TOTALS / REPORTS - transactions
# ---------------------------------------------------------------------------

def monthly_summary_report(data):
    """
    Analysis feature: show every month on demand - including the
    current, still-in-progress month, so the user never has to wait
    until a month ends to see it. For each month: total income, total
    expense, net balance, % of income saved, and a full percentage
    breakdown of both income and expenses by category.
    """
    print("\n--- Monthly Summary Report ---")
    if not data["transactions"]:
        print("No transactions recorded yet.")
        return

    summary = _build_period_summary(data, lambda t: t["date"][:7])
    for month in sorted(summary.keys()):
        _print_period_block(month, summary[month])


def daily_summary_report(data):
    """
    Analysis feature: show every single day that has at least one
    transaction, with the same totals and category breakdown as the
    monthly report but scoped to that one day.
    """
    print("\n--- Daily Summary Report ---")
    if not data["transactions"]:
        print("No transactions recorded yet.")
        return

    summary = _build_period_summary(data, lambda t: t["date"])
    for day in sorted(summary.keys()):
        _print_period_block(day, summary[day])


def daily_detail_lookup(data):
    """Let the user look up one specific day and see just that day's breakdown."""
    print("\n--- View a Specific Day ---")
    date = get_valid_date("Enter the date to look up (YYYY-MM-DD): ")

    day_transactions = [t for t in data["transactions"] if t["date"] == date]
    if not day_transactions:
        print(f"No transactions found for {date}.")
        return

    summary = _build_period_summary({"transactions": day_transactions}, lambda t: t["date"])
    _print_period_block(date, summary[date])


def category_breakdown_report(data):
    """
    Analysis feature: total spending per category across ALL recorded
    data (not scoped to one month/day), plus each category's percentage
    share of overall expenses, sorted highest spend first.
    """
    print("\n--- Category Breakdown Report (Expenses) ---")
    expenses = [t for t in data["transactions"] if t["type"] == "expense"]
    if not expenses:
        print("No expense transactions recorded yet.")
        return

    totals = {}
    for t in expenses:
        totals[t["category"]] = totals.get(t["category"], 0.0) + t["amount"]

    grand_total = sum(totals.values())
    sorted_categories = sorted(totals.items(), key=lambda item: item[1], reverse=True)

    print(f"{'Category':<15}{'Total':>10}{'% of spend':>12}")
    print("-" * 37)
    for category, total in sorted_categories:
        percent = (total / grand_total) * 100 if grand_total else 0
        print(f"{category:<15}{total:>10.2f}{percent:>11.1f}%")


def auto_generate_report_for_new_month(data):
    """
    Called once at startup. If the calendar month has changed since the
    last time the app was run, automatically print a summary for the
    month that just ended.
    """
    current_month = datetime.now().strftime("%Y-%m")
    last_seen_month = data.get("last_seen_month")

    if last_seen_month is not None and last_seen_month != current_month:
        summary = _build_period_summary(data, lambda t: t["date"][:7])
        if last_seen_month in summary:
            print("\nA new month has started since you last opened the app.")
            print(f"Here is your automatic summary for {last_seen_month}:")
            _print_period_block(last_seen_month, summary[last_seen_month])

    data["last_seen_month"] = current_month


# ---------------------------------------------------------------------------
# TOTALS / REPORTS - savings goals
# ---------------------------------------------------------------------------

def savings_progress_report(data):
    """
    Analysis feature: shows progress towards every savings goal, amount
    remaining, and days left until each deadline. For SMART goals, also
    prints the full S-M-A-R-T breakdown and an "on track" check that
    compares the stated monthly contribution against what's actually
    required to hit the target by the deadline.
    """
    print("\n--- Savings Goals Progress Report ---")
    if not data["goals"]:
        print("No savings goals set yet.")
        return

    today = datetime.now().date()

    for g in data["goals"]:
        percent = goal_progress_percent(g)
        remaining = g["target_amount"] - g["current_amount"]
        try:
            deadline_date = datetime.strptime(g["deadline"], "%Y-%m-%d").date()
            days_left = (deadline_date - today).days
        except ValueError:
            days_left = None

        status = "COMPLETE" if percent >= 100 else "IN PROGRESS"
        category_label = f" [{g['goal_category']}]" if g["goal_category"] else ""
        type_label = " (SMART)" if g["goal_type"] == "smart" else ""
        print(f"\n{g['name']}{category_label}{type_label} ({status})")
        print(f"  Saved: {g['current_amount']:.2f} / {g['target_amount']:.2f} ({percent:.1f}%)")
        print(f"  Remaining: {remaining:.2f}")

        if days_left is not None:
            if days_left < 0:
                print(f"  Deadline passed {abs(days_left)} day(s) ago.")
            else:
                print(f"  Days left until deadline: {days_left}")

        if g["goal_type"] == "smart":
            print(f"  [S] Specific:  {g['specific_detail']}")
            print(f"  [M] Measurable: target of {g['target_amount']:.2f}")
            print(f"  [A] Achievable: planning to save {g['monthly_contribution']:.2f}/month")
            print(f"  [R] Relevant:  {g['relevance_reason']}")
            print(f"  [T] Time-bound: due {g['deadline']}")

            # DSA-style check: is the stated monthly contribution actually
            # enough to reach the target by the deadline?
            if days_left is not None and days_left > 0 and remaining > 0:
                months_left = max(days_left / 30, 1 / 30)  # avoid divide-by-zero
                required_monthly = remaining / months_left
                if g["monthly_contribution"] >= required_monthly:
                    print(f"  -> ON TRACK: {g['monthly_contribution']:.2f}/month "
                          f"covers the ~{required_monthly:.2f}/month needed.")
                else:
                    print(f"  -> BEHIND PACE: needs ~{required_monthly:.2f}/month, "
                          f"but only {g['monthly_contribution']:.2f}/month is planned.")

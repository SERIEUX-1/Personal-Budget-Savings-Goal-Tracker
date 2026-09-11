#!/usr/bin/python3
"""
storage.py
----------
Handles all file persistence for the Budget & Savings Tracker.
Responsible for loading and saving application data to a JSON file
using only Python's standard library (`json`, `os`, and `copy`).

Keeping this in its own file means every other module just calls
load_data() / save_data() without knowing or caring how storage works.
"""

import copy
import json
import os

DATA_FILE = os.path.join("data", "budget_data.json")

# Shape of a brand-new, empty dataset. Used if no file exists yet, or if
# the existing file is missing/corrupted, so the app never crashes on start.
# income_categories / expense_categories / goal_categories start with
# sensible defaults but the user can add their own at any time - see
# validation.choose_or_add_category().
DEFAULT_DATA = {
    "transactions": [],
    "goals": [],
    "next_transaction_id": 1,
    "next_goal_id": 1,
    "income_categories": ["Salary", "Freelance", "Gift", "Donation", "Award"],
    "expense_categories": ["Rent", "Food & Beverage", "Transport", "Medical Insurance"],
    "goal_categories": ["Savings", "Debt Repayment", "Investment"],
    "last_seen_month": None,
}


def load_data(filepath=DATA_FILE):
    """
    Load application data from a JSON file.

    Defensive programming:
    - If the file doesn't exist yet (first run), start with empty data.
    - If the file exists but is empty/corrupted (bad JSON), warn the
      user and start with empty data instead of crashing.
    - If the file is valid JSON but missing an expected key (e.g. an
      older version of the file before category lists existed), fill in
      the missing key with its default so old data still loads safely.
    """
    if not os.path.exists(filepath):
        print(f"[Info] No existing data file found at '{filepath}'. Starting fresh.")
        # deepcopy so the lists inside DEFAULT_DATA are never shared/mutated
        # across separate calls or separate app runs in the same process.
        return copy.deepcopy(DEFAULT_DATA)

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"[Warning] Could not read data file ({e}). Starting with empty data.")
        return copy.deepcopy(DEFAULT_DATA)

    # Make sure every expected top-level key is present, even in an old file.
    for key, default_value in DEFAULT_DATA.items():
        if key not in data:
            data[key] = copy.deepcopy(default_value)

    # Backward-compatibility: older goal records won't have these fields,
    # since they were added after the original design (goal_category, then
    # goal_type + the SMART-goal fields). Fill in safe defaults instead of
    # letting later code crash on a missing key.
    for goal in data.get("goals", []):
        if "goal_category" not in goal:
            goal["goal_category"] = ""
        if "goal_type" not in goal:
            goal["goal_type"] = "normal"
        if "specific_detail" not in goal:
            goal["specific_detail"] = ""
        if "monthly_contribution" not in goal:
            goal["monthly_contribution"] = 0.0
        if "relevance_reason" not in goal:
            goal["relevance_reason"] = ""

    return data


def save_data(data, filepath=DATA_FILE):
    """
    Save the given data dictionary to a JSON file.
    Creates the containing folder (e.g. 'data/') if it doesn't exist yet.
    Returns True on success, False on failure, so callers can react if needed.
    """
    try:
        folder = os.path.dirname(filepath)
        if folder and not os.path.exists(folder):
            os.makedirs(folder)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return True
    except OSError as e:
        print(f"[Error] Could not save data file ({e}). Your changes may be lost.")
        return False

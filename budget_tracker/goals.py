#!/usr/bin/python3
"""
goals.py
--------
CRUD (create/view/update/delete) for savings goals, plus the
normal-vs-SMART goal creation flow.

Search/filter for goals lives in processing.py, not here - this file
owns the goal DATA MODEL (what a goal record looks like and how it's
created/edited/removed), while processing.py owns finding/analysing
goals across the whole dataset. That split keeps each file answering
one clear question: "how is a goal record managed?" (here) vs "how do I
search or report on goals?" (processing.py).
"""

from datetime import datetime

from validation import (
    get_non_empty_string,
    get_valid_amount,
    get_valid_date,
    get_valid_int,
    get_valid_choice,
    confirm,
    choose_or_add_category_optional,
)

GOAL_TYPES = ["normal", "smart"]


def add_goal(data):
    """
    Prompt the user for a new savings goal. First asks whether it should
    be a plain/normal goal or a SMART goal (Specific, Measurable,
    Achievable, Relevant, Time-bound) - each SMART letter is asked as
    its own distinct question, matching the real SMART-goal framework
    rather than just relabelling the existing fields.
    """
    print("\n--- Add New Savings Goal ---")
    name = get_non_empty_string("Goal name (e.g. Emergency Fund): ")
    goal_category = choose_or_add_category_optional("Goal", data["goal_categories"])

    print("\nWhat kind of goal is this?")
    print("  1. Normal goal (just a target amount and a deadline)")
    print("  2. SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound)")
    type_choice = get_valid_choice("Choose 1 or 2: ", ["1", "2"])
    goal_type = "normal" if type_choice == "1" else "smart"

    if goal_type == "normal":
        goal = _build_normal_goal(data, name, goal_category)
    else:
        goal = _build_smart_goal(data, name, goal_category)

    data["goals"].append(goal)
    data["next_goal_id"] += 1
    print(f"Goal #{goal['id']} added successfully.")
    return goal


def _build_normal_goal(data, name, goal_category):
    """Ask the plain set of questions for a normal (non-SMART) goal."""
    target = get_valid_amount("Target amount: ")

    current = 0.0
    if confirm("Do you already have some savings towards this goal?"):
        current = get_valid_amount("Current saved amount: ")
        if current > target:
            print("Current amount cannot exceed target; setting current = target.")
            current = target

    deadline = get_valid_date("Target date (YYYY-MM-DD): ")

    return {
        "id": data["next_goal_id"],
        "name": name,
        "goal_category": goal_category,
        "goal_type": "normal",
        "target_amount": target,
        "current_amount": current,
        "deadline": deadline,
        "specific_detail": "",
        "monthly_contribution": 0.0,
        "relevance_reason": "",
    }


def _build_smart_goal(data, name, goal_category):
    """
    Ask one distinct question per SMART letter, so the user actually
    thinks through each part of the framework rather than just filling
    in a target amount and a date.
    """
    print("\nLet's define this as a SMART goal, one letter at a time.")

    specific_detail = get_non_empty_string(
        "\n[S - Specific] Describe exactly what you want to achieve "
        "(e.g. 'Save enough for a 2-week trip to Zanzibar'): "
    )

    target = get_valid_amount(
        "\n[M - Measurable] What amount will let you know this goal is achieved (target amount)? "
    )

    current = 0.0
    if confirm("Do you already have some savings towards this goal?"):
        current = get_valid_amount("Current saved amount: ")
        if current > target:
            print("Current amount cannot exceed target; setting current = target.")
            current = target

    monthly_contribution = get_valid_amount(
        "\n[A - Achievable] How much can you realistically set aside toward this goal each month? "
    )

    relevance_reason = get_non_empty_string(
        "\n[R - Relevant] Why does this goal matter to you right now? "
    )

    deadline = get_valid_date(
        "\n[T - Time-bound] What is your target date to achieve this by (YYYY-MM-DD)? "
    )

    return {
        "id": data["next_goal_id"],
        "name": name,
        "goal_category": goal_category,
        "goal_type": "smart",
        "target_amount": target,
        "current_amount": current,
        "deadline": deadline,
        "specific_detail": specific_detail,
        "monthly_contribution": monthly_contribution,
        "relevance_reason": relevance_reason,
    }


def goal_progress_percent(goal):
    """
    Calculate what percentage of the target amount has been saved so far.
    Capped at 100% so an over-saved goal doesn't display as e.g. 130%.
    Used by both view_goals() here and the savings report in processing.py.
    """
    if goal["target_amount"] == 0:
        return 0.0
    return min(100.0, (goal["current_amount"] / goal["target_amount"]) * 100)


def view_goals(data, goals=None):
    """
    Display goals with their type (Normal/SMART), category, saved amount,
    target, and progress %. Accepts an optional pre-filtered list so
    processing.search_goals() can reuse this same display logic.
    """
    records = goals if goals is not None else data["goals"]

    if not records:
        print("\nNo savings goals to display.")
        return

    print(f"\n{'ID':<4}{'Name':<18}{'Type':<8}{'Category':<15}{'Saved':>9}{'Target':>9}{'Progress':>10}  Deadline")
    print("-" * 90)
    for g in records:
        percent = goal_progress_percent(g)
        type_label = "SMART" if g["goal_type"] == "smart" else "Normal"
        print(f"{g['id']:<4}{g['name']:<18}{type_label:<8}{g['goal_category']:<15}"
              f"{g['current_amount']:>9.2f}{g['target_amount']:>9.2f}{percent:>9.1f}%  {g['deadline']}")


def find_goal_by_id(data, goal_id):
    """Linear search through the goals list for a matching id."""
    for g in data["goals"]:
        if g["id"] == goal_id:
            return g
    return None


def update_goal(data):
    """
    Let the user pick a goal by ID and update its category, saved
    amount, target, or deadline. If the goal is a SMART goal, also
    offers to update the SMART-specific fields (specific detail, monthly
    contribution, relevance reason).
    """
    view_goals(data)
    if not data["goals"]:
        return

    g_id = get_valid_int("\nEnter the ID of the goal to update: ")
    goal = find_goal_by_id(data, g_id)
    if not goal:
        print("No goal found with that ID.")
        return

    print("Leave a field blank to keep its current value.")

    new_category = input(f"Goal category [{goal['goal_category']}]: ").strip()
    if new_category:
        goal["goal_category"] = new_category

    new_current = input(f"Current saved amount [{goal['current_amount']}]: ").strip()
    if new_current:
        try:
            value = float(new_current)
            if value >= 0:
                goal["current_amount"] = round(value, 2)
            else:
                print("Amount cannot be negative; keeping previous value.")
        except ValueError:
            print("Invalid number; keeping previous value.")

    new_target = input(f"Target amount [{goal['target_amount']}]: ").strip()
    if new_target:
        try:
            value = float(new_target)
            if value > 0:
                goal["target_amount"] = round(value, 2)
            else:
                print("Target must be positive; keeping previous value.")
        except ValueError:
            print("Invalid number; keeping previous value.")

    new_deadline = input(f"Deadline [{goal['deadline']}]: ").strip()
    if new_deadline:
        try:
            datetime.strptime(new_deadline, "%Y-%m-%d")
            goal["deadline"] = new_deadline
        except ValueError:
            print("Invalid date format; keeping previous value.")

    if goal["goal_type"] == "smart":
        print("\nThis is a SMART goal - you can also update its SMART details:")
        new_specific = input(f"[S] Specific detail [{goal['specific_detail']}]: ").strip()
        if new_specific:
            goal["specific_detail"] = new_specific

        new_contribution = input(f"[A] Monthly contribution [{goal['monthly_contribution']}]: ").strip()
        if new_contribution:
            try:
                value = float(new_contribution)
                if value >= 0:
                    goal["monthly_contribution"] = round(value, 2)
                else:
                    print("Amount cannot be negative; keeping previous value.")
            except ValueError:
                print("Invalid number; keeping previous value.")

        new_reason = input(f"[R] Relevance reason [{goal['relevance_reason']}]: ").strip()
        if new_reason:
            goal["relevance_reason"] = new_reason

    print(f"Goal #{g_id} updated.")


def delete_goal(data):
    """Delete a savings goal by ID, after asking the user to confirm."""
    view_goals(data)
    if not data["goals"]:
        return

    g_id = get_valid_int("\nEnter the ID of the goal to delete: ")
    goal = find_goal_by_id(data, g_id)
    if not goal:
        print("No goal found with that ID.")
        return

    if confirm(f"Delete goal '{goal['name']}'?"):
        data["goals"].remove(goal)
        print("Goal deleted.")
    else:
        print("Cancelled.")

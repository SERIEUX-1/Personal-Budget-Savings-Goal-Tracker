"""
validation.py
--------------
Reusable input validation and sanitisation helpers, shared by
transactions.py and goals.py.

Design Concept: Every function in this design will repeatedly ask the
user for input until it gets valid data and returns the data. This
implies that any other part of the application will not have to worry
about invalid data because only valid data will be returned from
these functions.
"""

from datetime import datetime

VALID_TYPES = ["income", "expense"]  

def get_non_empty_string(prompt):
    """Keep asking until the user enters a non-blank string."""
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("This field cannot be empty. Please try again.")


def get_optional_string(prompt):
    """
    For truly optional fields (for example, description, goal category)
    Returns what the user entered, or a blank string if nothing was entered.
    There is no validation loop here for a reason; blank is a valid response.
    """
    return input(prompt).strip()


def get_valid_amount(prompt):
    """Keep asking until the user enters a positive number (int or float)."""
    while True:
        raw = input(prompt).strip()
        try:
            amount = float(raw)
            if amount <= 0:
                print("Amount must be greater than zero.")
                continue
            return round(amount, 2)
        except ValueError:
            print("Please enter a valid number (e.g. 25.50).")


def get_valid_date(prompt):
    """Keep asking until the user enters a date in YYYY-MM-DD format."""
    while True:
        raw = input(prompt).strip()
        try:
            datetime.strptime(raw, "%Y-%m-%d")
            return raw
        except ValueError:
            print("Please enter the date as YYYY-MM-DD (e.g. 2026-09-04).")


def get_valid_choice(prompt, choices):
    """Keep asking until the user picks one of the given (case-insensitive) choices."""
    choices_lower = [c.lower() for c in choices]
    while True:
        raw = input(prompt).strip().lower()
        if raw in choices_lower:
            return raw
        print(f"Please enter one of: {', '.join(choices)}")


def get_valid_int(prompt):
    """Keep asking until the user enters a whole number."""
    while True:
        raw = input(prompt).strip()
        try:
            return int(raw)
        except ValueError:
            print("Please enter a whole number.")


def confirm(prompt):
    """Ask a yes/no question and return True/False."""
    while True:
        raw = input(f"{prompt} (y/n): ").strip().lower()
        if raw in ("y", "yes"):
            return True
        if raw in ("n", "no"):
            return False
        print("Please answer y or n.")


def choose_or_add_category(label, category_list):
    """
    Show the user existing categories as a numbered menu, plus an option
    to type a brand-new one. This is used instead of free-typing a
    category every time, so categories stay consistent (no "Food" vs
    "food" vs "Groceries" all meaning the same thing) while still letting
    the user add any category that isn't already in the list.

    `category_list` is mutated in place (a new category is appended to
    it) so the choice is remembered the next time this function is
    called with the same list - the caller is responsible for saving the
    updated data afterwards.
    """
    while True:
        print(f"\n{label} categories:")
        for i, category in enumerate(category_list, start=1):
            print(f"  {i}. {category}")
        add_new_option = len(category_list) + 1
        print(f"  {add_new_option}. Add a new category")

        raw = input("Choose a number: ").strip()
        try:
            choice = int(raw)
        except ValueError:
            print("Please enter a valid number.")
            continue

        if 1 <= choice <= len(category_list):
            return category_list[choice - 1]
        elif choice == add_new_option:
            new_category = get_non_empty_string("Enter the new category name: ")
            if new_category not in category_list:
                category_list.append(new_category)
            return new_category
        else:
            print("Invalid choice. Please pick a number from the list.")


def choose_or_add_category_optional(label, category_list):
    """
    Same as choose_or_add_category(), but adds a "skip / no category"
    option at position 0, for fields where a category is optional
    (e.g. a savings goal's category).
    """
    while True:
        print(f"\n{label} categories (optional):")
        print("  0. Skip / no category")
        for i, category in enumerate(category_list, start=1):
            print(f"  {i}. {category}")
        add_new_option = len(category_list) + 1
        print(f"  {add_new_option}. Add a new category")

        raw = input("Choose a number: ").strip()
        try:
            choice = int(raw)
        except ValueError:
            print("Please enter a valid number.")
            continue

        if choice == 0:
            return ""
        elif 1 <= choice <= len(category_list):
            return category_list[choice - 1]
        elif choice == add_new_option:
            new_category = get_non_empty_string("Enter the new category name: ")
            if new_category not in category_list:
                category_list.append(new_category)
            return new_category
        else:
            print("Invalid choice. Please pick a number from the list.")

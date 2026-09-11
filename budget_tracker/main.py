#!/usr/bin/env python3
"""
main.py
--------
Entry point for the Personal Budget & Savings Goal Tracker.

This file ONLY contains the menu loop and dispatch logic - it does not
know how validation, storage, or analysis work internally.
    - transactions.py / goals.py -> manage individual records (CRUD)
    - processing.py              -> search, filter, totals, and reports
    - storage.py                 -> load/save JSON
    - validation.py              -> shared input checks

Run with:  python main.py
"""

from storage import load_data, save_data
import transactions
import goals
import processing


MAIN_MENU = """
=========================================
 PERSONAL BUDGET & SAVINGS GOAL TRACKER
=========================================
 1. Add transaction (income/expense)
 2. View all transactions
 3. Update a transaction
 4. Delete a transaction
 5. Search / filter transactions
 6. Monthly summary report
 7. Daily summary report (every day)
 8. View a specific day
 9. Category breakdown report
 --- Savings Goals ---
10. Add savings goal (normal or SMART)
11. View savings goals
12. Update a savings goal
13. Delete a savings goal
14. Search / filter goals by category
15. Savings progress report
 0. Exit
=========================================
"""


def main():
    """Load data once at startup, run the menu loop, save on exit."""
    data = load_data()
    print("Welcome! Your saved data has been loaded (if any existed).")

    # If a new calendar month has started since the app was last opened,
    # automatically show a summary of the month that just ended - the
    # user doesn't have to remember to check the menu for it.
    processing.auto_generate_report_for_new_month(data)
    save_data(data)

    while True:
        print(MAIN_MENU)
        choice = input("Choose an option: ").strip()

        if choice == "1":
            transactions.add_transaction(data)
            save_data(data)
        elif choice == "2":
            transactions.view_transactions(data)
        elif choice == "3":
            transactions.update_transaction(data)
            save_data(data)
        elif choice == "4":
            transactions.delete_transaction(data)
            save_data(data)
        elif choice == "5":
            processing.search_transactions(data)
        elif choice == "6":
            processing.monthly_summary_report(data)
        elif choice == "7":
            processing.daily_summary_report(data)
        elif choice == "8":
            processing.daily_detail_lookup(data)
        elif choice == "9":
            processing.category_breakdown_report(data)
        elif choice == "10":
            goals.add_goal(data)
            save_data(data)
        elif choice == "11":
            goals.view_goals(data)
        elif choice == "12":
            goals.update_goal(data)
            save_data(data)
        elif choice == "13":
            goals.delete_goal(data)
            save_data(data)
        elif choice == "14":
            processing.search_goals(data)
        elif choice == "15":
            processing.savings_progress_report(data)
        elif choice == "0":
            save_data(data)
            print("Data saved. Goodbye!")
            break
        else:
            # Invalid menu choices are handled here without crashing the app.
            print("Invalid option. Please choose a number from the menu.")


if __name__ == "__main__":
    main()

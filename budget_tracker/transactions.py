#!/usr/bin/python3
"""
transactions.py
This file only add,view,update and delete the transactions, It does not give ability to search and filter transactions.Analysis and search/filter will all be done in processing.py
It imports data from validation.py for making sure that the user gives valid inputs
"""

from datetime import datetime

from validation import (
    get_optional_string,
    get_valid_amount,
    get_valid_date,
    get_valid_choice,
    get_valid_int,
    confirm,
    choose_or_add_category,
    VALID_TYPES,
)


def add_transaction(data):
    """Prompt for a new income/expense entry, validate it, and store it."""
    print("\n--- Add New Transaction ---")
    t_type = get_valid_choice("Type (income/expense): ", VALID_TYPES)

    # Pick the correct shared category list depending on transaction type.
    # The list is mutated in place if the user adds a brand-new category,
    # so it's remembered next time without any extra code here.
    category_list = data["income_categories"] if t_type == "income" else data["expense_categories"]
    category = choose_or_add_category(t_type.capitalize(), category_list)

    amount = get_valid_amount("Amount: ")
    date = get_valid_date("Date (YYYY-MM-DD): ")
    description = get_optional_string("Description (optional): ")

    transaction = {
        "id": data["next_transaction_id"],
        "type": t_type,
        "category": category,
        "amount": amount,
        "date": date,
        "description": description,
    }

    data["transactions"].append(transaction)
    data["next_transaction_id"] += 1
    print(f"Transaction #{transaction['id']} added successfully.")
    return transaction


def view_transactions(data, transactions=None):
    """
    Display transactions in a readable table.
    Accepts an optional pre-filtered list so processing.search_transactions()
    can reuse this same display logic instead of duplicating print statements.
    """
    records = transactions if transactions is not None else data["transactions"]

    if not records:
        print("\nNo transactions to display.")
        return

    print(f"\n{'ID':<4}{'Date':<12}{'Type':<9}{'Category':<15}{'Amount':>10}  Description")
    print("-" * 70)
    for t in records:
        print(f"{t['id']:<4}{t['date']:<12}{t['type']:<9}{t['category']:<15}"
              f"{t['amount']:>10.2f}  {t['description']}")


def find_transaction_by_id(data, transaction_id):
    """Linear search through the transaction list for a matching id."""
    for t in data["transactions"]:
        if t["id"] == transaction_id:
            return t
    return None


def update_transaction(data):
    """Let the user pick a transaction by ID and edit its fields in place."""
    view_transactions(data)
    if not data["transactions"]:
        return

    t_id = get_valid_int("\nEnter the ID of the transaction to update: ")
    transaction = find_transaction_by_id(data, t_id)
    if not transaction:
        print("No transaction found with that ID.")
        return

    print("Leave a field blank to keep its current value.")

    new_category = input(f"Category [{transaction['category']}]: ").strip()
    if new_category:
        transaction["category"] = new_category

    new_amount = input(f"Amount [{transaction['amount']}]: ").strip()
    if new_amount:
        try:
            amount = float(new_amount)
            if amount > 0:
                transaction["amount"] = round(amount, 2)
            else:
                print("Amount must be positive; keeping previous value.")
        except ValueError:
            print("Invalid number; keeping previous value.")

    new_date = input(f"Date [{transaction['date']}]: ").strip()
    if new_date:
        try:
            datetime.strptime(new_date, "%Y-%m-%d")
            transaction["date"] = new_date
        except ValueError:
            print("Invalid date format; keeping previous value.")

    new_desc = input(f"Description [{transaction['description']}]: ").strip()
    if new_desc:
        transaction["description"] = new_desc

    print(f"Transaction #{t_id} updated.")


def delete_transaction(data):
    """Let the user pick a transaction by ID and remove it, after confirming."""
    view_transactions(data)
    if not data["transactions"]:
        return

    t_id = get_valid_int("\nEnter the ID of the transaction to delete: ")
    transaction = find_transaction_by_id(data, t_id)
    if not transaction:
        print("No transaction found with that ID.")
        return

    if confirm(f"Delete transaction #{t_id} ({transaction['category']}, {transaction['amount']})?"):
        data["transactions"].remove(transaction)
        print("Transaction deleted.")
    else:
        print("Cancelled.")

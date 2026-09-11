# Personal-Budget-Savings-Goal-Tracker
This is our project repository for our  formative assignment.
# Personal Budget & Savings Goal Tracker

A menu-driven Python command-line application for tracking income and
expenses and monitoring progress towards savings goals. Built for the
*Introduction to Programming and Databases* module (Peer Learning Project).

## How to Run

Requirements: Python 3.8+ (standard library only, no external packages).

```bash
python main.py
```

On first run, the app creates `data/budget_data.json` automatically. A
sample dataset is already included so you can explore the reports
immediately.

## Project Structure

```
budget_tracker/
├── main.py                     # Menu loop and user interaction (entry point)
├── validation.py                # Input checks and sanitisation helpers
├── storage.py                   # Load/save JSON using the standard library
├── transactions.py              # CRUD for transaction records only
├── goals.py                     # CRUD for goal records + normal/SMART goal creation
├── processing.py                # Search, filter, totals, and all reports
├── data/
│   └── budget_data.json           # Sample dataset used by the app
├── docs/
│   ├── requirements_note.md       # Problem statement, GCGO link, requirements
│   └── sources_ai_disclosure.md   # AI usage and source disclosure
└── README.md
```

**Why the split:** `transactions.py` and `goals.py` manage individual
records (add/view/update/delete one at a time). `processing.py` is
where every "look across the whole dataset" operation lives — search,
filter, totals, and every report — matching the assessment brief's
suggested `processing.py` module directly.

## Features

- **Transactions (income/expense):** add, view, update, delete
- **Category selection with "add new":** when adding a transaction or
  goal, the user picks from existing categories (numbered menu) or adds
  a brand-new one on the spot — new categories are remembered for next
  time, so the user is never restricted to a fixed list
- **Search / filter transactions:** by category, by type, or by date range
- **Savings goals — Normal or SMART:** when adding a goal, the user
  chooses between a plain goal (name, target, deadline) or a **SMART
  goal**, which asks a distinct question for each letter of the
  framework:
  - **S**pecific — what exactly is being achieved
  - **M**easurable — the target amount
  - **A**chievable — how much can realistically be saved each month
  - **R**elevant — why the goal matters right now
  - **T**ime-bound — the deadline

  The Savings Progress Report shows the full SMART breakdown for these
  goals, plus an automatic **on-track / behind-pace check** that
  compares the stated monthly contribution against what's actually
  required to hit the target by the deadline.
- **Search / filter goals:** by goal category
- **Four analysis features:**
  1. **Monthly Summary Report** — available on demand at any time
     (including the current, still-in-progress month, with no need to
     wait until month-end). Shows total income, total expense, net
     balance, % of income saved, and a full percentage breakdown of
     both income and expenses by category, per month
  2. **Daily Summary Report / View a Specific Day** — the same
     breakdown as the monthly report, but scoped to a single calendar
     day, so the user can see exactly how their money was used on any
     given day. "Daily summary" lists every day with recorded activity;
     "View a specific day" looks up one date directly
  3. **Category Breakdown Report** — total spend and % share per
     expense category across all recorded data, sorted highest first
  4. **Savings Progress Report** — progress %, amount remaining, days
     left until each goal's deadline, and the full SMART breakdown +
     on-track check for SMART goals
- **Automatic monthly report:** if a new calendar month has started
  since the app was last opened, a summary of the month that just ended
  is printed automatically on startup — the user doesn't have to
  remember to check
- **Persistence:** all data is saved to `data/budget_data.json` after
  every change, and reloaded automatically the next time the app starts
- **Validation & error handling:** empty fields, invalid numbers,
  invalid dates, invalid menu choices, and missing/corrupted data files
  are all handled gracefully without crashing

## Menu Overview

```
 1. Add transaction (income/expense)
 2. View all transactions
 3. Update a transaction
 4. Delete a transaction
 5. Search / filter transactions
 6. Monthly summary report
 7. Daily summary report (every day)
 8. View a specific day
 9. Category breakdown report
10. Add savings goal (normal or SMART)
11. View savings goals
12. Update a savings goal
13. Delete a savings goal
14. Search / filter goals by category
15. Savings progress report
 0. Exit
```

## Data Model

See `docs/requirements_note.md` for the full field list and its
Global Challenge (GCGO) justification. In short:

- A **transaction** is a dictionary: `id`, `type` (income/expense),
  `category`, `amount`, `date`, `description`.
- A **goal** is a dictionary: `id`, `name`, `goal_category`, `goal_type`
  (`"normal"` or `"smart"`), `target_amount`, `current_amount`,
  `deadline`, and — for SMART goals — `specific_detail`,
  `monthly_contribution`, `relevance_reason`.
- Both are stored as lists of dictionaries inside one JSON file.

## Known Limitations (by design, for this formative's scope)

- No database — uses JSON file storage as required at this stage
- No OOP/classes — deliberately procedural, matching current module scope
- No GUI/web interface — command-line only

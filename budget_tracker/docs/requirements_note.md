# Requirements Note
PERSONAL BUDGET & SAVINGS GOAL TRACKER

-Module: Introduction to programming and database.
-Assessment : Python menu-driven CLI Application 
-Choosen scenario: Personal Budget & Savings Goals Tracker
Team members: -Nwando
                            -Josephat
                            -Serieux


## 1. Problem Statement

Poverty is often assumed to be caused simply by a lack of income.
However, a large body of financial-capability research shows that
poverty is frequently driven by an *inability to manage the money a
person does have* — particularly when income is disrupted by events
such as job loss or illness. A household that has never learned to
track spending, build a savings buffer, or plan toward a goal has no
cushion when a shock occurs, and can fall into poverty even after
previously holding stable employment.

Financial literacy — the knowledge and skill needed to manage income,
expenses, and savings effectively — has been shown to reduce this
vulnerability. Lusardi and Mitchell (2014) found that financial
literacy functions as a form of human capital that shapes people's
ability to plan, save, and withstand financial shocks, and that people
with low financial literacy are consistently less prepared for
retirement, debt, and emergencies. Wang et al. (2022) found that
financial literacy reduces relative household poverty by improving
participation in savings, insurance, and credit decisions. In a
multi-country study across Kenya, Tanzania, and Uganda, Koomson et al.
(2023) found that higher financial literacy was directly associated
with a lower probability of poverty, largely because it improved
households' financial inclusion and ability to plan.

At the same time, the scale of the underlying problem is significant.
The United Nations (2026) reported that approximately 826 million
people worldwide were living in extreme poverty, with progress on
poverty reduction largely stalled. The United Nations Department of
Economic and Social Affairs (n.d.) similarly reported that working
poverty affected 244 million workers in 2024, showing that having a job
does not, on its own, protect a person from poverty — consistent with
the observation that income disruption or poor financial management
after a period of stable employment can still result in financial
hardship.

This project addresses a small, practical slice of that larger problem:
giving an individual user a simple tool to see exactly where their
money goes, track progress toward savings goals, and build the habit of
financial planning — the foundational skill that the research above
identifies as protective against poverty.

## 2. Intended Users

- A single individual user (e.g. a student) who wants a simple personal
  finance log without a spreadsheet, an app account, or an internet
  connection.
- No multi-user login or shared accounts are in scope for this
  formative — one data file represents one user's finances.

## 3. Link to a Global Challenge / GCGO Theme

This scenario connects to two related UN Sustainable Development Goals:

- **SDG 1 — No Poverty:** the United Nations (n.d.) states that Goal 1
  aims to end poverty in all its forms and to strengthen the resilience
  of the poor and vulnerable to economic shocks.
- **SDG 8 — Decent Work and Economic Growth:** the United Nations
  (n.d.) states that Goal 8 promotes sustained, inclusive economic
  growth and productive employment for all.

The connecting thread between these goals and this project is
**financial resilience**: even where employment exists, a lack of
financial planning skills leaves individuals exposed to poverty when
income is interrupted. By helping a single user build the habit of
tracking income and expenses and working toward savings goals, this
application supports the practical, individual-level financial
capability that underpins both goals.

## 4. Solution Overview — How the Application Works

The application is a menu-driven Python CLI with two connected areas:

**Transactions (income & expenses):**
The user logs each transaction as either income (e.g. Salary, Donation,
Gift) or expense (e.g. Food & Beverage, Transport, Rent, Medical
Insurance), recording the amount, the date, and an optional short
description. Every transaction is validated before it is stored.

**Savings goals:**
The user can create a savings goal (e.g. "Emergency Fund"), optionally
tag it with a goal category (e.g. Savings, Debt Repayment, Investment)
so goals can later be filtered/searched by type, and track progress
toward it. The app automatically calculates what percentage of the
target has been saved.

**Reports (the analysis features):**
- A **Monthly Summary Report** shows total income, total expense, net
  balance, and the percentage of income saved that month — directly
  answering "how much came in, how much went out, and how much did I
  keep?"
- A **Category Breakdown Report** shows total spend and percentage
  share per expense category, so the user can see exactly which
  categories consume most of their money.
- A **Savings Progress Report** shows how close each goal is to being
  reached, the amount still needed, and the days remaining until the
  deadline.

Together, these features let the user answer the central question this
project is built around: *where has every unit of money gone, and how
close am I to my goals?*

## 5. Functional Requirements

The application must allow the user to:

1. Add a new transaction (income or expense) with category, amount,
   date, and an optional description.
2. View all recorded transactions in a readable table.
3. Update an existing transaction's details.
4. Delete an existing transaction (with confirmation before removal).
5. Search/filter transactions by category, by type, or by date range.
6. Generate a **Monthly Summary Report**: total income, total expense,
   net balance, and percentage of income saved, grouped by month.
7. Generate a **Category Breakdown Report**: total spend and
   percentage share per expense category.
8. Add a new savings goal as either a **normal goal** (name, category,
   target amount, deadline) or a **SMART goal**, prompting separately
   for each SMART element: Specific (what exactly is being achieved),
   Measurable (target amount), Achievable (planned monthly
   contribution), Relevant (why it matters), and Time-bound (deadline).
9. View all savings goals, including their type (Normal/SMART), along
   with their current progress.
10. Update an existing savings goal (saved amount, target, category,
    deadline, and — for SMART goals — the SMART-specific fields).
11. Delete an existing savings goal (with confirmation).
12. Search/filter savings goals by goal category.
13. Generate a **Savings Progress Report**: percentage complete, amount
    remaining, and days left until each goal's deadline.
14. Persist all data to a JSON file so it survives an application
    restart.
15. Validate all user input (no empty required fields, positive
    numbers, correctly formatted dates) and handle file errors without
    crashing.

## 6. Data Fields Stored (`data/budget_data.json`)

**Transaction record:**

| Field       | Type   | Notes                                |
|-------------|--------|----------------------------------------|
| id          | int    | Auto-incremented unique identifier    |
| type        | string | `"income"` or `"expense"`             |
| category    | string | e.g. Food & Beverage, Rent, Salary    |
| amount      | float  | Must be greater than 0                |
| date        | string | Format `YYYY-MM-DD`                   |
| description | string | Optional free text                    |

**Savings goal record:**

| Field                 | Type   | Notes                                                          |
|-----------------------|--------|-----------------------------------------------------------------|
| id                    | int    | Auto-incremented unique identifier                             |
| name                  | string | e.g. Emergency Fund                                             |
| goal_category         | string | Optional, e.g. Savings, Debt Repayment; used for search/filter |
| goal_type             | string | `"normal"` or `"smart"`                                        |
| target_amount         | float  | Must be greater than 0 (the SMART "Measurable" value)          |
| current_amount        | float  | Must be 0 or greater; capped at target                         |
| deadline              | string | Format `YYYY-MM-DD` (the SMART "Time-bound" value)              |
| specific_detail       | string | SMART goals only: what exactly is being achieved ("Specific")   |
| monthly_contribution  | float  | SMART goals only: planned monthly saving ("Achievable")         |
| relevance_reason      | string | SMART goals only: why the goal matters ("Relevant")             |

For a **normal** goal, `specific_detail`, `monthly_contribution`, and
`relevance_reason` are simply stored as blank/zero — the record shape
stays the same either way, which keeps `goals.py` and `processing.py`
simple (no separate data structures for the two goal types).

> **Note for implementation:** `goal_category`, `goal_type`, and the
> three SMART fields were added after the original design. `storage.py`
> fills in safe defaults for any of these missing from an older data
> file, so existing sample data with older records still loads without
> errors.

Both record types are stored as lists of dictionaries inside a single
JSON file, alongside two counters — `next_transaction_id` and
`next_goal_id` — used to generate unique IDs for new records.

## 7. Module Responsibilities (Team Contract)

| File               | Responsible for                                                     |
|--------------------|----------------------------------------------------------------------|
| `validation.py`    | Shared input-checking helpers used by every other module            |
| `storage.py`       | Loading/saving the JSON file                                          |
| `transactions.py`  | CRUD for transaction records only (add/view/update/delete)          |
| `goals.py`         | CRUD for goal records, including the normal-vs-SMART goal creation flow |
| `processing.py`    | Search, filter, totals, and all reports (transactions AND goals) — matches the brief's suggested module name directly |
| `main.py`          | Menu loop tying all modules together                                  |

**Note on this split:** `transactions.py` and `goals.py` own *individual
record management* (creating, viewing, editing, deleting one record).
`processing.py` owns everything that looks *across* the dataset —
searching, filtering, totals, and every report. This is a more granular
version of the brief's minimum structure, where `processing.py` was
originally expected to hold all of this in one file; the underlying
responsibilities are identical.

## 8. Out of Scope (for this formative)

- Database systems / SQL
- Object-oriented class design
- Web or GUI interface
- Multi-user accounts or authentication

---

## References

Koomson, I., Ansong, D., Okumu, M., & Achulo, S. (2023). Effect of
financial literacy on poverty reduction across Kenya, Tanzania, and
Uganda. *Global Social Welfare, 10*(1), 93–103.
https://doi.org/10.1007/s40609-022-00259-2

Lusardi, A., & Mitchell, O. S. (2014). The economic importance of
financial literacy: Theory and evidence. *Journal of Economic
Literature, 52*(1), 5–44. https://doi.org/10.1257/jel.52.1.5

United Nations. (2026). *Goal 1: No poverty*. United Nations
Sustainable Development. https://www.un.org/sustainabledevelopment/poverty/

United Nations Department of Economic and Social Affairs. (n.d.).
*Goal 1*. Sustainable Development Goals. Retrieved September 5, 2026,
from https://sdgs.un.org/goals/goal1

United Nations Department of Economic and Social Affairs. (n.d.).
*Goal 8*. Sustainable Development Goals. Retrieved September 5, 2026,
from https://sdgs.un.org/goals/goal8

Wang, S., Cao, P., & Huang, S. (2022). Household financial literacy and
relative poverty: An analysis of the psychology of poverty and market
participation. *Frontiers in Psychology, 13*, Article 898486.
https://doi.org/10.3389/fpsyg.2022.898486

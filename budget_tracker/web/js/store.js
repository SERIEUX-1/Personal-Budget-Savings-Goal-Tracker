/*
 * store.js
 * Load and save the same budget_data.json shape as storage.py.
 * When serve.py is running, the computer file is used.
 * Otherwise the browser keeps the records on this device.
 */
(function () {
  var BT = (window.BT = window.BT || {});
  var DATA_KEY = "bt-data";
  var DIRTY_KEY = "bt-dirty";
  var WELCOME_KEY = "bt-welcome-dismissed";

  var SAMPLE = {
    transactions: [
      { id: 1, type: "income", category: "Salary", amount: 15000, date: "2026-08-01", description: "Monthly salary" },
      { id: 2, type: "expense", category: "Rent", amount: 6000, date: "2026-08-02", description: "August rent" },
      { id: 3, type: "expense", category: "Food & Beverage", amount: 850.5, date: "2026-08-10", description: "Groceries" },
      { id: 4, type: "expense", category: "Transport", amount: 400, date: "2026-08-15", description: "Bus pass" },
      { id: 5, type: "income", category: "Freelance", amount: 2000, date: "2026-09-01", description: "Small web project" },
      { id: 6, type: "expense", category: "Food & Beverage", amount: 620, date: "2026-09-03", description: "Groceries" },
      { id: 7, type: "expense", category: "Medical Insurance", amount: 500, date: "2026-09-05", description: "Monthly premium" },
      { id: 8, type: "income", category: "Salary", amount: 1000, date: "2026-09-11", description: "this is my monthly salary" },
      { id: 9, type: "income", category: "Salary", amount: 10000, date: "2026-09-11", description: "This is my monthly salary" }
    ],
    goals: [
      { id: 1, name: "Emergency Fund", goal_category: "Savings", target_amount: 20000, current_amount: 6500, deadline: "2027-03-01", goal_type: "normal", specific_detail: "", monthly_contribution: 0, relevance_reason: "" },
      { id: 2, name: "New Laptop", goal_category: "Savings", target_amount: 25000, current_amount: 25000, deadline: "2026-12-01", goal_type: "normal", specific_detail: "", monthly_contribution: 0, relevance_reason: "" },
      { id: 3, name: "Credit Card Payoff", goal_category: "Debt Repayment", target_amount: 8000, current_amount: 3000, deadline: "2027-01-15", goal_type: "normal", specific_detail: "", monthly_contribution: 0, relevance_reason: "" },
      { id: 4, name: "Zanzibar Trip", goal_category: "Savings", goal_type: "smart", target_amount: 15000, current_amount: 2000, deadline: "2027-01-01", specific_detail: "Save enough for a 2-week trip to Zanzibar including flights and accommodation", monthly_contribution: 1500, relevance_reason: "I want a proper break after final exams and have wanted to visit Zanzibar for years" }
    ],
    next_transaction_id: 10,
    next_goal_id: 5,
    income_categories: ["Salary", "Freelance", "Gift", "Donation", "Award"],
    expense_categories: ["Rent", "Food & Beverage", "Transport", "Medical Insurance"],
    goal_categories: ["Savings", "Debt Repayment", "Investment"],
    last_seen_month: "2026-10",
    currency: ""
  };

  var INCOME_CATEGORIES = [
    "Salary", "Wages", "Casual work", "Freelance", "Business", "Farm or shop sales",
    "Market sales", "Livestock sales", "Fishing", "Rent received", "Remittance",
    "Gift", "Donation", "Grant or aid", "Award", "Pension", "Allowance",
    "Scholarship", "Bonus", "Commission", "Interest", "Refund", "Sale of something",
    "Other income"
  ];
  var EXPENSE_CATEGORIES = [
    "Food and beverages", "Groceries", "Eating out", "Clothes", "Shoes",
    "School fees", "School supplies", "Transport", "Fuel", "Airtime and data",
    "Rent", "Electricity", "Water", "Cooking fuel", "Medicine", "Hospital",
    "Medical Insurance", "Household", "Soap and cleaning", "Children", "Childcare",
    "Family support", "Funeral or emergency", "Farming", "Business costs",
    "Debt payment", "Church or mosque", "Giving", "Personal care", "Entertainment",
    "Repairs", "Furniture", "Travel", "Tax and fees", "Insurance",
    "Wedding or ceremony", "Other expenses"
  ];

  var mode = "browser";

  BT.categories = {
    income: INCOME_CATEGORIES,
    expense: EXPENSE_CATEGORIES
  };

  function emptyData() {
    return {
      transactions: [],
      goals: [],
      next_transaction_id: 1,
      next_goal_id: 1,
      income_categories: INCOME_CATEGORIES.slice(),
      expense_categories: EXPENSE_CATEGORIES.slice(),
      goal_categories: ["Emergency", "School", "Debt", "Something to keep"],
      last_seen_month: null,
      currency: "",
      second_currency: "",
      language: "en",
      text_size: "normal",
      setup_complete: false,
      showing_example: false,
      exchange: null
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function asStringList(value, fallback) {
    if (!Array.isArray(value)) return fallback.slice();
    return value.filter(function (item) {
      return typeof item === "string" && item.trim();
    });
  }

  function readExchange(value) {
    if (!value || typeof value !== "object") return null;
    var rate = Number(value.rate);
    if (!(rate > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(value.date || "")) return null;
    if (!/^[A-Z]{3}$/.test(value.from || "") || !/^[A-Z]{3}$/.test(value.to || "")) return null;
    return {
      date: value.date,
      from: value.from,
      to: value.to,
      one: /^[A-Z]{3}$/.test(value.one || "") ? value.one : value.to,
      other: /^[A-Z]{3}$/.test(value.other || "") ? value.other : value.from,
      rate: rate
    };
  }

  function normalize(raw) {
    var base = emptyData();
    var data = raw && typeof raw === "object" ? raw : {};
    base.currency = typeof data.currency === "string" ? data.currency : "";
    base.second_currency = typeof data.second_currency === "string" ? data.second_currency : "";
    base.language = typeof data.language === "string" && data.language ? data.language : "en";
    base.text_size = data.text_size === "large" || data.text_size === "larger" ? data.text_size : "normal";
    base.setup_complete = data.setup_complete === true;
    base.showing_example = data.showing_example === true;
    base.last_seen_month = typeof data.last_seen_month === "string" ? data.last_seen_month : null;
    base.income_categories = asStringList(data.income_categories, emptyData().income_categories);
    base.expense_categories = asStringList(data.expense_categories, emptyData().expense_categories);
    base.goal_categories = asStringList(data.goal_categories, emptyData().goal_categories);
    if (typeof data.updated_at === "string") base.updated_at = data.updated_at;
    base.exchange = readExchange(data.exchange);

    base.transactions = (Array.isArray(data.transactions) ? data.transactions : []).filter(function (t) {
      return t && (t.type === "income" || t.type === "expense") && Number(t.amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(t.date || "");
    }).map(function (t) {
      return {
        id: Number(t.id) || 0,
        type: t.type,
        category: String(t.category || "Uncategorised"),
        amount: BT.logic.roundMoney(t.amount),
        date: t.date,
        description: String(t.description || ""),
        currency_code: typeof t.currency_code === "string" ? t.currency_code : ""
      };
    });

    base.goals = (Array.isArray(data.goals) ? data.goals : []).filter(function (g) {
      return g && Number(g.target_amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(g.deadline || "") && String(g.name || "").trim();
    }).map(function (g) {
      var current = BT.logic.roundMoney(Number(g.current_amount) || 0);
      if (current < 0) current = 0;
      return {
        id: Number(g.id) || 0,
        name: String(g.name).trim(),
        goal_category: String(g.goal_category || ""),
        goal_type: g.goal_type === "smart" ? "smart" : "normal",
        target_amount: BT.logic.roundMoney(g.target_amount),
        current_amount: current,
        deadline: g.deadline,
        specific_detail: String(g.specific_detail || ""),
        monthly_contribution: BT.logic.roundMoney(Math.max(0, Number(g.monthly_contribution) || 0)),
        relevance_reason: String(g.relevance_reason || ""),
        goal_kind: g.goal_kind === "emergency" ? "emergency" : ""
      };
    });

    base.transactions.forEach(function (t) {
      var list = t.type === "income" ? base.income_categories : base.expense_categories;
      if (list.indexOf(t.category) === -1) list.push(t.category);
    });
    base.goals.forEach(function (g) {
      if (g.goal_category && base.goal_categories.indexOf(g.goal_category) === -1) {
        base.goal_categories.push(g.goal_category);
      }
    });

    var maxTx = base.transactions.reduce(function (max, t) { return Math.max(max, t.id); }, 0);
    var maxGoal = base.goals.reduce(function (max, g) { return Math.max(max, g.id); }, 0);
    var nextTx = Number(data.next_transaction_id);
    var nextGoal = Number(data.next_goal_id);
    base.next_transaction_id = nextTx > maxTx ? nextTx : maxTx + 1;
    base.next_goal_id = nextGoal > maxGoal ? nextGoal : maxGoal + 1;
    return base;
  }

  function readLocal() {
    try {
      var raw = localStorage.getItem(DATA_KEY);
      if (!raw) return null;
      return normalize(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function writeLocal(data) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function isDirty() {
    return localStorage.getItem(DIRTY_KEY) === "1";
  }

  function setDirty(value) {
    if (value) localStorage.setItem(DIRTY_KEY, "1");
    else localStorage.removeItem(DIRTY_KEY);
  }

  function fetchWithTimeout(url, options, ms) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var opts = Object.assign({}, options || {});
    var timer = null;
    if (controller) {
      opts.signal = controller.signal;
      timer = setTimeout(function () { controller.abort(); }, ms);
    }
    return fetch(url, opts).then(function (response) {
      if (timer) clearTimeout(timer);
      return response;
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  async function fetchRemote() {
    if (navigator.onLine === false) throw new Error("offline");
    var response = await fetchWithTimeout("/api/data", { cache: "no-store" }, 2000);
    if (!response.ok) throw new Error("Could not read records");
    return normalize(await response.json());
  }

  async function putRemote(data) {
    if (navigator.onLine === false) return false;
    var response = await fetchWithTimeout("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }, 2000);
    return response.ok;
  }

  async function load() {
    var local = readLocal();
    var remote = null;
    try {
      remote = await fetchRemote();
    } catch (e) {
      remote = null;
    }

    if (remote && local && isDirty()) {
      var pushed = await putRemote(local);
      if (pushed) {
        setDirty(false);
        mode = "file";
        writeLocal(local);
        return { data: local, mode: mode };
      }
    }

    if (remote) {
      mode = "file";
      setDirty(false);
      writeLocal(remote);
      return { data: remote, mode: mode };
    }

    mode = "browser";
    if (local) return { data: local, mode: mode };
    return { data: emptyData(), mode: mode };
  }

  function looksLikeSample(data) {
    var trip = (data.goals || []).some(function (g) { return g.name === "Zanzibar Trip"; });
    var salary = (data.transactions || []).some(function (t) { return t.description === "Monthly salary"; });
    return trip && salary;
  }

  function needsSetup(data) {
    if (!data || data.setup_complete || data.showing_example) return false;
    if (data.transactions.length && data.updated_at && !looksLikeSample(data)) return false;
    return true;
  }

  async function save(data) {
    data.updated_at = new Date().toISOString();
    var localOk = writeLocal(data);
    if (mode === "file") {
      var ok = await putRemote(data);
      setDirty(!ok);
      return { ok: ok || localOk, where: ok ? "file" : "browser-backup" };
    }
    setDirty(true);
    return { ok: localOk, where: localOk ? "browser" : "failed" };
  }

  function exampleData() {
    return normalize(clone(SAMPLE));
  }

  function welcomeDismissed() {
    return localStorage.getItem(WELCOME_KEY) === "1";
  }

  function dismissWelcome() {
    localStorage.setItem(WELCOME_KEY, "1");
  }

  function currentMode() {
    return mode;
  }

  BT.store = {
    emptyData: emptyData,
    normalize: normalize,
    load: load,
    save: save,
    exampleData: exampleData,
    needsSetup: needsSetup,
    welcomeDismissed: welcomeDismissed,
    dismissWelcome: dismissWelcome,
    currentMode: currentMode
  };
})();

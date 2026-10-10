/*
 * ui.js
 * Screens for Budget Tracker: home, money, goals, reports, and settings.
 * The questions on the home screen are the point of the tool:
 * where money comes from, where it goes, and how close each goal is.
 */
(function () {
  var L = window.BT.logic;
  var store = window.BT.store;
  var MENU = [
    { id: "add", n: "1", key: "m1" },
    { id: "tx", n: "2", key: "m2" },
    { id: "tx-edit", n: "3", key: "m3" },
    { id: "tx-delete", n: "4", key: "m4" },
    { id: "tx-search", n: "5", key: "m5" },
    { id: "month", n: "6", key: "m6" },
    { id: "days", n: "7", key: "m7" },
    { id: "day", n: "8", key: "m8" },
    { id: "category", n: "9", key: "m9" },
    { divider: "m-goals" },
    { id: "add-goal", n: "10", key: "m10" },
    { id: "goals", n: "11", key: "m11" },
    { id: "goal-edit", n: "12", key: "m12" },
    { id: "goal-delete", n: "13", key: "m13" },
    { id: "goal-search", n: "14", key: "m14" },
    { id: "progress", n: "15", key: "m15" },
    { id: "exit", n: "0", key: "m0" }
  ];
  var TURN = MENU.filter(function (item) { return item.id; }).map(function (item) { return item.id; });
  var PAGES = ["menu", "settings"].concat(TURN);
  function catalogFor(type) {
    var catalog = window.BT.categories || {};
    return (type === "income" ? catalog.income : catalog.expense) || [];
  }
  var RATE_CACHE = "bt-rate-cache";

  var state = {
    data: null,
    mode: "browser",
    page: "menu",
    homePeriod: "auto",
    txFilter: { type: "all", category: "", start: "", end: "", query: "" },
    goalFilter: { category: "", query: "" },
    report: { tab: "month", day: "", showAll: false },
    saveWarning: "",
    pending: null,
    hideAmounts: false,
    locked: false,
    setup: false,
    setupStep: 0,
    pinEntry: "",
    lockError: "",
    setupDraft: null,
    rateDay: "",
    converting: false,
    entry: "",
    entryCurrency: "",
    entryPending: false,
    currencyQuery: "",
    languageQuery: ""
  };

  function t(key, vars) {
    return window.BT.i18n.t(key, vars);
  }
  var busy = false;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(amount, code) {
    if (state.hideAmounts) return "••••";
    var symbol = code == null ? (state.data ? state.data.currency : "") : code;
    return L.formatMoney(amount, symbol);
  }

  function plainMoney(amount, code) {
    var symbol = code == null ? (state.data ? state.data.currency : "") : code;
    return L.formatMoney(amount, symbol);
  }

  function pageFromHash() {
    var hash = location.hash.replace("#", "");
    var alias = { home: "menu", money: "tx", reports: "month" };
    if (alias[hash]) hash = alias[hash];
    return PAGES.indexOf(hash) === -1 ? "menu" : hash;
  }

  function pageTitle(page) {
    var item = MENU.filter(function (row) { return row.id === page; })[0];
    if (item) return t(item.key);
    if (page === "settings") return t("nav-settings");
    return t("m-title");
  }

  function toast(message) {
    var el = document.getElementById("toast");
    el.hidden = false;
    el.textContent = message;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.hidden = true; }, 3400);
  }

  function openModal(html) {
    document.getElementById("modal-root").innerHTML =
      '<div class="modal-backdrop" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true">' +
      html + "</div></div>";
    document.body.classList.add("modal-open");
    var field = document.querySelector("#modal-root input, #modal-root select, #modal-root textarea, #modal-root button");
    if (field) field.focus();
  }

  function closeModal() {
    document.getElementById("modal-root").innerHTML = "";
    document.body.classList.remove("modal-open");
    state.pending = null;
  }

  function rememberCategory(list, name) {
    var trimmed = name.trim();
    var found = list.filter(function (item) {
      return item.toLowerCase() === trimmed.toLowerCase();
    })[0];
    if (found) return found;
    list.push(trimmed);
    return trimmed;
  }

  function saveLabel() {
    if (state.saveWarning === "backup") return t("save-backup");
    if (state.saveWarning === "fail") return t("save-fail");
    if (state.mode === "file") return t("save-file");
    return t("save-browser");
  }

  async function persist(message) {
    if (busy || !state.data) return false;
    busy = true;
    try {
      var result = await store.save(state.data);
      if (result.where === "file") state.saveWarning = "";
      else if (result.where === "browser-backup") state.saveWarning = "backup";
      else if (!result.ok) state.saveWarning = "fail";
      else state.saveWarning = "";
      if (message) toast(state.saveWarning || message);
      return result.ok;
    } finally {
      busy = false;
    }
  }

  function menuMarkup() {
    return MENU.map(function (item) {
      if (item.divider) return '<p class="cli-split">' + esc(t(item.divider)) + "</p>";
      var on = item.id === state.page;
      return '<button type="button" class="cli-item' + (on ? " is-active" : "") + '" data-action="nav" data-page="' +
        item.id + '"' + (on ? ' aria-current="page"' : "") + '><span class="cli-num">' + item.n +
        "</span><span>" + esc(t(item.key)) + "</span></button>";
    }).join("");
  }

  function setNav() {
    var side = document.getElementById("side-menu");
    if (side) side.innerHTML = '<p class="cli-kicker">' + esc(t("m-title")) + "</p>" + menuMarkup();
    var tab = document.getElementById("menu-tab");
    if (tab) {
      tab.textContent = t("menu");
      var onMenu = state.page === "menu" && !state.setup && !state.locked;
      tab.classList.toggle("is-active", onMenu);
      if (onMenu) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    }
    var settings = document.getElementById("settings-link");
    if (settings) {
      settings.hidden = !!(state.setup || state.locked || state.entry);
      settings.textContent = t("nav-settings");
      settings.classList.toggle("is-active", state.page === "settings");
    }
    fillTurners();
    if (window.BT.guide) window.BT.guide.sync();
  }

  function fillTurners() {
    var html = turnerHtml();
    ["menu-turn", "dock-turn"].forEach(function (id) {
      var box = document.getElementById(id);
      if (box) box.innerHTML = html;
    });
  }

  function turnLabel(page) {
    if (page === "menu") return t("menu");
    return pageTitle(page);
  }

  function neighbors() {
    if (state.page === "settings") return { index: -1, prev: "menu", next: "" };
    var index = TURN.indexOf(state.page);
    if (index === -1) return { index: -1, prev: "", next: TURN[0] };
    return {
      index: index,
      prev: index > 0 ? TURN[index - 1] : "menu",
      next: index < TURN.length - 1 ? TURN[index + 1] : ""
    };
  }

  function turnerHtml() {
    var near = neighbors();
    var index = near.index;
    var prev = near.prev;
    var next = near.next;
    var prevBtn = prev
      ? '<button type="button" class="turn-btn turn-prev" data-action="nav" data-page="' + prev + '"><strong>' + esc(t("page-back")) + '</strong><span class="turn-kicker">' + esc(turnLabel(prev)) + "</span></button>"
      : '<span class="turn-btn turn-empty"></span>';
    var nextBtn = next
      ? '<button type="button" class="turn-btn turn-next" data-action="nav" data-page="' + next + '"><strong>' + esc(t("page-next")) + '</strong><span class="turn-kicker">' + esc(turnLabel(next)) + "</span></button>"
      : '<span class="turn-btn turn-empty"></span>';
    var dots = TURN.map(function (_, dot) {
      return '<i class="' + (dot === index ? "is-on" : "") + '"></i>';
    }).join("");
    var step = index === -1 ? "" : (index + 1) + " / " + TURN.length;
    return '<p class="turn-label">' + esc(t("turn-label")) + "</p>" +
      '<div class="turn-row">' + prevBtn +
      '<span class="turn-step"><span class="turn-dots">' + dots + "</span>" + step + "</span>" +
      nextBtn + "</div>";
  }

  function applyPrefs() {
    var lang = (state.data && state.data.language) || localStorage.getItem("bt-lang") || "en";
    var size = (state.data && state.data.text_size) || localStorage.getItem("bt-text") || "normal";
    window.BT.i18n.set(lang);
    document.documentElement.lang = window.BT.speech ? window.BT.speech.tag(window.BT.i18n.current()) : lang;
    document.documentElement.dir = window.BT.i18n.dir();
    document.body.classList.remove("text-large", "text-larger");
    if (size === "large" || size === "larger") document.body.classList.add("text-" + size);
    document.body.classList.toggle("is-setup", !!state.setup);
    document.body.classList.toggle("is-locked", !!state.locked);
    document.body.classList.toggle("is-entry", !!state.entry);
  }

  function render() {
    applyPrefs();
    document.title = (state.locked ? t("lock-title") : state.entry ? (state.entry === "money" ? t("entry-money") : t("entry-lang")) : state.setup ? t("setup-hello") : pageTitle(state.page)) + " · Budget Tracker";
    var save = document.getElementById("save-state");
    if (save) save.textContent = state.setup || state.locked || state.entry ? "" : saveLabel();
    var hideBtn = document.getElementById("hide-amounts");
    if (hideBtn) {
      hideBtn.hidden = !!(state.setup || state.locked || state.entry);
      hideBtn.textContent = state.hideAmounts ? t("show") : t("hide");
      hideBtn.setAttribute("aria-pressed", state.hideAmounts ? "true" : "false");
    }
    var app = document.getElementById("app");
    var html;
    if (state.locked) html = renderLock();
    else if (state.entry) html = renderEntry();
    else if (state.setup) html = renderSetup();
    else {
      html = {
        menu: renderMenu,
        add: renderAddTx,
        tx: function () { return renderMoney("view"); },
        "tx-edit": function () { return renderMoney("edit"); },
        "tx-delete": function () { return renderMoney("delete"); },
        "tx-search": function () { return renderMoney("search"); },
        month: function () { return renderOneReport("month"); },
        days: function () { return renderOneReport("days"); },
        day: function () { return renderOneReport("day"); },
        category: function () { return renderOneReport("category"); },
        "add-goal": renderAddGoal,
        goals: function () { return renderGoals("view"); },
        "goal-edit": function () { return renderGoals("edit"); },
        "goal-delete": function () { return renderGoals("delete"); },
        "goal-search": function () { return renderGoals("search"); },
        progress: function () { return renderOneReport("progress"); },
        exit: renderExit,
        settings: renderSettings
      }[state.page]();
    }
    app.innerHTML = html;
    app.dataset.ready = "1";
    if (!state.setup && !state.locked && state.page === "add" && document.getElementById("tx-form")) prepareTxForm(null);
    if (!state.setup && !state.locked && state.page === "add-goal" && document.getElementById("goal-form")) prepareGoalForm(null);
    setNav();
    if (state.entry === "money" || state.entry === "lang") {
      var search = document.getElementById(state.entry === "money" ? "currency-search" : "language-search");
      if (search) search.focus();
    }
  }

  function go(page) {
    closeModal();
    if (page === state.page && pageFromHash() === page) {
      render();
      return;
    }
    location.hash = page;
  }

  function homePeriod() {
    var tx = state.data.transactions;
    var month = L.currentMonth();
    var week = L.isoWeekKey(L.todayISO());
    var choice = state.homePeriod;
    if (choice === "auto") {
      var monthHas = tx.some(function (t) { return t.date.slice(0, 7) === month; });
      choice = monthHas || !tx.length ? "month" : "all";
    }
    if (choice === "week") {
      return {
        key: "week",
        label: L.weekLabel(week),
        rows: tx.filter(function (t) { return L.isoWeekKey(t.date) === week; }),
        note: ""
      };
    }
    if (choice === "all") {
      var monthName = L.formatMonth(month);
      var monthEmpty = tx.length && !tx.some(function (t) { return t.date.slice(0, 7) === month; });
      return {
        key: "all",
        label: t("all-recorded"),
        rows: tx,
        note: monthEmpty ? t("no-month-note", { month: monthName }) : ""
      };
    }
    return {
      key: "month",
      label: L.formatMonth(month),
      rows: tx.filter(function (t) { return t.date.slice(0, 7) === month; }),
      note: ""
    };
  }

  function renderHome() {
    var view = homePeriod();
    var split = pots(view.rows);
    var summary = L.summarize(split.main);
    var active = view.key;
    var banner = state.data.showing_example
      ? '<section class="welcome"><p>' + esc(t("example-banner")) + '</p><button type="button" class="btn btn-primary" data-action="start-own">' + esc(t("start-own")) + "</button></section>"
      : "";
    var note = view.note ? '<p class="note note-plain">' + esc(view.note) + "</p>" : "";
    var empty = view.rows.length ? "" : '<p class="note note-plain">' + esc(t("period-empty")) + "</p>";
    var other = otherPotLine(split.other);
    var offer = emergencyOffer();
    var insight = weekInsightText();
    return banner +
      '<p class="eyebrow">' + esc(t("your-money")) + "</p>" +
      "<h1>" + esc(view.label) + "</h1>" +
      '<p class="lede">' + esc(t("lede")) + "</p>" +
      '<p class="trust">' + esc(t("trust")) + "</p>" +
      note +
      '<button type="button" class="btn btn-primary today-btn no-print" data-action="open-today">' + esc(t("today")) + "</button>" +
      '<div class="seg no-print" role="group" aria-label="' + esc(t("this-month")) + '">' +
      chip("home-period", "month", t("this-month"), active) +
      chip("home-period", "week", t("this-week"), active) +
      chip("home-period", "all", t("all-time"), active) +
      "</div>" +
      statRow(summary) +
      other +
      empty +
      '<p class="insight">' + esc(insight) + "</p>" +
      '<div class="row-actions no-print">' +
      '<button type="button" class="btn btn-secondary" data-action="hear">' + esc(t("hear")) + "</button>" +
      '<button type="button" class="btn btn-secondary" data-action="share-page">' + esc(t("one-page")) + "</button>" +
      "</div>" +
      offer +
      '<div class="row-actions no-print">' +
      '<button type="button" class="btn btn-primary" data-action="add-tx" data-type="income">' + esc(t("add-in")) + "</button>" +
      '<button type="button" class="btn btn-secondary" data-action="add-tx" data-type="expense">' + esc(t("add-out")) + "</button>" +
      "</div>" +
      categoryBlock(t("where-from"), summary.income_categories, summary.income_total, "income", t("none-in")) +
      categoryBlock(t("where-go"), summary.expense_categories, summary.expense_total, "expense", t("none-out")) +
      '<section class="block"><h2>' + esc(t("how-close")) + "</h2>" +
      (state.data.goals.length ? goalCards(state.data.goals, true) : '<p class="note note-plain">' + esc(t("no-goal-yet")) + '</p><button type="button" class="btn btn-primary" data-action="add-goal">' + esc(t("add-goal")) + "</button>") +
      "</section>" +
      '<section class="block"><h2>' + esc(t("latest")) + "</h2>" + txCards(latestTx(4)) + "</section>";
  }

function chip(action, value, label, active) {
  var cls = "chip" + (active === value ? " is-active" : "");
  return '<button type="button" class="' + cls + '" data-action="' + action + '" data-value="' +
    esc(value) + '">' + esc(label) + "</button>";
}

  function statRow(summary) {
    var net = L.netOf(summary);
    var kept = net.net >= 0
      ? t("kept-share", { pct: L.formatPercent(net.percentSaved) })
      : t("spent-more");
    if (!net.income && net.expense) kept = t("no-income");
    return '<div class="stats">' +
      stat(t("money-in"), money(net.income), "income", t("received")) +
      stat(t("money-out"), money(net.expense), "expense", t("spent")) +
      stat(t("you-kept"), money(net.net), net.net < 0 ? "expense" : "", kept) +
      "</div>";
  }

  function stat(label, value, kind, detail) {
    return '<article class="stat ' + kind + '"><span>' + esc(label) + "</span><strong>" +
      esc(value) + "</strong><em>" + esc(detail) + "</em></article>";
  }

  function categoryBlock(title, categories, total, kind, emptyText) {
    var rows = L.sortedEntries(categories);
    var body = rows.length ? rows.map(function (row) {
      var pct = total ? (row[1] / total) * 100 : 0;
      var width = total ? Math.max(0, Math.min(100, pct)) : 0;
      return '<div class="bar-block"><div class="bar-row"><span class="bar-name" title="' + esc(row[0]) + '">' +
        esc(row[0]) + '</span><span class="bar-amt">' + esc(money(row[1])) + '</span><span class="bar-pct">' +
        esc(L.formatPercent(pct)) + '</span></div><div class="bar-track"><div class="bar-fill ' + kind +
        '" style="width:' + width.toFixed(1) + '%"></div></div></div>';
    }).join("") : "<p class=\"muted\">" + esc(emptyText) + "</p>";
    return '<section class="block"><h2>' + esc(title) + "</h2>" + body + "</section>";
  }

  function latestTx(limit) {
    return state.data.transactions.slice().sort(sortTx).slice(0, limit);
  }

  function sortTx(a, b) {
    if (a.date === b.date) return b.id - a.id;
    return a.date < b.date ? 1 : -1;
  }

  function txCards(list, mode) {
    if (!list.length) return '<p class="muted">' + esc(t("no-records")) + "</p>";
    return '<div class="tx-list">' + list.map(function (trow) {
      var code = trow.currency_code || "";
      var apart = code ? '<small class="muted">' + esc(t("remittance-note")) + "</small>" : "";
      var editBtn = '<button type="button" class="btn ' + (mode === "edit" ? "btn-primary" : "btn-secondary") + '" data-action="edit-tx" data-id="' + trow.id + '">' + esc(t("edit")) + "</button>";
      var deleteBtn = '<button type="button" class="btn ' + (mode === "delete" ? "btn-danger" : "btn-ghost") + '" data-action="delete-tx" data-id="' + trow.id + '">' + esc(t("delete")) + "</button>";
      var actions = mode === "edit" ? editBtn : mode === "delete" ? deleteBtn : editBtn + deleteBtn;
      return '<article class="tx ' + trow.type + '"><div class="tx-accent"></div><div><div class="tx-top"><strong>' +
        esc(trow.category) + '</strong><span class="money">' + esc(money(trow.amount, code || state.data.currency)) + "</span></div><small>" +
        esc(L.formatDate(trow.date)) + " · " + (trow.type === "income" ? esc(t("money-in")) : esc(t("money-out"))) +
        (code ? " · " + esc(code) : "") + "</small>" + apart +
        (trow.description ? "<p>" + esc(trow.description) + "</p>" : "") +
        '<div class="tx-actions no-print">' + actions + "</div></div></article>";
    }).join("") + "</div>";
  }

  function goalCards(list, compact, mode) {
    var today = L.todayISO();
    var ordered = list.slice().sort(function (a, b) {
      var ap = L.goalProgress(a) >= 100 ? 1 : 0;
      var bp = L.goalProgress(b) >= 100 ? 1 : 0;
      if (ap !== bp) return ap - bp;
      return a.deadline < b.deadline ? -1 : 1;
    });
    return '<div class="goal-grid">' + ordered.map(function (g) {
      return goalCard(g, today, compact, mode);
    }).join("") + "</div>";
  }

  function goalActions(g, mode) {
    var saved = '<button type="button" class="btn btn-primary" data-action="add-saved" data-id="' + g.id + '">' + esc(t("i-saved")) + "</button>";
    var edit = '<button type="button" class="btn ' + (mode === "edit" ? "btn-primary" : "btn-secondary") + '" data-action="edit-goal" data-id="' + g.id + '">' + esc(t("edit")) + "</button>";
    var remove = '<button type="button" class="btn ' + (mode === "delete" ? "btn-danger" : "btn-ghost") + '" data-action="delete-goal" data-id="' + g.id + '">' + esc(t("delete")) + "</button>";
    if (mode === "edit") return edit;
    if (mode === "delete") return remove;
    return saved + edit + remove;
  }

  function goalCard(g, today, compact, mode) {
    var pace = L.goalPace(g, today);
    var width = Math.max(0, Math.min(100, pace.percent));
    var days = deadlineText(pace.daysLeft);
    var emergency = isEmergency(g);
    var typeLabel = g.goal_type === "smart" ? t("smart-goal") : t("goal");
    var category = g.goal_category ? " · " + g.goal_category : "";
    var paceNote = paceNoteHtml(g, pace);
    var smart = !compact && g.goal_type === "smart" ? smartHtml(g) : "";
    var covered = L.daysCovered(g);
    var headline = emergency
      ? '<p class="percent-big">' + covered + ' <span class="of-week">/ 7</span></p><p class="muted">' + esc(t("days-line", { n: covered })) + " · " + esc(L.formatPercent(pace.percent)) + "</p>"
      : '<p class="percent-big">' + esc(L.formatPercent(pace.percent)) + "</p>";
    var status = pace.remaining > 0 ? esc(t("still", { amount: money(pace.remaining) })) : esc(t("reached"));
    return '<article class="goal"><div class="goal-top"><div><small>' + esc(typeLabel + category) +
      "</small><h3>" + esc(g.name) + "</h3></div>" + headline +
      '</div><div class="progress" aria-hidden="true"><span style="width:' + width.toFixed(1) +
      '%"></span></div><p class="money">' + esc(t("saved-of", { have: money(g.current_amount), need: money(g.target_amount) })) +
      "</p><p>" + status + " " + esc(days) + "</p>" + paceNote + smart +
      '<div class="goal-actions no-print">' + goalActions(g, mode) + "</div></article>";
  }

  function deadlineText(daysLeft) {
    if (daysLeft === null) return "";
    if (daysLeft < 0) return t("days-past", { n: Math.abs(daysLeft) });
    if (daysLeft === 0) return t("date-today");
    return t("days-left", { n: daysLeft });
  }

  function paceNoteHtml(goal, pace) {
    if (!pace.pace) return "";
    if (pace.pace.onTrack) {
      return '<p class="note note-good">' + esc(t("on-track")) + " " + esc(money(goal.monthly_contribution)) +
        " / " + esc(money(pace.pace.required)) + "</p>";
    }
    return '<p class="note note-warn">' + esc(t("short-plan")) + " " + esc(money(pace.pace.required)) +
      " / " + esc(money(goal.monthly_contribution)) + ". " + esc(t("smaller-step")) + "</p>";
  }

  function smartHtml(goal) {
    return '<ul class="smart-list"><li><span class="letter">S</span> ' + esc(goal.specific_detail) +
      '</li><li><span class="letter">M</span> ' + esc(t("smart-m")) + " " + esc(money(goal.target_amount)) +
      '</li><li><span class="letter">A</span> ' + esc(t("smart-a")) + " " + esc(money(goal.monthly_contribution)) +
      '</li><li><span class="letter">R</span> ' + esc(goal.relevance_reason) +
      '</li><li><span class="letter">T</span> ' + esc(t("smart-t")) + " " + esc(L.formatDate(goal.deadline)) + "</li></ul>";
  }

  function filteredTx() {
    var f = state.txFilter;
    var query = f.query.trim().toLowerCase();
    return state.data.transactions.filter(function (t) {
      if (f.type !== "all" && t.type !== f.type) return false;
      if (f.category && t.category !== f.category) return false;
      if (f.start && t.date < f.start) return false;
      if (f.end && t.date > f.end) return false;
      if (query) {
        var blob = (t.category + " " + t.description + " " + t.type).toLowerCase();
        if (blob.indexOf(query) === -1) return false;
      }
      return true;
    }).sort(sortTx);
  }

  var STEP_HINT = {
    add: "step-add",
    tx: "step-tx",
    "tx-edit": "step-edit",
    "tx-delete": "step-delete",
    "tx-search": "step-search",
    month: "step-report",
    days: "step-report",
    day: "step-day",
    category: "step-report",
    "add-goal": "step-add-goal",
    goals: "step-goals",
    "goal-edit": "step-goal-edit",
    "goal-delete": "step-goal-delete",
    "goal-search": "step-goal-search",
    progress: "step-progress",
    exit: "step-exit"
  };

  function stepButtons() {
    var near = neighbors();
    if (!near.prev && !near.next) return "";
    var prev = near.prev
      ? '<button type="button" class="btn btn-secondary" data-action="nav" data-page="' + near.prev + '">' + esc(t("page-back")) + "</button>"
      : "<span></span>";
    var next = near.next
      ? '<button type="button" class="btn btn-primary" data-action="nav" data-page="' + near.next + '">' + esc(t("page-next")) + "</button>"
      : "<span></span>";
    return '<div class="step-actions no-print">' + prev + next + "</div>";
  }

  function withStep(body) {
    var near = neighbors();
    if (near.index < 0) return body;
    return '<section class="step-head no-print"><p class="eyebrow">' + esc(t("step-of", { n: near.index + 1, total: TURN.length })) +
      "</p><h1>" + esc(pageTitle(state.page)) + '</h1><p class="lede">' + esc(t(STEP_HINT[state.page] || "menu-lead")) +
      "</p>" + stepButtons() + "</section>" + body;
  }

  function renderMenu() {
    return '<section class="cli-board"><h1>' + esc(t("m-title")) + '</h1><p class="lede cli-lead">' + esc(t("menu-lead")) +
      '</p><div class="cli-rule"></div>' + menuMarkup() + '<div class="cli-rule"></div>' + stepButtons() + "</section>";
  }

  function renderAddTx() {
    return withStep('<section class="card">' + txForm(null, "income") + "</section>");
  }

  function renderAddGoal() {
    return withStep('<section class="card">' + goalForm(null) + "</section>");
  }

  function renderExit() {
    return withStep('<p class="lede">' + esc(t("exit-lead")) + '</p><p class="trust">' + esc(t("trust")) + "</p>" +
      '<div class="row-actions"><button type="button" class="btn btn-primary" data-action="nav" data-page="menu">' + esc(t("back-menu")) + "</button></div>");
  }

  function renderMoney(mode) {
    var categories = uniqueCategories();
    var options = '<option value="">' + esc(t("all-categories")) + "</option>" + categories.map(function (c) {
      return '<option value="' + esc(c) + '"' + (state.txFilter.category === c ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("");
    var list = mode === "search" ? filteredTx() : state.data.transactions.slice().sort(sortTx);
    var filters = mode === "search"
      ? '<div class="filters no-print"><label class="field">' + esc(t("search")) + '<input id="tx-search" value="' + esc(state.txFilter.query) +
        '" placeholder="' + esc(t("category")) + '"></label><label class="field">' + esc(t("type")) + '<select id="tx-type-filter">' +
        option("all", t("all"), state.txFilter.type) + option("income", t("money-in"), state.txFilter.type) +
        option("expense", t("money-out"), state.txFilter.type) + '</select></label><label class="field">' + esc(t("category")) + '<select id="tx-category-filter">' +
        options + '</select></label><label class="field">' + esc(t("from")) + '<input id="tx-start" type="date" value="' +
        esc(state.txFilter.start) + '"></label><label class="field">' + esc(t("to")) + '<input id="tx-end" type="date" value="' +
        esc(state.txFilter.end) + '"></label></div>'
      : "";
    var pdf = mode === "view" || mode === "search" ? pdfButton() : "";
    return withStep(pdf + '<p class="lede">' + esc(t("records-match", { n: list.length })) + "</p>" + filters +
      '<div id="tx-list">' + (list.length ? txCards(list, mode) : '<p class="note note-plain">' + esc(t("nothing-matches")) + "</p>") + "</div>");
  }

  function option(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (value === selected ? " selected" : "") + ">" + esc(label) + "</option>";
  }

  function uniqueCategories() {
    var seen = {};
    state.data.income_categories.concat(state.data.expense_categories).forEach(function (c) { seen[c] = true; });
    return Object.keys(seen).sort();
  }

  function renderGoals(mode) {
    var f = state.goalFilter;
    var cats = '<option value="">' + esc(t("all-categories")) + "</option>" + state.data.goal_categories.map(function (c) {
      return '<option value="' + esc(c) + '"' + (f.category === c ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("");
    var filters = mode === "search"
      ? '<div class="filters no-print"><label class="field">' + esc(t("search")) + '<input id="goal-search" value="' + esc(f.query) +
        '"></label><label class="field">' + esc(t("category")) + '<select id="goal-category-filter">' + cats + "</select></label></div>"
      : "";
    var pdf = mode === "view" || mode === "search" ? pdfButton() : "";
    return withStep(pdf + '<p class="lede">' + esc(t("goals-lead")) + "</p>" + filters +
      '<div id="goal-list">' + goalListHtml(mode) + "</div>");
  }

  function goalListHtml(mode) {
    var f = state.goalFilter;
    var query = mode === "search" ? f.query.trim().toLowerCase() : "";
    var category = mode === "search" ? f.category : "";
    var list = state.data.goals.filter(function (g) {
      if (category && g.goal_category !== category) return false;
      if (!query) return true;
      return (g.name + " " + g.goal_category).toLowerCase().indexOf(query) !== -1;
    });
    return list.length ? goalCards(list, false, mode) : '<p class="note note-plain">' + esc(t("no-goal-match")) + "</p>";
  }

  function renderOneReport(which) {
    var body = which === "month"
      ? periodReport("month", function (row) { return row.date.slice(0, 7); }, L.formatMonth)
      : which === "days"
        ? periodReport("days", function (row) { return row.date; }, L.formatDate)
        : which === "day"
          ? renderDay()
          : which === "category"
            ? renderCategoryReport()
            : renderGoalReport();
    return withStep(pdfButton() + body);
  }

  function renderReports() {
    var tab = state.report.tab;
    var tabs = [
      ["month", t("by-month")],
      ["week", t("by-week")],
      ["day", t("by-day")],
      ["category", t("by-category")],
      ["goals", t("goal-progress")]
    ];
    var body = {
      month: function () { return periodReport("month", function (t) { return t.date.slice(0, 7); }, L.formatMonth); },
      week: function () { return periodReport("week", function (t) { return L.isoWeekKey(t.date); }, L.weekLabel); },
      day: renderDay,
      category: renderCategoryReport,
      goals: renderGoalReport
    }[tab]();
    return "<h1>" + esc(t("reports")) + '</h1><p class="lede">' + esc(t("reports-lead")) + "</p>" +
      '<div class="seg no-print" role="tablist">' + tabs.map(function (item) {
        return chip("report-tab", item[0], item[1], tab);
      }).join("") + "</div>" +
      pdfButton() +
      body;
  }

  function periodReport(kind, keyFn, labelFn) {
    var rows = pots(state.data.transactions).main;
    if (!rows.length) return '<p class="note note-plain">' + esc(t("no-records")) + "</p>";
    var summary = L.buildPeriodSummary(rows, keyFn);
    var keys = Object.keys(summary).sort().reverse();
    var limit = kind === "week" ? 8 : kind === "days" ? 14 : 6;
    var shown = state.report.showAll ? keys : keys.slice(0, limit);
    var html = shown.map(function (key) {
      var block = summary[key];
      return '<article class="report-card"><h2>' + esc(labelFn(key)) + '</h2><p class="muted">' +
        esc(t("record-count", { n: block.count })) + "</p>" + statRow(block) +
        categoryBlock(t("money-in"), block.income_categories, block.income_total, "income", t("none-in")) +
        categoryBlock(t("money-out"), block.expense_categories, block.expense_total, "expense", t("none-out")) +
        "</article>";
    }).join("");
    if (!state.report.showAll && keys.length > shown.length) {
      html += '<button type="button" class="btn btn-secondary no-print" data-action="show-all-periods">' + esc(t("show-older")) + "</button>";
    }
    return '<div class="stack">' + html + "</div>";
  }

  function renderDay() {
    var rows = pots(state.data.transactions).main;
    var summary = L.buildPeriodSummary(rows, function (row) { return row.date; });
    var days = Object.keys(summary).sort().reverse();
    var selected = state.report.day && /^\d{4}-\d{2}-\d{2}$/.test(state.report.day)
      ? state.report.day
      : (days[0] || L.todayISO());
    var block = summary[selected];
    var detail = block
      ? '<article class="report-card"><h2>' + esc(L.formatDate(selected)) + "</h2>" + statRow(block) +
        categoryBlock(t("money-in"), block.income_categories, block.income_total, "income", t("none-in")) +
        categoryBlock(t("money-out"), block.expense_categories, block.expense_total, "expense", t("none-out")) +
        "<h3>" + esc(t("latest")) + "</h3>" + txCards(rows.filter(function (row) { return row.date === selected; }).sort(sortTx)) +
        "</article>"
      : '<p class="note note-plain">' + esc(t("period-empty")) + " " + esc(L.formatDate(selected)) + "</p>";
    var chips = days.slice(0, 12).map(function (day) {
      return chip("pick-day", day, L.formatDate(day), selected);
    }).join("");
    return '<label class="field no-print">' + esc(t("by-day")) + '<input id="day-lookup" type="date" value="' + esc(selected) +
      '"></label><div class="chip-row no-print">' + chips + "</div>" + detail;
  }

  function renderCategoryReport() {
    var report = L.categoryTotals(pots(state.data.transactions).main);
    if (!report.rows.length) return '<p class="note note-plain">' + esc(t("no-spending")) + "</p>";
    return '<article class="report-card"><h2>' + esc(t("where-goes")) + "</h2><p>" + esc(money(report.grand)) +
      "</p>" + categoryBlock(t("share-spending"), report.totals, report.grand, "expense", "") + "</article>";
  }

  function renderGoalReport() {
    if (!state.data.goals.length) return '<p class="note note-plain">' + esc(t("no-goal-yet")) + "</p>";
    return "<p>" + esc(t("goals-lead")) + " " + esc(t("five-questions")) + "</p>" +
      goalCards(state.data.goals, false);
  }

  function canonicalCurrency(code) {
    var key = String(code || "").trim().toUpperCase();
    if (key === "KSH") return "KES";
    if (key === "TSH") return "TZS";
    return key;
  }

  function formatQuote(n) {
    var value = Number(n);
    if (!isFinite(value)) return "";
    if (value >= 100) return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (value >= 1) return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }

  function quotePair(direct, inverse, from, to) {
    if (Number(inverse) >= 1) return { one: to, other: from, rate: Number(inverse) };
    return { one: from, other: to, rate: Number(direct) };
  }

  function bookHasMainMoney() {
    var data = state.data;
    if (data.goals.some(function (goal) {
      return goal.target_amount > 0 || goal.current_amount > 0 || goal.monthly_contribution > 0;
    })) return true;
    return data.transactions.some(function (row) { return !row.currency_code && row.amount > 0; });
  }

  function readRateCache() {
    try { return JSON.parse(localStorage.getItem(RATE_CACHE) || "{}"); } catch (e) { return {}; }
  }

  function cachedPair(from, to, date) {
    var all = readRateCache();
    var exact = all[from + "|" + to + "|" + (date || "latest")];
    if (exact) return exact;
    if (date) return null;
    var found = null;
    Object.keys(all).forEach(function (name) {
      var row = all[name];
      if (row && row.from === from && row.to === to && (!found || row.date > found.date)) found = row;
    });
    return found;
  }

  async function fetchOneRate(base, quote, date) {
    var url = "https://api.frankfurter.dev/v2/rate/" + encodeURIComponent(base) + "/" + encodeURIComponent(quote);
    if (date) url += "?date=" + encodeURIComponent(date);
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 4000) : null;
    try {
      var response = await fetch(url, controller ? { signal: controller.signal } : {});
      if (!response.ok) return null;
      var body = await response.json();
      if (!body || !(Number(body.rate) > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(body.date || "")) return null;
      return { date: body.date, rate: Number(body.rate) };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function loadRatePair(from, to, date) {
    if (navigator.onLine === false) return null;
    var direct = null;
    var inverse = null;
    try {
      var both = await Promise.all([
        fetchOneRate(from, to, date).catch(function () { return null; }),
        fetchOneRate(to, from, date).catch(function () { return null; })
      ]);
      direct = both[0];
      inverse = both[1];
    } catch (e) {
      direct = null;
      inverse = null;
    }
    if (!direct && !inverse) return null;
    var entry = {
      from: from,
      to: to,
      date: (direct && direct.date) || inverse.date,
      direct: direct ? direct.rate : 0,
      inverse: inverse ? inverse.rate : 0
    };
    try {
      var all = readRateCache();
      all[from + "|" + to + "|" + (date || "latest")] = entry;
      localStorage.setItem(RATE_CACHE, JSON.stringify(all));
    } catch (e) { /* the rate is still used for this change */ }
    return entry;
  }

  function rewriteMainAmounts(factor) {
    state.data.transactions.forEach(function (row) {
      if (row.currency_code) return;
      var next = L.roundMoney(row.amount * factor);
      row.amount = next > 0 ? next : 0.01;
    });
    state.data.goals.forEach(function (goal) {
      var target = L.roundMoney(goal.target_amount * factor);
      goal.target_amount = target > 0 ? target : 0.01;
      goal.current_amount = L.roundMoney(Math.max(0, goal.current_amount * factor));
      goal.monthly_contribution = L.roundMoney(Math.max(0, goal.monthly_contribution * factor));
    });
  }

  async function changeCurrency(raw) {
    if (state.converting) return;
    var next = canonicalCurrency(raw);
    var from = canonicalCurrency(state.data.currency);
    if (next && !/^[A-Z]{3}$/.test(next)) {
      toast(t("rate-code"));
      render();
      return;
    }
    if (from === next) {
      if (next && state.data.currency !== next) {
        state.data.currency = next;
        if (state.setup) render();
        else persist(t("currency-updated")).then(render);
      }
      return;
    }
    if (!next || state.setup || !from || !bookHasMainMoney()) {
      state.data.currency = next;
      if (state.setup) { render(); return; }
      await persist(!from && next ? t("rate-labeled", { code: next }) : t("currency-updated"));
      render();
      return;
    }
    state.converting = true;
    toast(t("rate-working"));
    var date = /^\d{4}-\d{2}-\d{2}$/.test(state.rateDay || "") ? state.rateDay : "";
    var pair = await loadRatePair(from, next, date);
    var usedSaved = false;
    if (!pair) {
      pair = cachedPair(from, next, date);
      usedSaved = !!pair;
    }
    state.converting = false;
    var factor = pair ? L.conversionFactor(pair.direct, pair.inverse) : null;
    if (!factor) {
      toast(t("rate-failed", { code: from }));
      render();
      return;
    }
    var shown = quotePair(pair.direct, pair.inverse, from, next);
    var rateText = t("rate-body", {
      date: L.formatDate(pair.date),
      one: shown.one,
      other: shown.other,
      rate: formatQuote(shown.rate),
      from: from,
      to: next
    });
    if (usedSaved) rateText = t("rate-saved", { date: L.formatDate(pair.date) }) + " " + rateText;
    confirmBox(t("rate-ask", { from: from, to: next }), rateText, t("rate-change"), {
      kind: "currency",
      calm: true,
      to: next,
      factor: factor,
      exchange: {
        date: pair.date,
        from: from,
        to: next,
        one: shown.one,
        other: shown.other,
        rate: shown.rate,
        source: "Frankfurter"
      }
    });
  }

  function renderSettings() {
    var currency = canonicalCurrency(state.data.currency || "");
    var second = state.data.second_currency || "";
    var lang = state.data.language || "en";
    var size = state.data.text_size || "normal";
    var last = state.data.exchange;
    var lastLine = last
      ? '<p class="trust">' + esc(t("rate-last", {
        date: L.formatDate(last.date),
        one: last.one,
        other: last.other,
        rate: formatQuote(last.rate)
      })) + "</p>"
      : "";
    var sizes = chip("set-size", "normal", t("size-normal"), size) +
      chip("set-size", "large", t("size-large"), size) +
      chip("set-size", "larger", t("size-larger"), size);
    var locked = window.BT.vault.hasLock();
    return "<h1>" + esc(t("settings")) + "</h1>" +
      '<section class="block"><h2>' + esc(t("language")) + "</h2>" + languageSearchBox(lang) + "</section>" +
      '<section class="block"><h2>' + esc(t("text-size")) + '</h2><div class="chip-row">' + sizes + "</div></section>" +
      '<section class="block"><h2>' + esc(t("currency")) + '</h2><p class="lede">' + esc(t("currency-help")) + "</p>" +
      lastLine +
      currencySearchBox("set-currency", currency) +
      '<label class="field">' + esc(t("rate-day")) + '<input id="rate-day" type="date" value="' + esc(state.rateDay || "") + '"></label>' +
      '<p class="note note-plain">' + esc(t("rate-day-help")) + "</p></section>" +
      '<section class="block"><h2>' + esc(t("second-title")) + '</h2><p>' + esc(t("second-help")) + "</p>" +
      '<label class="field">' + esc(t("second-title")) + '<input id="second-currency" value="' + esc(second) + '" maxlength="12" placeholder="' + esc(t("second-placeholder")) + '"></label></section>' +
      '<section class="block"><h2>' + esc(t("privacy")) + "</h2><p>" + esc(locked ? t("lock-on") : t("lock-off")) + "</p>" +
      (locked ? '<p class="trust">' + esc(t("lock-sealed")) + "</p>" : "") +
      '<p class="trust">' + esc(t("trust")) + "</p>" +
      '<p class="trust">' + esc(t("offline-note")) + "</p>" +
      '<div class="row-actions"><button type="button" class="btn btn-primary" data-action="set-lock">' + esc(locked ? t("change-pin") : t("set-pin")) + "</button>" +
      (locked ? '<button type="button" class="btn btn-secondary" data-action="remove-lock">' + esc(t("remove-pin")) + "</button>" : "") +
      "</div></section>" +
      '<section class="block"><h2>' + esc(t("your-copy")) + "</h2><p>" + esc(t("copy-help")) + "</p>" +
      '<div class="row-actions"><button type="button" class="btn btn-primary" data-action="export">' + esc(t("export")) + "</button>" +
      '<button type="button" class="btn btn-secondary" data-action="pick-import">' + esc(t("import")) + "</button>" +
      '<input id="import-file" type="file" accept="application/json,.json" hidden></div></section>' +
      '<section class="block"><h2>' + esc(t("start-again")) + '</h2><div class="row-actions">' +
      '<button type="button" class="btn btn-secondary" data-action="start-own">' + esc(t("start-own")) + "</button>" +
      '<button type="button" class="btn btn-secondary" data-action="restore-example">' + esc(t("example")) + "</button>" +
      '<button type="button" class="btn btn-danger" data-action="erase">' + esc(t("erase")) + "</button></div></section>" +
      '<section class="block about"><h2>Budget Tracker</h2>' +
      "<p>" + esc(t("about-1")) + "</p><p>" + esc(t("trust")) + "</p><p>" + esc(t("about-2")) + "</p><p>" + esc(t("about-3")) + "</p></section>";
  }

  function categoriesFor(type, current) {
    var stored = type === "income" ? state.data.income_categories : state.data.expense_categories;
    var list = [];
    var seen = {};
    function add(name) {
      var clean = String(name || "").trim();
      var key = clean.toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      list.push(clean);
    }
    stored.forEach(add);
    catalogFor(type).forEach(add);
    if (current) add(current);
    return list;
  }

  function fillSelect(select, items, selected, extras) {
    var html = (extras || "") + items.map(function (item) {
      return '<option value="' + esc(item) + '"' + (item === selected ? " selected" : "") + ">" + esc(item) + "</option>";
    }).join("") + '<option value="__new__">' + esc(t("add-category")) + "</option>";
    select.innerHTML = html;
  }

  function txForm(existing, presetType) {
    var tx = existing || {
      id: "",
      type: presetType || "income",
      category: "",
      amount: "",
      date: L.todayISO(),
      description: "",
      currency_code: ""
    };
    var title = existing ? t("edit-record") : (tx.type === "income" ? t("add-in") : t("add-out"));
    var second = (state.data.second_currency || "").trim();
    var pot = second
      ? '<div class="choice-row"><label class="choice"><input type="radio" name="pot" value="main"' +
        (tx.currency_code ? "" : " checked") + "> " + esc(t("pot-main")) + '</label><label class="choice"><input type="radio" name="pot" value="other"' +
        (tx.currency_code ? " checked" : "") + "> " + esc(t("pot-other", { code: second })) + "</label></div>"
      : "";
    return "<h2>" + esc(title) + "</h2><p>" + esc(t("tx-help")) + "</p>" +
      '<form id="tx-form"><input id="tx-id" type="hidden" value="' + esc(tx.id) + '">' +
      '<div class="choice-row"><label class="choice"><input type="radio" name="type" value="income"' +
      (tx.type === "income" ? " checked" : "") + "> " + esc(t("money-in")) + '</label><label class="choice"><input type="radio" name="type" value="expense"' +
      (tx.type === "expense" ? " checked" : "") + "> " + esc(t("money-out")) + "</label></div>" + pot +
      '<label class="field">' + esc(t("category")) + '<select id="tx-category" class="category-list" size="8"></select></label>' +
      '<div id="new-category-wrap" hidden><label class="field">' + esc(t("new-category")) + '<input id="new-category" maxlength="60"></label>' +
      '<div class="row-actions"><button type="button" class="btn btn-secondary" data-action="speak-name" data-target="new-category">' + esc(t("speak")) + "</button></div></div>" +
      '<label class="field">' + esc(t("amount")) + '<input id="tx-amount" inputmode="decimal" value="' + esc(tx.amount) + '" required></label>' +
      '<label class="field">' + esc(t("date")) + '<input id="tx-date" type="date" value="' + esc(tx.date) + '" required></label>' +
      '<label class="field">' + esc(t("note-optional")) + '<textarea id="tx-description">' + esc(tx.description) + "</textarea></label>" +
      '<p id="form-error" class="form-error" role="alert"></p><div class="form-actions">' +
      '<button type="submit" class="btn btn-primary">' + esc(t("save")) + "</button>" +
      '<button type="button" class="btn btn-secondary" data-action="close-modal">' + esc(t("cancel")) + "</button></div></form>";
  }

  function prepareTxForm(existing) {
    var type = document.querySelector('#tx-form input[name="type"]:checked').value;
    var select = document.getElementById("tx-category");
    var current = existing ? existing.category : "";
    fillSelect(select, categoriesFor(type, current), current || categoriesFor(type, "")[0]);
    var idField = document.getElementById("tx-id");
    var heading = document.querySelector("#tx-form").parentElement.querySelector("h2");
    if (heading && idField && !idField.value) heading.textContent = type === "income" ? t("add-in") : t("add-out");
  }

  function goalForm(existing) {
    var g = existing || {
      id: "", name: "", goal_category: "", goal_type: "normal", target_amount: "", current_amount: "",
      deadline: "", specific_detail: "", monthly_contribution: "", relevance_reason: ""
    };
    return "<h2>" + esc(existing ? t("edit-goal") : t("add-goal")) + "</h2>" +
      "<p>" + esc(t("goal-help")) + " " + esc(t("five-questions")) + "</p>" +
      '<form id="goal-form"><input id="goal-id" type="hidden" value="' + esc(g.id) + '">' +
      '<label class="field">' + esc(t("goal-name")) + '<input id="goal-name" value="' + esc(g.name) + '" required></label>' +
      '<label class="field">' + esc(t("category")) + '<select id="goal-category"></select></label>' +
      '<div id="new-goal-category-wrap" hidden><label class="field">' + esc(t("new-category")) + '<input id="new-goal-category" maxlength="40"></label>' +
      '<button type="button" class="btn btn-secondary" data-action="speak-name" data-target="new-goal-category">' + esc(t("speak")) + "</button></div>" +
      '<div class="choice-row"><label class="choice"><input type="radio" name="goal_type" value="normal"' +
      (g.goal_type !== "smart" ? " checked" : "") + "> " + esc(t("normal-goal")) + '</label><label class="choice"><input type="radio" name="goal_type" value="smart"' +
      (g.goal_type === "smart" ? " checked" : "") + "> " + esc(t("smart-goal")) + "</label></div>" +
      '<label class="field"><span><span class="letter">M</span> ' + esc(t("smart-m")) + '</span><input id="goal-target" inputmode="decimal" value="' + esc(g.target_amount) + '"></label>' +
      '<label class="field">' + esc(t("already-saved")) + '<input id="goal-current" inputmode="decimal" value="' + esc(g.current_amount) + '"></label>' +
      '<label class="field"><span><span class="letter">T</span> ' + esc(t("smart-t")) + '</span><input id="goal-deadline" type="date" value="' + esc(g.deadline) + '"></label>' +
      '<div id="smart-fields"' + (g.goal_type === "smart" ? "" : " hidden") + ">" +
      '<label class="field"><span><span class="letter">S</span> ' + esc(t("smart-s")) + '</span><textarea id="goal-specific">' +
      esc(g.specific_detail) + "</textarea></label>" +
      '<label class="field"><span><span class="letter">A</span> ' + esc(t("smart-a")) + '</span><input id="goal-monthly" inputmode="decimal" value="' +
      esc(g.monthly_contribution || "") + '"></label>' +
      '<label class="field"><span><span class="letter">R</span> ' + esc(t("smart-r")) + '</span><textarea id="goal-relevance">' +
      esc(g.relevance_reason) + "</textarea></label></div>" +
      '<p id="form-error" class="form-error" role="alert"></p><div class="form-actions">' +
      '<button type="submit" class="btn btn-primary">' + esc(t("save-goal")) + "</button>" +
      '<button type="button" class="btn btn-secondary" data-action="close-modal">' + esc(t("cancel")) + "</button></div></form>";
  }

  function prepareGoalForm(existing) {
    var select = document.getElementById("goal-category");
    var current = existing ? existing.goal_category : "";
    fillSelect(select, state.data.goal_categories, current, '<option value="">' + esc(t("category")) + "</option>");
  }

  function showError(message) {
    var el = document.getElementById("form-error");
    if (el) el.textContent = message;
  }

  function readTx(form) {
    var type = form.querySelector('input[name="type"]:checked').value;
    var selected = form.querySelector("#tx-category").value;
    var category = selected === "__new__" ? form.querySelector("#new-category").value.trim() : selected;
    if (!category) return { error: t("choose-category") };
    var amount = L.parseAmount(form.querySelector("#tx-amount").value, false);
    if (!amount.ok) return { error: t("bad-amount") };
    var date = form.querySelector("#tx-date").value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: t("choose-date") };
    var pot = form.querySelector('input[name="pot"]:checked');
    var second = (state.data.second_currency || "").trim();
    var currencyCode = pot && pot.value === "other" && second ? second : "";
    return {
      ok: true,
      value: {
        id: Number(form.querySelector("#tx-id").value) || null,
        type: type,
        category: category,
        amount: amount.value,
        date: date,
        description: form.querySelector("#tx-description").value.trim(),
        currency_code: currencyCode
      }
    };
  }

  function applyTx(value) {
    var list = value.type === "income" ? state.data.income_categories : state.data.expense_categories;
    var category = rememberCategory(list, value.category);
    if (value.id) {
      var existing = state.data.transactions.filter(function (t) { return t.id === value.id; })[0];
      if (!existing) return false;
      existing.type = value.type;
      existing.category = category;
      existing.amount = value.amount;
      existing.date = value.date;
      existing.description = value.description;
      existing.currency_code = value.currency_code || "";
      return true;
    }
    state.data.transactions.push({
      id: state.data.next_transaction_id,
      type: value.type,
      category: category,
      amount: value.amount,
      date: value.date,
      description: value.description,
      currency_code: value.currency_code || ""
    });
    state.data.next_transaction_id += 1;
    return true;
  }

  function readGoal(form) {
    var name = form.querySelector("#goal-name").value.trim();
    if (!name) return { error: t("goal-name") };
    var selected = form.querySelector("#goal-category").value;
    var category = selected === "__new__" ? form.querySelector("#new-goal-category").value.trim() : selected;
    if (selected === "__new__" && !category) return { error: t("choose-category") };
    var goalType = form.querySelector('input[name="goal_type"]:checked').value;
    var target = L.parseAmount(form.querySelector("#goal-target").value, false);
    if (!target.ok) return { error: t("bad-amount") };
    var currentRaw = form.querySelector("#goal-current").value.trim();
    var current = { ok: true, value: 0 };
    if (currentRaw) {
      current = L.parseAmount(currentRaw, true);
      if (!current.ok) return { error: t("bad-amount") };
    }
    var date = form.querySelector("#goal-deadline").value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: t("choose-date") };
    var specific = "";
    var monthly = 0;
    var reason = "";
    var id = Number(form.querySelector("#goal-id").value) || null;
    var capped = false;
    if (!id && current.value > target.value) {
      current.value = target.value;
      capped = true;
    }
    if (goalType === "smart") {
      specific = form.querySelector("#goal-specific").value.trim();
      if (!specific) return { error: t("smart-s") };
      var monthlyParsed = L.parseAmount(form.querySelector("#goal-monthly").value, false);
      if (!monthlyParsed.ok) return { error: t("bad-amount") };
      monthly = monthlyParsed.value;
      reason = form.querySelector("#goal-relevance").value.trim();
      if (!reason) return { error: t("smart-r") };
    }
    return {
      ok: true,
      capped: capped,
      value: {
        id: id,
        name: name,
        goal_category: category,
        goal_type: goalType,
        target_amount: target.value,
        current_amount: current.value,
        deadline: date,
        specific_detail: specific,
        monthly_contribution: monthly,
        relevance_reason: reason
      }
    };
  }

  function applyGoal(value) {
    if (value.goal_category) rememberCategory(state.data.goal_categories, value.goal_category);
    if (value.id) {
      var existing = state.data.goals.filter(function (g) { return g.id === value.id; })[0];
      if (!existing) return false;
      Object.keys(value).forEach(function (key) {
        if (key !== "id") existing[key] = value[key];
      });
      return true;
    }
    var goal = {
      id: state.data.next_goal_id,
      name: value.name,
      goal_category: value.goal_category,
      goal_type: value.goal_type,
      target_amount: value.target_amount,
      current_amount: value.current_amount,
      deadline: value.deadline,
      specific_detail: value.specific_detail,
      monthly_contribution: value.monthly_contribution,
      relevance_reason: value.relevance_reason,
      goal_kind: value.goal_kind || ""
    };
    state.data.goals.push(goal);
    state.data.next_goal_id += 1;
    return true;
  }

  function findById(list, id) {
    return list.filter(function (item) { return item.id === id; })[0];
  }

  function confirmBox(title, text, confirmLabel, pending) {
    state.pending = pending;
    var tone = pending && pending.calm ? "btn btn-primary" : "btn btn-danger";
    openModal("<h2>" + esc(title) + "</h2><p>" + esc(text) + "</p>" +
      '<div class="form-actions"><button type="button" class="' + tone + '" data-action="confirm-pending">' +
      esc(confirmLabel) + '</button><button type="button" class="btn btn-secondary" data-action="close-modal">' + esc(t("keep")) + "</button></div>");
  }

  async function afterChange(message) {
    closeModal();
    await persist(message);
    render();
    window.scrollTo(0, 0);
  }

  function refreshListOnly() {
    var list = filteredTx();
    var el = document.getElementById("tx-list");
    if (!el) return;
    el.innerHTML = list.length ? txCards(list) : '<p class="note note-plain">' + esc(t("nothing-matches")) + "</p>";
    var count = document.querySelector("#app .lede");
    if (count) count.textContent = t("records-match", { n: list.length });
  }

  document.body.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;
    if (action === "backdrop") {
      if (e.target === btn) closeModal();
      return;
    }
    if (action === "close-modal") {
      var wasCurrency = state.pending && state.pending.kind === "currency";
      var opening = state.entryPending;
      closeModal();
      if (opening) {
        state.entryPending = false;
        state.entry = "money";
        render();
        return;
      }
      if (wasCurrency || state.page === "add" || state.page === "add-goal") render();
      return;
    }
    if (action === "nav") {
      if (state.setup || state.locked || state.entry) return;
      if (btn.dataset.page !== state.page) location.hash = btn.dataset.page;
      return;
    }
    if (action === "toggle-hide") {
      state.hideAmounts = !state.hideAmounts;
      if (state.hideAmounts) localStorage.setItem("bt-hide", "1");
      else localStorage.removeItem("bt-hide");
      render();
      return;
    }
    if (action === "hear") { speak(homeSpeech()); return; }
    if (action === "open-today") { openToday(); return; }
    if (action === "start-own") { beginSetup(); return; }
    if (action === "look-example") { useExample(); return; }
    if (action === "setup-next") { setupNext(); return; }
    if (action === "setup-back") { state.setupStep = Math.max(0, state.setupStep - 1); render(); return; }
    if (action === "setup-skip") { setupSkip(btn.dataset.which); return; }
    if (action === "pin-digit") { pressDigit(btn.dataset.value); return; }
    if (action === "pin-clear") {
      state.pinEntry = "";
      state.lockError = "";
      if (state.pending && (state.pending.kind === "set-pin" || state.pending.kind === "remove-pin")) {
        var dots = document.getElementById("pin-dots");
        if (dots) dots.textContent = "·";
        return;
      }
      render();
      return;
    }
    if (action === "set-language") {
      state.languageQuery = "";
      chooseLanguage(btn.dataset.value);
      return;
    }
    if (action === "pick-entry-currency") {
      state.entryCurrency = btn.dataset.value;
      state.currencyQuery = "";
      render();
      return;
    }
    if (action === "entry-back") {
      state.entry = "lang";
      state.currencyQuery = "";
      render();
      return;
    }
    if (action === "entry-next") {
      if (state.entry !== "money") {
        state.entry = "money";
        if (!state.entryCurrency) state.entryCurrency = canonicalCurrency(state.data.currency || "");
        render();
        return;
      }
      finishEntryCurrency();
      return;
    }
    if (action === "set-size") { chooseSize(btn.dataset.value); return; }
    if (action === "set-cushion") { createCushion(); return; }
    if (action === "speak-name") { dictate(btn.dataset.target); return; }
    if (action === "set-lock") { openPinSetup(false); return; }
    if (action === "remove-lock") { openPinSetup(true); return; }
    if (action === "home-period") {
      state.homePeriod = btn.dataset.value;
      render();
      return;
    }
    if (action === "report-tab") {
      state.report.tab = btn.dataset.value;
      state.report.showAll = false;
      render();
      return;
    }
    if (action === "show-all-periods") {
      state.report.showAll = true;
      render();
      return;
    }
    if (action === "pick-day") {
      state.report.day = btn.dataset.value;
      render();
      return;
    }
    if (action === "print" || action === "download-pdf" || action === "share-page") { downloadStatement(); return; }
    if (action === "close-pdf") { closeStatement(); return; }
    if (action === "add-tx") { openTx(null, btn.dataset.type); return; }
    if (action === "edit-tx") { openTx(findById(state.data.transactions, Number(btn.dataset.id))); return; }
    if (action === "delete-tx") { askDeleteTx(Number(btn.dataset.id)); return; }
    if (action === "add-goal") { openGoal(null); return; }
    if (action === "edit-goal") { openGoal(findById(state.data.goals, Number(btn.dataset.id))); return; }
    if (action === "delete-goal") { askDeleteGoal(Number(btn.dataset.id)); return; }
    if (action === "add-saved") { openAddSaved(Number(btn.dataset.id)); return; }
    if (action === "use-suggestion") {
      var input = document.getElementById("new-category");
      if (input) { input.value = btn.dataset.value; input.focus(); }
      return;
    }
    if (action === "set-currency") {
      state.currencyQuery = "";
      changeCurrency(btn.dataset.value);
      return;
    }
    if (action === "export") { exportData(); return; }
    if (action === "pick-import") {
      var picker = document.getElementById("import-file");
      if (picker) picker.click();
      return;
    }
    if (action === "restore-example") {
      confirmBox(t("example-ask"), t("example-body"), t("use-example"), { kind: "example" });
      return;
    }
    if (action === "erase") {
      confirmBox(t("erase-ask"), t("erase-body"), t("erase-yes"), { kind: "erase" });
      return;
    }
    if (action === "confirm-pending") { runPending(); }
  });

  document.body.addEventListener("change", function (e) {
    var id = e.target.id;
    if (id === "tx-type-filter") { state.txFilter.type = e.target.value; render(); return; }
    if (id === "tx-category-filter") { state.txFilter.category = e.target.value; render(); return; }
    if (id === "tx-start") { state.txFilter.start = e.target.value; render(); return; }
    if (id === "tx-end") { state.txFilter.end = e.target.value; render(); return; }
    if (id === "goal-category-filter") { state.goalFilter.category = e.target.value; render(); return; }
    if (id === "day-lookup") { state.report.day = e.target.value; render(); return; }
    if (id === "rate-day") { state.rateDay = e.target.value; return; }
    if (id === "second-currency") {
      state.data.second_currency = e.target.value.trim();
      persist(t("currency-updated")).then(render);
      return;
    }
    if (id === "import-file") { stageImport(e.target.files[0]); return; }
    if (e.target.name === "type" && document.getElementById("tx-form")) {
      prepareTxForm(null);
      document.getElementById("new-category-wrap").hidden = true;
      var idField = document.getElementById("tx-id");
      var heading = document.querySelector("#tx-form").parentElement.querySelector("h2");
      if (heading && idField && !idField.value) heading.textContent = e.target.value === "income" ? t("add-in") : t("add-out");
      return;
    }
    if (id === "tx-category") {
      document.getElementById("new-category-wrap").hidden = e.target.value !== "__new__";
      return;
    }
    if (id === "goal-category") {
      document.getElementById("new-goal-category-wrap").hidden = e.target.value !== "__new__";
      return;
    }
    if (e.target.name === "goal_type") {
      var smart = document.querySelector('input[name="goal_type"]:checked').value === "smart";
      document.getElementById("smart-fields").hidden = !smart;
    }
  });

  document.body.addEventListener("input", function (e) {
    if (e.target.id === "tx-search") {
      state.txFilter.query = e.target.value;
      refreshListOnly();
    }
    if (e.target.id === "goal-search") {
      state.goalFilter.query = e.target.value;
      var box = document.getElementById("goal-list");
      if (box) box.innerHTML = goalListHtml("search");
    }
    if (e.target.id === "language-search") {
      state.languageQuery = e.target.value;
      var langBox = document.getElementById("language-results");
      if (langBox) langBox.innerHTML = languageResultHtml(state.languageQuery, languageSearchSelected());
    }
    if (e.target.id === "currency-search") {
      state.currencyQuery = e.target.value;
      var results = document.getElementById("currency-results");
      if (results) results.innerHTML = currencyResultHtml(state.currencyQuery, currencySearchSelected(), currencySearchAction());
    }
  });

  document.body.addEventListener("submit", function (e) {
    if (busy) { e.preventDefault(); return; }
    if (e.target.id === "today-form") {
      e.preventDefault();
      saveToday(e.target);
      return;
    }
    if (e.target.id === "tx-form") {
      e.preventDefault();
      var read = readTx(e.target);
      if (read.error) { showError(read.error); return; }
      if (!applyTx(read.value)) { showError(t("nothing-matches")); return; }
      afterChange(read.value.id ? t("record-updated") : t("record-saved"));
    }
    if (e.target.id === "goal-form") {
      e.preventDefault();
      var goal = readGoal(e.target);
      if (goal.error) { showError(goal.error); return; }
      if (!applyGoal(goal.value)) { showError(t("nothing-matches")); return; }
      afterChange(t("goal-saved"));
    }
    if (e.target.id === "add-saved-form") {
      e.preventDefault();
      var amount = L.parseAmount(document.getElementById("saved-amount").value, false);
      if (!amount.ok) { showError(t("bad-amount")); return; }
      var goalItem = findById(state.data.goals, state.pending.id);
      if (!goalItem) { showError(t("nothing-matches")); return; }
      goalItem.current_amount = L.roundMoney(goalItem.current_amount + amount.value);
      afterChange(t("goal-saved"));
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  window.addEventListener("hashchange", function () {
    if (state.setup || state.locked || state.entry) return;
    closeModal();
    state.page = pageFromHash();
    render();
    window.scrollTo(0, 0);
  });

  function openTx(existing, preset) {
    if (existing === undefined) return;
    openModal(txForm(existing, preset));
    prepareTxForm(existing);
  }

  function openGoal(existing) {
    openModal(goalForm(existing));
    prepareGoalForm(existing);
  }

  function pots(rows) {
    var second = (state.data.second_currency || "").trim();
    var main = [];
    var other = [];
    (rows || []).forEach(function (row) {
      if (second && row.currency_code) other.push(row);
      else main.push(row);
    });
    return { main: main, other: other };
  }

  function otherPotLine(rows) {
    if (!rows.length) return "";
    var code = state.data.second_currency;
    var total = rows.reduce(function (sum, row) {
      return row.type === "income" ? sum + Number(row.amount) : sum;
    }, 0);
    if (!total) return "";
    return '<p class="note note-plain">' + esc(t("also-in", { code: code })) + ": " + esc(money(L.roundMoney(total), code)) + "</p>";
  }

  function isEmergency(goal) {
    if (!goal) return false;
    if (goal.goal_kind === "emergency") return true;
    return /emergency|dharura|urgence|emergencia|emergência|طوارئ/i.test(goal.name || "");
  }

  function weekInsightText() {
    var week = L.isoWeekKey(L.todayISO());
    var rows = pots(state.data.transactions).main.filter(function (row) {
      return L.isoWeekKey(row.date) === week;
    });
    var summary = L.summarize(rows);
    var top = L.sortedEntries(summary.expense_categories)[0];
    if (top) return t("insight-spend", { category: top[0] });
    if (summary.income_total > 0) return t("insight-income", { amount: money(summary.income_total) });
    return t("insight-quiet");
  }

  function hardWeekTarget() {
    var today = L.todayISO();
    var incomes = pots(state.data.transactions).main.filter(function (row) {
      if (row.type !== "income") return false;
      var gap = L.daysBetween(row.date, today);
      return gap >= 0 && gap <= 30;
    });
    if (incomes.length < 2) return null;
    var total = incomes.reduce(function (sum, row) { return sum + Number(row.amount); }, 0);
    var dates = incomes.map(function (row) { return row.date; }).sort();
    var span = Math.max(7, L.daysBetween(dates[0], dates[dates.length - 1]) + 1);
    return L.roundMoney((total / span) * 7);
  }

  function emergencyOffer() {
    if (state.data.goals.some(isEmergency)) return "";
    var amount = hardWeekTarget();
    if (!amount) return "";
    return '<section class="welcome"><h2>' + esc(t("offer-title")) + "</h2><p>" +
      esc(t("offer-body", { amount: money(amount) })) + "</p>" +
      '<button type="button" class="btn btn-primary" data-action="set-cushion">' + esc(t("set-cushion")) + "</button></section>";
  }

  function homeSpeech() {
    if (state.hideAmounts) return t("hidden-speech");
    var view = homePeriod();
    var summary = L.summarize(pots(view.rows).main);
    var net = L.netOf(summary);
    return t("speech-home", {
      inn: plainMoney(net.income),
      out: plainMoney(net.expense),
      kept: plainMoney(net.net)
    }) + " " + weekInsightText();
  }

  function speak(text) {
    if (!window.speechSynthesis) { toast(t("no-speech")); return; }
    if (window.BT.speech) window.BT.speech.say(text, window.BT.i18n.current());
  }

  function dictate(inputId) {
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { toast(t("no-mic")); return; }
    var rec = new Rec();
    rec.lang = window.BT.speech ? window.BT.speech.tag(window.BT.i18n.current()) : window.BT.i18n.current();
    rec.onresult = function (event) {
      var heard = event.results[0][0].transcript;
      var input = document.getElementById(inputId);
      if (input) input.value = heard;
    };
    rec.start();
  }

  function pdfButton() {
    return '<div class="row-actions no-print"><button type="button" class="btn btn-primary" data-action="download-pdf">' + esc(t("download-pdf")) + "</button></div>";
  }

  function selectedDay() {
    var rows = pots(state.data.transactions).main;
    var summary = L.buildPeriodSummary(rows, function (row) { return row.date; });
    var days = Object.keys(summary).sort().reverse();
    if (state.report.day && /^\d{4}-\d{2}-\d{2}$/.test(state.report.day)) return state.report.day;
    return days[0] || L.todayISO();
  }

  function goalStatementList() {
    if (state.page !== "goal-search") return state.data.goals.slice();
    var f = state.goalFilter;
    var query = f.query.trim().toLowerCase();
    return state.data.goals.filter(function (goal) {
      if (f.category && goal.goal_category !== f.category) return false;
      if (!query) return true;
      return (goal.name + " " + goal.goal_category).toLowerCase().indexOf(query) !== -1;
    });
  }

  function statementModel() {
    var page = state.page;
    if (page === "progress" || page === "goals" || page === "goal-search") {
      return { kind: "goals", title: pageTitle(page), period: "", goals: goalStatementList() };
    }
    if (page === "day") {
      var picked = selectedDay();
      return {
        kind: "money",
        title: pageTitle("day"),
        period: L.formatDate(picked),
        rows: pots(state.data.transactions).main.filter(function (row) { return row.date === picked; }),
        lines: true
      };
    }
    if (page === "category") {
      return { kind: "money", title: pageTitle("category"), period: "", rows: pots(state.data.transactions).main, lines: false };
    }
    if (page === "days") {
      return {
        kind: "money",
        title: pageTitle("days"),
        period: "",
        rows: pots(state.data.transactions).main,
        groupBy: function (row) { return row.date; },
        groupLabel: function (key) { return L.formatDate(key); },
        groupTitle: t("by-day"),
        lines: true
      };
    }
    if (page === "month") {
      return {
        kind: "money",
        title: pageTitle("month"),
        period: "",
        rows: pots(state.data.transactions).main,
        groupBy: function (row) { return row.date.slice(0, 7); },
        groupLabel: function (key) { return L.formatMonth(key); },
        groupTitle: t("by-month"),
        lines: true
      };
    }
    if (page === "tx-search") {
      return { kind: "money", title: pageTitle("tx-search"), period: "", rows: filteredTx(), lines: true };
    }
    if (page === "tx") {
      return { kind: "money", title: pageTitle("tx"), period: "", rows: state.data.transactions.slice(), lines: true };
    }
    var view = homePeriod();
    return { kind: "money", title: view.label, period: "", rows: pots(view.rows).main, lines: true };
  }

  function pdfKpi(label, value, cls) {
    return "<div><span>" + esc(label) + "</span><strong" + (cls ? ' class="' + cls + '"' : "") + ">" + esc(value) + "</strong></div>";
  }

  function widthClass(part, total) {
    var pct = total > 0 ? (part / total) * 100 : 0;
    if (!isFinite(pct) || pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    return "st-w-" + (Math.round(pct / 5) * 5);
  }

  function pdfTrack(part, total, kind) {
    return '<span class="st-track"><i class="is-' + kind + " " + widthClass(part, total) + '"></i></span>';
  }

  function pdfMix(income, expense) {
    var total = income + expense;
    if (!(total > 0)) return "";
    return '<div class="st-mix" aria-hidden="true"><i class="is-in ' + widthClass(income, total) +
      '"></i><i class="is-out ' + widthClass(expense, total) + '"></i></div>';
  }

  function pdfCatTable(title, categories, total, kind) {
    var entries = L.sortedEntries(categories || {});
    if (!entries.length) return "";
    var body = entries.map(function (pair) {
      var share = total > 0 ? (pair[1] / total) * 100 : 0;
      return "<tr><td>" + esc(pair[0]) + pdfTrack(pair[1], total, kind) + '</td><td class="num">' +
        esc(L.formatPercent(share)) + '</td><td class="num">' + esc(plainMoney(pair[1])) + "</td></tr>";
    }).join("");
    var amount = kind === "income" ? t("money-in") : t("money-out");
    return "<section><h2>" + esc(title) + '</h2><table class="st-table"><thead><tr><th>' + esc(t("category")) +
      '</th><th class="num">%</th><th class="num">' + esc(amount) + "</th></tr></thead><tbody>" + body + "</tbody></table></section>";
  }

  function pdfLineTable(rows) {
    var sorted = rows.slice().sort(sortTx);
    if (!sorted.length) return '<p class="st-note">' + esc(t("no-records")) + "</p>";
    var body = sorted.map(function (row) {
      var code = row.currency_code || "";
      var inn = row.type === "income" ? plainMoney(row.amount, code || undefined) : "";
      var out = row.type === "expense" ? plainMoney(row.amount, code || undefined) : "";
      var about = esc(row.category);
      if (row.description) about += '<p class="st-note">' + esc(row.description) + "</p>";
      if (code) about += '<p class="st-note">' + esc(code) + "</p>";
      return "<tr><td>" + esc(L.formatDate(row.date)) + "</td><td>" + about + '</td><td class="num is-in">' +
        esc(inn) + '</td><td class="num is-out">' + esc(out) + "</td></tr>";
    }).join("");
    var main = sorted.filter(function (row) { return !row.currency_code; });
    var net = L.netOf(L.summarize(main));
    var kept = net.net < 0 ? "num is-out" : "num";
    return '<table class="st-table st-lines"><thead><tr><th>' + esc(t("date")) + "</th><th>" + esc(t("category")) +
      '</th><th class="num">' + esc(t("money-in")) + '</th><th class="num">' + esc(t("money-out")) +
      '</th></tr></thead><tbody>' + body + '</tbody><tfoot><tr><td colspan="2">' + esc(t("you-kept")) +
      '</td><td class="' + kept + '" colspan="2">' + esc(plainMoney(net.net)) + "</td></tr></tfoot></table>";
  }

  function pdfPeriodTable(rows, groupBy, groupLabel, title) {
    var grouped = L.buildPeriodSummary(rows, groupBy);
    var keys = Object.keys(grouped).sort().reverse();
    if (keys.length < 2) return "";
    var body = keys.map(function (key) {
      var net = L.netOf(grouped[key]);
      var kept = net.net < 0 ? "num is-out" : "num";
      return "<tr><td>" + esc(groupLabel(key)) + '</td><td class="num is-in">' + esc(plainMoney(net.income)) +
        '</td><td class="num is-out">' + esc(plainMoney(net.expense)) + '</td><td class="' + kept + '">' +
        esc(plainMoney(net.net)) + "</td></tr>";
    }).join("");
    var all = L.netOf(L.summarize(rows));
    return "<section><h2>" + esc(title) + '</h2><table class="st-table"><thead><tr><th>' + esc(t("date")) +
      '</th><th class="num">' + esc(t("money-in")) + '</th><th class="num">' + esc(t("money-out")) +
      '</th><th class="num">' + esc(t("you-kept")) + "</th></tr></thead><tbody>" + body +
      '</tbody><tfoot><tr><td></td><td class="num">' + esc(plainMoney(all.income)) + '</td><td class="num">' +
      esc(plainMoney(all.expense)) + '</td><td class="num">' + esc(plainMoney(all.net)) + "</td></tr></tfoot></table></section>";
  }

  function pdfGroupedLines(rows, groupBy, groupLabel) {
    var grouped = L.buildPeriodSummary(rows, groupBy);
    return Object.keys(grouped).sort().reverse().map(function (key) {
      var list = rows.filter(function (row) { return groupBy(row) === key; });
      return "<section><h2>" + esc(groupLabel(key)) + "</h2>" + pdfLineTable(list) + "</section>";
    }).join("");
  }

  function statementShell(model, body) {
    var currency = String(state.data.currency || "").trim();
    return '<article class="statement"><header class="st-head"><div class="st-id"><img class="st-logo" src="icons/icon.svg" alt=""><div><p class="st-brand">Budget Tracker</p><h1>' +
      esc(model.title) + "</h1>" + (model.period ? '<p class="st-period">' + esc(model.period) + "</p>" : "") +
      '</div></div><img class="st-sun" src="img/sun.png" alt=""><div class="st-meta">' +
      (currency ? "<strong>" + esc(currency) + "</strong>" : "") + "<p>" +
      esc(t("pdf-prepared", { date: L.formatDate(L.todayISO()) })) + "</p></div></header>" + body +
      '<footer class="st-foot"><p>' + esc(t("trust")) + '</p></footer><p class="st-save no-print"><button type="button" class="btn btn-secondary" data-action="close-pdf">' +
      esc(t("cancel")) + "</button></p></article>";
  }

  function moneyStatementHtml(model) {
    var rows = model.rows || [];
    var main = rows.filter(function (row) { return !row.currency_code; });
    var summary = L.summarize(main);
    var net = L.netOf(summary);
    var body = '<section class="st-kpis">' +
      pdfKpi(t("money-in"), plainMoney(net.income), "is-in") +
      pdfKpi(t("money-out"), plainMoney(net.expense), "is-out") +
      pdfKpi(t("you-kept"), plainMoney(net.net), net.net < 0 ? "is-out" : "") +
      "</section>" + pdfMix(net.income, net.expense);
    if (!rows.length) {
      body += '<p class="st-note">' + esc(t("no-records")) + "</p>";
    } else {
      if (model.groupBy) body += pdfPeriodTable(main, model.groupBy, model.groupLabel, model.groupTitle);
      body += pdfCatTable(t("money-in"), summary.income_categories, summary.income_total, "income");
      body += pdfCatTable(t("where-goes"), summary.expense_categories, summary.expense_total, "expense");
      if (model.lines !== false) {
        body += model.groupBy
          ? pdfGroupedLines(rows, model.groupBy, model.groupLabel)
          : "<section><h2>" + esc(t("latest")) + "</h2>" + pdfLineTable(rows) + "</section>";
      }
    }
    return statementShell(model, body);
  }

  function goalStatementHtml(model) {
    var goals = model.goals || [];
    var saved = 0;
    var target = 0;
    goals.forEach(function (goal) {
      saved += Number(goal.current_amount) || 0;
      target += Number(goal.target_amount) || 0;
    });
    saved = L.roundMoney(saved);
    target = L.roundMoney(target);
    var share = target > 0 ? (saved / target) * 100 : 0;
    var table = goals.length
      ? '<table class="st-table"><thead><tr><th>' + esc(t("goal-name")) + '</th><th class="num">%</th><th class="num">' +
        esc(t("already-have")) + '</th><th class="num">' + esc(t("target-amount")) + "</th><th>" + esc(t("date")) +
        "</th></tr></thead><tbody>" + goals.map(function (goal) {
          var pace = L.goalPace(goal, L.todayISO());
          var note = "";
          if (isEmergency(goal)) note = '<p class="st-note">' + esc(t("days-line", { n: L.daysCovered(goal) })) + "</p>";
          else if (goal.specific_detail) note = '<p class="st-note">' + esc(goal.specific_detail) + "</p>";
          return "<tr><td>" + esc(goal.name) + note + pdfTrack(pace.percent, 100, "in") + '</td><td class="num">' +
            esc(L.formatPercent(pace.percent)) + '</td><td class="num">' + esc(plainMoney(goal.current_amount)) +
            '</td><td class="num">' + esc(plainMoney(goal.target_amount)) + "</td><td>" + esc(L.formatDate(goal.deadline)) + "</td></tr>";
        }).join("") + "</tbody></table>"
      : '<p class="st-note">' + esc(t("no-records")) + "</p>";
    var body = '<section class="st-kpis">' +
      pdfKpi(t("already-have"), plainMoney(saved), "is-in") +
      pdfKpi(t("target-amount"), plainMoney(target), "") +
      pdfKpi("%", L.formatPercent(share), "") +
      "</section>" + (goals.length ? pdfMix(saved, Math.max(0, L.roundMoney(target - saved))) : "") + table;
    return statementShell(model, body);
  }

  var closeStatement = function () {};

  function downloadStatement() {
    if (!state.data) return;
    var model = statementModel();
    var html = model.kind === "goals" ? goalStatementHtml(model) : moneyStatementHtml(model);
    var sheet = document.getElementById("print-sheet");
    var previous = document.title;
    sheet.hidden = false;
    sheet.innerHTML = html;
    document.body.classList.add("is-printing");
    document.title = "Budget Tracker - " + model.title;
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      window.removeEventListener("afterprint", finish);
      document.title = previous;
      document.body.classList.remove("is-printing");
      sheet.hidden = true;
    }
    closeStatement = finish;
    window.addEventListener("afterprint", finish);
    var marks = sheet.querySelectorAll(".st-logo, .st-sun");
    var waiting = 0;
    var opened = false;
    function openPrint() {
      if (opened) return;
      opened = true;
      try { window.print(); } catch (e) { finish(); }
    }
    Array.prototype.forEach.call(marks, function (img) {
      if (img.complete) return;
      waiting += 1;
      img.addEventListener("load", function () { waiting -= 1; if (!waiting) openPrint(); });
      img.addEventListener("error", function () { waiting -= 1; if (!waiting) openPrint(); });
    });
    if (!waiting) openPrint();
    else setTimeout(openPrint, 700);
  }

  function blankDraft() {
    return {
      incomeAmount: "", incomeCategory: "", incomeNote: "", incomeDate: L.todayISO(), skipIn: false,
      expenseAmount: "", expenseCategory: "", expenseNote: "", skipOut: false,
      goalTarget: "", goalCurrent: "", skipGoal: false,
      wantLock: false, pin1: "", pin2: ""
    };
  }

  function beginSetup() {
    closeModal();
    state.setup = true;
    state.setupStep = 0;
    state.setupDraft = blankDraft();
    state.page = "menu";
    render();
  }

  function rememberPrefs(data) {
    data.language = (state.data && state.data.language) || localStorage.getItem("bt-lang") || "en";
    data.text_size = (state.data && state.data.text_size) || localStorage.getItem("bt-text") || "normal";
    data.currency = (state.data && state.data.currency) || "";
    data.second_currency = (state.data && state.data.second_currency) || "";
  }

  function chooseLanguage(code) {
    if (!state.data) state.data = store.emptyData();
    state.data.language = code;
    localStorage.setItem("bt-lang", code);
    if (state.setup || state.entry) {
      render();
      if (state.entry) persist("");
      return;
    }
    persist("").then(render);
  }

  function chooseSize(size) {
    state.data.text_size = size;
    localStorage.setItem("bt-text", size);
    if (!state.setup) persist("").then(render);
    else render();
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function captureSetup() {
    var draft = state.setupDraft || blankDraft();
    if (state.setupStep === 1) {
      draft.incomeAmount = fieldValue("setup-in-amount");
      draft.incomeCategory = fieldValue("setup-in-category");
      draft.incomeNote = fieldValue("setup-in-note");
      draft.incomeDate = fieldValue("setup-in-date") || L.todayISO();
    }
    if (state.setupStep === 2) {
      draft.expenseAmount = fieldValue("setup-out-amount");
      draft.expenseCategory = fieldValue("setup-out-category");
      draft.expenseNote = fieldValue("setup-out-note");
    }
    if (state.setupStep === 3) {
      draft.goalTarget = fieldValue("setup-goal-target");
      draft.goalCurrent = fieldValue("setup-goal-current");
      draft.wantLock = !!(document.getElementById("setup-lock") && document.getElementById("setup-lock").checked);
      draft.pin1 = fieldValue("setup-pin");
      draft.pin2 = fieldValue("setup-pin2");
    }
    state.setupDraft = draft;
    return draft;
  }

  function setupSkip(which) {
    captureSetup();
    if (which === "in") state.setupDraft.skipIn = true;
    if (which === "out") state.setupDraft.skipOut = true;
    if (which === "goal") state.setupDraft.skipGoal = true;
    state.setupStep += 1;
    if (state.setupStep > 3) finishSetup();
    else render();
  }

  function setupNext() {
    var draft = captureSetup();
    var error = "";
    if (state.setupStep === 1 && !draft.skipIn) {
      if (!draft.incomeAmount) error = t("need-one");
      else if (!L.parseAmount(draft.incomeAmount, false).ok) error = t("bad-amount");
      else if (!draft.incomeCategory) error = t("choose-category");
    }
    if (state.setupStep === 2 && draft.expenseAmount) {
      if (!L.parseAmount(draft.expenseAmount, false).ok) error = t("bad-amount");
      else if (!draft.expenseCategory) error = t("choose-category");
    }
    if (state.setupStep === 3 && !draft.skipGoal && draft.goalTarget) {
      if (!L.parseAmount(draft.goalTarget, false).ok) error = t("bad-amount");
      if (draft.goalCurrent && !L.parseAmount(draft.goalCurrent, true).ok) error = t("bad-amount");
    }
    if (state.setupStep === 3 && draft.wantLock) {
      if (!/^\d{4}$/.test(draft.pin1) || !/^\d{4}$/.test(draft.pin2)) error = t("pin-short");
      else if (draft.pin1 !== draft.pin2) error = t("pin-mismatch");
    }
    if (error) {
      var box = document.getElementById("setup-error");
      if (box) box.textContent = error;
      return;
    }
    if (state.setupStep === 1) draft.skipIn = false;
    state.setupStep += 1;
    if (state.setupStep > 3) finishSetup();
    else render();
  }

  function addEmergencyGoal(target, current) {
    if (current > target) current = target;
    var deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 12);
    var iso = deadline.getFullYear() + "-" + String(deadline.getMonth() + 1).padStart(2, "0") + "-" + String(deadline.getDate()).padStart(2, "0");
    rememberCategory(state.data.goal_categories, "Emergency");
    state.data.goals.push({
      id: state.data.next_goal_id,
      name: t("cushion-name"),
      goal_category: "Emergency",
      goal_type: "normal",
      target_amount: L.roundMoney(target),
      current_amount: L.roundMoney(current),
      deadline: iso,
      specific_detail: "",
      monthly_contribution: 0,
      relevance_reason: "",
      goal_kind: "emergency"
    });
    state.data.next_goal_id += 1;
  }

  async function finishSetup() {
    var draft = state.setupDraft || blankDraft();
    var fresh = store.emptyData();
    rememberPrefs(fresh);
    fresh.setup_complete = true;
    fresh.showing_example = false;
    fresh.last_seen_month = L.currentMonth();
    state.data = fresh;
    if (!draft.skipIn && draft.incomeAmount) {
      var income = L.parseAmount(draft.incomeAmount, false);
      if (income.ok) {
        applyTx({
          type: "income",
          category: draft.incomeCategory || fresh.income_categories[0],
          amount: income.value,
          date: draft.incomeDate || L.todayISO(),
          description: draft.incomeNote,
          currency_code: ""
        });
      }
    }
    if (!draft.skipOut && draft.expenseAmount) {
      var expense = L.parseAmount(draft.expenseAmount, false);
      if (expense.ok) {
        applyTx({
          type: "expense",
          category: draft.expenseCategory || fresh.expense_categories[0],
          amount: expense.value,
          date: L.todayISO(),
          description: draft.expenseNote,
          currency_code: ""
        });
      }
    }
    if (!draft.skipGoal && draft.goalTarget) {
      var target = L.parseAmount(draft.goalTarget, false);
      var current = draft.goalCurrent ? L.parseAmount(draft.goalCurrent, true) : { ok: true, value: 0 };
      if (target.ok && current.ok) addEmergencyGoal(target.value, current.value);
    }
    if (draft.wantLock && /^\d{4}$/.test(draft.pin1) && draft.pin1 === draft.pin2) {
      await window.BT.vault.seal(state.data, draft.pin1);
    }
    if (location.hash !== "#menu") location.hash = "menu";
    state.setup = false;
    state.page = "menu";
    await persist(t("record-saved"));
    render();
    openInsight();
  }

  function openInsight() {
    openModal("<h2>" + esc(t("today")) + '</h2><p class="insight">' + esc(weekInsightText()) + "</p>" +
      '<div class="form-actions"><button type="button" class="btn btn-secondary" data-action="hear">' + esc(t("hear")) +
      '</button><button type="button" class="btn btn-primary" data-action="close-modal">' + esc(t("done")) + "</button></div>");
  }

  async function createCushion() {
    var amount = hardWeekTarget();
    if (!amount) return;
    addEmergencyGoal(amount, 0);
    await afterChange(t("goal-saved"));
  }

  function nameField(id, type, value) {
    var source = state.setup ? store.emptyData() : state.data;
    var list = type === "income" ? source.income_categories : source.expense_categories;
    var chosen = value || list[0] || "";
    return '<label class="field">' + esc(t("category")) + '<input id="' + id + '" list="' + id + '-list" value="' + esc(chosen) + '"></label>' +
      '<datalist id="' + id + '-list">' + list.map(function (name) {
        return '<option value="' + esc(name) + '"></option>';
      }).join("") + "</datalist>" +
      '<button type="button" class="btn btn-secondary" data-action="speak-name" data-target="' + id + '">' + esc(t("speak")) + "</button>";
  }

  function setupNav(step) {
    var prev = step > 0
      ? '<button type="button" class="btn btn-secondary" data-action="setup-back">' + esc(t("page-back")) + "</button>"
      : "<span></span>";
    return '<div class="step-actions">' + prev +
      '<button type="button" class="btn btn-primary" data-action="setup-next">' + esc(t("page-next")) + "</button></div>";
  }

  function renderSetup() {
    if (!state.setupDraft) state.setupDraft = blankDraft();
    var step = state.setupStep;
    var draft = state.setupDraft;
    var progress = '<p class="eyebrow">' + (step + 1) + " / 4</p>";
    if (step === 0) {
      var size = state.data.text_size || "normal";
      var currency = canonicalCurrency(state.data.currency || "");
      return '<section class="setup-card">' + progress + "<h1>" + esc(t("setup-hello")) + '</h1><p class="lede">' + esc(t("setup-lead")) +
        '</p><p class="trust">' + esc(t("trust")) + "</p>" +
        "<h2>" + esc(t("choose-language")) + "</h2>" + languageSearchBox(state.data.language || "en") +
        "<h2>" + esc(t("choose-size")) + '</h2><div class="chip-row">' +
        chip("set-size", "normal", t("size-normal"), size) +
        chip("set-size", "large", t("size-large"), size) +
        chip("set-size", "larger", t("size-larger"), size) + "</div>" +
        "<h2>" + esc(t("choose-currency")) + "</h2>" + currencySearchBox("set-currency", currency) +
        '<div class="form-actions"><button type="button" class="btn btn-secondary" data-action="look-example">' + esc(t("look-example")) + "</button></div>" +
        setupNav(step) + "</section>";
    }
    if (step === 1) {
      return '<section class="setup-card">' + progress + "<h1>" + esc(t("q-in")) + "</h1><p>" + esc(t("q-in-help")) + "</p>" +
        '<label class="field">' + esc(t("amount")) + '<input id="setup-in-amount" inputmode="decimal" value="' + esc(draft.incomeAmount) + '"></label>' +
        nameField("setup-in-category", "income", draft.incomeCategory) +
        '<label class="field">' + esc(t("note-optional")) + '<input id="setup-in-note" value="' + esc(draft.incomeNote) + '"></label>' +
        '<label class="field">' + esc(t("date")) + '<input id="setup-in-date" type="date" value="' + esc(draft.incomeDate || L.todayISO()) + '"></label>' +
        '<p id="setup-error" class="form-error" role="alert"></p><div class="form-actions">' +
        '<button type="button" class="btn btn-secondary" data-action="setup-skip" data-which="in">' + esc(t("nothing-in")) + "</button></div>" +
        setupNav(step) + "</section>";
    }
    if (step === 2) {
      return '<section class="setup-card">' + progress + "<h1>" + esc(t("q-out")) + "</h1><p>" + esc(t("q-out-help")) + "</p>" +
        '<label class="field">' + esc(t("amount")) + '<input id="setup-out-amount" inputmode="decimal" value="' + esc(draft.expenseAmount) + '"></label>' +
        nameField("setup-out-category", "expense", draft.expenseCategory) +
        '<label class="field">' + esc(t("note-optional")) + '<input id="setup-out-note" value="' + esc(draft.expenseNote) + '"></label>' +
        '<p id="setup-error" class="form-error" role="alert"></p><div class="form-actions">' +
        '<button type="button" class="btn btn-secondary" data-action="setup-skip" data-which="out">' + esc(t("nothing-out")) + "</button></div>" +
        setupNav(step) + "</section>";
    }
    var incomeParsed = L.parseAmount(draft.incomeAmount, false);
    var suggested = "";
    if (!draft.skipIn && incomeParsed.ok && !draft.goalTarget) {
      draft.goalTarget = String(L.roundMoney(incomeParsed.value / 4));
      suggested = '<p class="note note-plain">' + esc(t("suggest-line")) + "</p>";
    }
    return '<section class="setup-card">' + progress + "<h1>" + esc(t("q-aside")) + "</h1><p>" + esc(t("q-aside-help")) + "</p>" + suggested +
      '<label class="field">' + esc(t("target-amount")) + '<input id="setup-goal-target" inputmode="decimal" value="' + esc(draft.goalTarget) + '"></label>' +
      '<label class="field">' + esc(t("already-have")) + '<input id="setup-goal-current" inputmode="decimal" value="' + esc(draft.goalCurrent) + '"></label>' +
      "<p>" + esc(t("change-later")) + "</p>" +
      '<label class="choice"><input id="setup-lock" type="checkbox"' + (draft.wantLock ? " checked" : "") + "> " + esc(t("add-lock")) + "</label>" +
      "<p>" + esc(t("lock-optional")) + "</p>" +
      '<label class="field">' + esc(t("pin-4")) + '<input id="setup-pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" value="' + esc(draft.pin1) + '"></label>' +
      '<label class="field">' + esc(t("pin-again")) + '<input id="setup-pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off" value="' + esc(draft.pin2) + '"></label>' +
      '<p id="setup-error" class="form-error" role="alert"></p><div class="form-actions">' +
      '<button type="button" class="btn btn-secondary" data-action="setup-skip" data-which="goal">' + esc(t("not-now")) + "</button></div>" +
      setupNav(step) + "</section>";
  }

  function pinPad() {
    var digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "clear"];
    return '<div class="pin-pad">' + digits.map(function (digit) {
      if (!digit) return "<span></span>";
      if (digit === "clear") return '<button type="button" class="btn btn-secondary" data-action="pin-clear">' + esc(t("clear")) + "</button>";
      return '<button type="button" class="btn btn-secondary" data-action="pin-digit" data-value="' + digit + '">' + digit + "</button>";
    }).join("") + "</div>";
  }

  function renderLock() {
    var dots = state.pinEntry ? "••••".slice(0, state.pinEntry.length) : "·";
    var wait = window.BT.vault.lockedOut();
    var error = state.lockError || (wait ? t("lock-wait", { n: wait }) : "");
    return '<section class="entry-stage"><p class="trust">' + esc(t("trust")) + "</p><h1>" + esc(t("lock-title")) +
      '</h1><p class="entry-help">' + esc(t("lock-help")) + "</p><p>" + esc(t("lock-sealed")) + '</p><p class="pin-dots" aria-live="polite">' + esc(dots) + "</p>" +
      (error ? '<p class="form-error">' + esc(error) + "</p>" : "") + pinPad() + "</section>";
  }

  function pinError(result) {
    if (result && result.wait) return t("lock-wait", { n: result.wait });
    return t("wrong-pin");
  }

  async function unlockWith(pin) {
    var vault = window.BT.vault;
    if (vault.lockedOut()) return { ok: false, wait: vault.lockedOut() };
    if (vault.isSealed()) {
      var opened = await vault.open(pin);
      if (!opened.ok) return opened;
      var held = store.takeHeld();
      state.data = store.normalize(held || opened.data);
      if (held) await vault.seal(state.data, pin);
      return { ok: true };
    }
    var legacy = await vault.openLegacy(pin);
    if (!legacy.ok) return legacy;
    state.data = store.normalize(store.takeHeld() || store.emptyData());
    await vault.seal(state.data, pin);
    return { ok: true };
  }

  async function pressDigit(digit) {
    if (state.pending && (state.pending.kind === "set-pin" || state.pending.kind === "remove-pin")) {
      await pressSettingsPin(digit);
      return;
    }
    if (window.BT.vault.lockedOut()) {
      state.pinEntry = "";
      state.lockError = t("lock-wait", { n: window.BT.vault.lockedOut() });
      render();
      return;
    }
    if (state.pinEntry.length >= 4) return;
    state.pinEntry += digit;
    state.lockError = "";
    if (state.pinEntry.length < 4) { render(); return; }
    var pin = state.pinEntry;
    state.pinEntry = "";
    var opened = await unlockWith(pin);
    if (opened.ok && state.data) {
      state.locked = false;
      state.lockError = "";
      await beginEntry();
      return;
    }
    state.lockError = pinError(opened);
    render();
  }

  function openPinSetup(removing) {
    var needCurrent = !removing && window.BT.vault.hasLock();
    state.pending = { kind: removing ? "remove-pin" : "set-pin", first: "", needCurrent: needCurrent };
    state.pinEntry = "";
    openModal("<h2>" + esc(removing ? t("remove-pin") : (needCurrent ? t("change-pin") : t("set-pin"))) + "</h2><p>" +
      esc(removing || needCurrent ? t("lock-help") : t("pin-4")) + '</p><p id="pin-dots" class="pin-dots">·</p><p id="form-error" class="form-error" role="alert"></p>' + pinPad());
  }

  async function pressSettingsPin(digit) {
    var pending = state.pending;
    if (!pending || state.pinEntry.length >= 4) return;
    state.pinEntry += digit;
    var dots = document.getElementById("pin-dots");
    if (dots) dots.textContent = "••••".slice(0, state.pinEntry.length);
    if (state.pinEntry.length < 4) return;
    var pin = state.pinEntry;
    if (pending.needCurrent) {
      state.pinEntry = "";
      var current = window.BT.vault.isSealed()
        ? await window.BT.vault.open(pin)
        : await window.BT.vault.openLegacy(pin);
      if (!current.ok) {
        showError(pinError(current));
        if (dots) dots.textContent = "·";
        return;
      }
      pending.needCurrent = false;
      if (dots) dots.textContent = "·";
      var heading = document.querySelector("#modal-root h2");
      var help = document.querySelector("#modal-root p");
      if (heading) heading.textContent = t("pin-4");
      if (help) help.textContent = t("pin-4");
      return;
    }
    if (pending.kind === "remove-pin") {
      state.pinEntry = "";
      var opened = window.BT.vault.isSealed()
        ? await window.BT.vault.open(pin)
        : await window.BT.vault.openLegacy(pin);
      if (!opened.ok) {
        showError(pinError(opened));
        if (dots) dots.textContent = "·";
        return;
      }
      window.BT.vault.clear();
      closeModal();
      await persist("");
      render();
      return;
    }
    if (!pending.first) {
      pending.first = state.pinEntry;
      state.pinEntry = "";
      if (dots) dots.textContent = "·";
      var title = document.querySelector("#modal-root h2");
      if (title) title.textContent = t("pin-again");
      return;
    }
    if (pending.first !== state.pinEntry) {
      pending.first = "";
      state.pinEntry = "";
      showError(t("pin-mismatch"));
      if (dots) dots.textContent = "·";
      return;
    }
    var chosen = state.pinEntry;
    state.pinEntry = "";
    if (!(await window.BT.vault.seal(state.data, chosen))) {
      showError(t("save-fail"));
      if (dots) dots.textContent = "·";
      return;
    }
    closeModal();
    toast(t("lock-on"));
    render();
  }

  function catOptions(type) {
    return categoriesFor(type, "").map(function (name) {
      return '<option value="' + esc(name) + '">' + esc(name) + "</option>";
    }).join("");
  }

  function openToday() {
    var second = (state.data.second_currency || "").trim();
    var pot = second
      ? '<label class="choice"><input id="today-remit" type="checkbox"> ' + esc(t("pot-other", { code: second })) + "</label>"
      : "";
    openModal("<h2>" + esc(t("today")) + "</h2><p>" + esc(t("today-help")) + "</p><p>" + esc(L.formatDate(L.todayISO())) + "</p>" +
      '<form id="today-form"><label class="field">' + esc(t("came-in")) + '<input id="today-in" inputmode="decimal"></label>' +
      '<label class="field">' + esc(t("category")) + '<select id="today-in-cat">' + catOptions("income") + "</select></label>" + pot +
      '<label class="field">' + esc(t("went-out")) + '<input id="today-out" inputmode="decimal"></label>' +
      '<label class="field">' + esc(t("category")) + '<select id="today-out-cat">' + catOptions("expense") + "</select></label>" +
      '<p id="form-error" class="form-error" role="alert"></p><div class="form-actions"><button class="btn btn-primary" type="submit">' +
      esc(t("save-today")) + '</button><button type="button" class="btn btn-secondary" data-action="close-modal">' + esc(t("cancel")) + "</button></div></form>");
  }

  async function saveToday() {
    var inn = fieldValue("today-in");
    var out = fieldValue("today-out");
    if (!inn && !out) { showError(t("need-one")); return; }
    var today = L.todayISO();
    if (inn) {
      var parsedIn = L.parseAmount(inn, false);
      if (!parsedIn.ok) { showError(t("bad-amount")); return; }
      var remit = document.getElementById("today-remit");
      applyTx({
        type: "income",
        category: fieldValue("today-in-cat") || state.data.income_categories[0],
        amount: parsedIn.value,
        date: today,
        description: "",
        currency_code: remit && remit.checked ? state.data.second_currency : ""
      });
    }
    if (out) {
      var parsedOut = L.parseAmount(out, false);
      if (!parsedOut.ok) { showError(t("bad-amount")); return; }
      applyTx({
        type: "expense",
        category: fieldValue("today-out-cat") || state.data.expense_categories[0],
        amount: parsedOut.value,
        date: today,
        description: "",
        currency_code: ""
      });
    }
    closeModal();
    await persist(t("record-saved"));
    render();
    openInsight();
  }

  async function useExample() {
    var fresh = store.exampleData();
    rememberPrefs(fresh);
    fresh.setup_complete = true;
    fresh.showing_example = true;
    fresh.last_seen_month = L.currentMonth();
    state.data = fresh;
    if (location.hash !== "#menu") location.hash = "menu";
    state.setup = false;
    state.page = "menu";
    await persist(t("example-back"));
    render();
  }

  function keepPrefs() {
    return {
      currency: state.data.currency,
      second_currency: state.data.second_currency,
      language: state.data.language,
      text_size: state.data.text_size
    };
  }

  function askDeleteTx(id) {
    var tx = findById(state.data.transactions, id);
    if (!tx) return;
    confirmBox(t("delete-record"), tx.category + ", " + money(tx.amount, tx.currency_code || state.data.currency) + ", " + L.formatDate(tx.date), t("delete"), { kind: "tx", id: id });
  }

  function askDeleteGoal(id) {
    var goal = findById(state.data.goals, id);
    if (!goal) return;
    confirmBox(t("delete-goal"), goal.name, t("delete"), { kind: "goal", id: id });
  }

  function openAddSaved(id) {
    var goal = findById(state.data.goals, id);
    if (!goal) return;
    state.pending = { kind: "add-saved", id: id };
    openModal("<h2>" + esc(t("i-saved")) + "</h2><p>" + esc(goal.name) + "</p><p>" +
      esc(t("saved-of", { have: money(goal.current_amount), need: money(goal.target_amount) })) + "</p>" +
      '<form id="add-saved-form"><label class="field">' + esc(t("amount")) + '<input id="saved-amount" inputmode="decimal" required></label>' +
      '<p id="form-error" class="form-error" role="alert"></p><div class="form-actions"><button type="submit" class="btn btn-primary">' +
      esc(t("save")) + '</button><button type="button" class="btn btn-secondary" data-action="close-modal">' + esc(t("cancel")) + "</button></div></form>");
  }

  async function runPending() {
    var pending = state.pending;
    if (!pending) return;
    if (pending.kind === "currency") {
      rewriteMainAmounts(pending.factor);
      state.data.currency = pending.to;
      state.data.exchange = pending.exchange;
      var opening = state.entryPending;
      state.entryPending = false;
      if (opening) {
        sessionStorage.setItem("bt-entry", "1");
        state.entry = "";
      }
      await afterChange(t("rate-done", {
        to: pending.to,
        date: L.formatDate(pending.exchange.date),
        one: pending.exchange.one,
        other: pending.exchange.other,
        rate: formatQuote(pending.exchange.rate)
      }));
      if (opening) await afterEntry();
      return;
    }
    if (pending.kind === "tx") {
      state.data.transactions = state.data.transactions.filter(function (row) { return row.id !== pending.id; });
      await afterChange(t("deleted"));
      return;
    }
    if (pending.kind === "goal") {
      state.data.goals = state.data.goals.filter(function (goal) { return goal.id !== pending.id; });
      await afterChange(t("deleted"));
      return;
    }
    if (pending.kind === "erase") {
      var kept = keepPrefs();
      state.data = store.emptyData();
      state.data.currency = kept.currency;
      state.data.second_currency = kept.second_currency;
      state.data.language = kept.language;
      state.data.text_size = kept.text_size;
      state.data.setup_complete = true;
      state.data.last_seen_month = L.currentMonth();
      await afterChange(t("erased"));
      return;
    }
    if (pending.kind === "example") {
      var prefs = keepPrefs();
      state.data = store.exampleData();
      state.data.currency = prefs.currency;
      state.data.second_currency = prefs.second_currency;
      state.data.language = prefs.language;
      state.data.text_size = prefs.text_size;
      state.data.setup_complete = true;
      state.data.showing_example = true;
      state.data.last_seen_month = L.currentMonth();
      await afterChange(t("example-back"));
      return;
    }
    if (pending.kind === "import") {
      state.data = pending.data;
      state.data.setup_complete = true;
      state.data.showing_example = false;
      await afterChange(t("imported"));
    }
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "budget_data.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    toast(t("exported"));
  }

  function stageImport(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast(t("save-fail"));
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = store.normalize(JSON.parse(String(reader.result)));
        confirmBox(t("import"), file.name, t("import"), { kind: "import", data: data });
      } catch (err) {
        toast(t("save-fail"));
      }
    };
    reader.readAsText(file);
  }

  function maybeMonthNotice(data) {
    var current = L.currentMonth();
    var last = data.last_seen_month;
    var notice = null;
    if (last && last !== current) {
      var rows = pots(data.transactions.filter(function (row) { return row.date.slice(0, 7) === last; })).main;
      if (rows.length) notice = { month: last, summary: L.summarize(rows) };
    }
    var changed = last !== current;
    if (changed) data.last_seen_month = current;
    return { changed: changed, notice: notice };
  }

  function showNotice(notice) {
    var net = L.netOf(notice.summary);
    openModal("<h2>" + esc(t("new-month")) + "</h2><p>" + esc(t("month-ended", { month: L.formatMonth(notice.month) })) + "</p>" +
      statRow(notice.summary) + "<p>" + esc(t("kept-sentence", { amount: money(net.net) })) + "</p>" +
      '<div class="form-actions"><button type="button" class="btn btn-primary" data-action="close-modal">' + esc(t("done")) +
      '</button><button type="button" class="btn btn-secondary" data-action="nav" data-page="month">' + esc(t("open-reports")) + "</button></div>");
  }

  function foldText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function currencyByCode(code) {
    code = canonicalCurrency(code);
    var list = window.BT.currencies || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].code === code) return list[i];
    }
    return null;
  }

  function shownCountry(item, query) {
    var q = foldText(query);
    var extras = item.also || [];
    var i;
    if (q) {
      for (i = 0; i < extras.length; i++) {
        if (foldText(extras[i]) === q) return extras[i];
      }
      for (i = 0; i < extras.length; i++) {
        if (foldText(extras[i]).indexOf(q) !== -1 && extras[i].length > 3) return extras[i];
      }
    }
    return item.country;
  }

  function searchCurrencies(query) {
    var q = foldText(query);
    if (!q) return [];
    var hits = [];
    (window.BT.currencies || []).forEach(function (item) {
      var code = foldText(item.code);
      var name = foldText(item.name);
      var country = foldText(item.country);
      var extras = (item.also || []).map(foldText);
      var score = 0;
      var i;
      if (code === q) score = 100;
      else if (code.indexOf(q) === 0) score = 80;
      else if (country === q || extras.indexOf(q) !== -1) score = 70;
      else if (country.indexOf(q) === 0) score = 60;
      else if (name.indexOf(q) === 0) score = 50;
      else if (code.indexOf(q) !== -1 || name.indexOf(q) !== -1 || country.indexOf(q) !== -1) score = 30;
      else {
        for (i = 0; i < extras.length; i++) {
          if (extras[i].indexOf(q) === 0) { score = 60; break; }
          if (extras[i].indexOf(q) !== -1) { score = 30; break; }
        }
      }
      if (score) hits.push({ item: item, score: score });
    });
    hits.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.code < b.item.code ? -1 : 1;
    });
    return hits.slice(0, 12).map(function (row) { return row.item; });
  }

  function currencySearchAction() {
    return state.entry === "money" ? "pick-entry-currency" : "set-currency";
  }

  function currencySearchSelected() {
    if (state.entry === "money") return canonicalCurrency(state.entryCurrency || "");
    return canonicalCurrency((state.data && state.data.currency) || "");
  }

  function currencyCard(item, selected, action, query) {
    var on = item.code === selected;
    return '<button type="button" class="entry-pick' + (on ? " is-on" : "") + '" data-action="' + action + '" data-value="' + esc(item.code) + '" aria-pressed="' + (on ? "true" : "false") + '"><strong>' + esc(shownCountry(item, query)) + "</strong><span>" + esc(item.code) + " · " + esc(item.name) + "</span></button>";
  }

  function currencyResultHtml(query, selected, action) {
    var text = String(query || "").trim();
    if (!text) {
      var current = currencyByCode(selected);
      return current ? currencyCard(current, selected, action, "") : "";
    }
    var hits = searchCurrencies(text);
    if (!hits.length) return '<p class="entry-help">' + esc(t("currency-none")) + "</p>";
    return hits.map(function (item) { return currencyCard(item, selected, action, text); }).join("");
  }

  function languageSearchSelected() {
    return (state.data && state.data.language) || "en";
  }

  function languageCard(item, selected, query) {
    var on = item.code === selected;
    var catalog = window.BT.languages;
    var where = catalog.place(item, query);
    return '<button type="button" class="entry-pick' + (on ? " is-on" : "") + '" data-action="set-language" data-value="' + esc(item.code) + '" aria-pressed="' + (on ? "true" : "false") + '"><strong>' + esc(where) + "</strong><span>" + esc(item.name) + "</span></button>";
  }

  function languageResultHtml(query, selected) {
    var catalog = window.BT.languages;
    var text = String(query || "").trim();
    if (!text) {
      var current = catalog.find(selected) || catalog.find("en");
      return current ? languageCard(current, selected, "") : "";
    }
    var hits = catalog.search(text);
    if (!hits.length) return '<p class="entry-help">' + esc(t("language-none")) + "</p>";
    return hits.map(function (item) { return languageCard(item, selected, text); }).join("");
  }

  function languageSearchBox(selected) {
    return '<label class="field currency-find"><input id="language-search" value="' + esc(state.languageQuery || "") + '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(t("language-find")) + '"></label>' +
      '<div id="language-results" class="currency-results">' + languageResultHtml(state.languageQuery, selected) + "</div>";
  }

  function currencySearchBox(action, selected) {
    return '<label class="field currency-find"><input id="currency-search" value="' + esc(state.currencyQuery || "") + '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(t("currency-find")) + '"></label>' +
      '<div id="currency-results" class="currency-results">' + currencyResultHtml(state.currencyQuery, selected, action) + "</div>";
  }

  function renderEntry() {
    var moneyStep = state.entry === "money";
    var title = moneyStep ? t("entry-money") : t("entry-lang");
    var help = moneyStep ? t("entry-money-help") : t("entry-lang-help");
    var body;
    if (!moneyStep) {
      body = languageSearchBox(languageSearchSelected());
    } else {
      body = currencySearchBox("pick-entry-currency", canonicalCurrency(state.entryCurrency || ""));
    }
    var steps = '<p class="entry-steps" aria-hidden="true"><i class="' + (moneyStep ? "" : "is-on") + '"></i><i class="' + (moneyStep ? "is-on" : "") + '"></i></p>';
    var prev = moneyStep
      ? '<button type="button" class="turn-btn turn-prev" data-action="entry-back"><strong>' + esc(t("page-back")) + "</strong></button>"
      : '<span class="turn-btn turn-empty"></span>';
    var next = '<button type="button" class="turn-btn turn-next" data-action="entry-next"><strong>' + esc(t("page-next")) + "</strong></button>";
    return '<section class="entry-stage">' + steps + '<p class="trust">' + esc(t("trust")) + "</p><h1>" + esc(title) + '</h1><p class="entry-help">' + esc(help) + "</p>" + body +
      '<div class="turn-row entry-turn">' + prev + next + "</div></section>";
  }

  async function beginEntry() {
    if (sessionStorage.getItem("bt-entry") === "1") {
      await enterApp();
      return;
    }
    state.entry = "lang";
    state.languageQuery = "";
    state.currencyQuery = "";
    state.entryCurrency = canonicalCurrency((state.data && state.data.currency) || "");
    state.page = "menu";
    render();
  }

  async function leaveEntry() {
    sessionStorage.setItem("bt-entry", "1");
    state.entry = "";
    state.entryPending = false;
    state.skipSetup = true;
    await enterApp();
  }

  async function afterEntry() {
    state.skipSetup = true;
    await enterApp();
  }

  async function finishEntryCurrency() {
    var next = canonicalCurrency(state.entryCurrency || "");
    if (!next) {
      toast(t("entry-money"));
      return;
    }
    state.entryPending = true;
    await changeCurrency(next);
    if (state.pending && state.pending.kind === "currency") return;
    state.entryPending = false;
    if (canonicalCurrency(state.data.currency) !== next) {
      state.entry = "money";
      render();
      return;
    }
    await leaveEntry();
  }

  async function enterApp() {
    if (store.needsSetup(state.data) && !state.skipSetup) {
      beginSetup();
      return;
    }
    state.skipSetup = false;
    if (!state.data.setup_complete) {
      state.data.setup_complete = true;
      await persist("");
    }
    var month = maybeMonthNotice(state.data);
    render();
    if (month.changed) await persist("");
    if (month.notice) showNotice(month.notice);
  }

  async function init() {
    state.page = pageFromHash();
    state.hideAmounts = localStorage.getItem("bt-hide") === "1";
    var savedLang = localStorage.getItem("bt-lang");
    if (savedLang) window.BT.i18n.set(savedLang);
    try {
      var loaded = await store.load();
      state.mode = loaded.mode;
      if (loaded.sealed) {
        state.data = null;
        state.locked = true;
        state.pinEntry = "";
        state.lockError = "";
        render();
      } else {
        state.data = loaded.data;
        if (savedLang && !state.data.language) state.data.language = savedLang;
        await beginEntry();
      }
    } catch (err) {
      document.getElementById("app").innerHTML = "<p>" + esc(t("save-fail")) + "</p>";
    }
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  init();
})();

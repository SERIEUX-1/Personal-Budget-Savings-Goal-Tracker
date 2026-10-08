/*
 * logic.js
 * Pure calculations for Budget Tracker. These mirror the reports in
 * processing.py (totals, categories, SMART pace) and add a weekly grouping.
 * No page elements live here, so the numbers can be checked on their own.
 */
(function () {
  var BT = (window.BT = window.BT || {});

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function roundMoney(n) {
    var value = Number(n);
    if (!isFinite(value)) return 0;
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function todayISO(date) {
    var d = date || new Date();
    var month = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + month + "-" + day;
  }

  function currentMonth(date) {
    return todayISO(date).slice(0, 7);
  }

  function parseAmount(raw, allowZero) {
    var s = String(raw == null ? "" : raw).trim().replace(/\s/g, "");
    if (!s) return { ok: false, error: "Enter an amount." };
    if (s.indexOf(",") !== -1 && s.indexOf(".") !== -1) {
      s = s.replace(/,/g, "");
    } else if (/^\d+,\d{1,2}$/.test(s)) {
      s = s.replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
    if (!/^\d+(\.\d+)?$/.test(s)) {
      return { ok: false, error: "Enter an amount such as 1500 or 1500.50." };
    }
    var n = Number(s);
    if (!isFinite(n)) {
      return { ok: false, error: "Enter an amount such as 1500 or 1500.50." };
    }
    if (n < 0 || (n === 0 && !allowZero)) {
      return { ok: false, error: allowZero ? "Amount cannot be negative." : "Amount must be greater than zero." };
    }
    return { ok: true, value: roundMoney(n) };
  }

  function formatMoney(amount, currency) {
    var n = roundMoney(amount);
    var sign = n < 0 ? "-" : "";
    var body = Math.abs(n).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    var symbol = String(currency || "").trim();
    return symbol ? sign + symbol + " " + body : sign + body;
  }

  function formatPercent(n) {
    var value = Number(n);
    if (!isFinite(value)) value = 0;
    return value.toFixed(1) + "%";
  }

  function monthName(index) {
    if (window.BT && BT.i18n && BT.i18n.month) return BT.i18n.month(index);
    return MONTHS[index];
  }

  function formatDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return iso || "";
    var parts = iso.split("-");
    var month = Number(parts[1]);
    return Number(parts[2]) + " " + monthName(month - 1) + " " + parts[0];
  }

  function formatMonth(ym) {
    if (!/^\d{4}-\d{2}$/.test(ym || "")) return ym || "";
    var parts = ym.split("-");
    return monthName(Number(parts[1]) - 1) + " " + parts[0];
  }

  function utcDate(year, monthIndex, day) {
    return new Date(Date.UTC(year, monthIndex, day));
  }

  function isoWeekKey(iso) {
    var parts = iso.split("-").map(Number);
    var date = utcDate(parts[0], parts[1] - 1, parts[2]);
    var day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    var weekYear = date.getUTCFullYear();
    var yearStart = utcDate(weekYear, 0, 1);
    var week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    var label = String(week);
    if (label.length < 2) label = "0" + label;
    return weekYear + "-W" + label;
  }

  function startOfISOWeek(weekYear, week) {
    var jan4 = utcDate(weekYear, 0, 4);
    var jan4Dow = jan4.getUTCDay() || 7;
    var monday = utcDate(weekYear, 0, 4);
    monday.setUTCDate(jan4.getUTCDate() - jan4Dow + 1 + (week - 1) * 7);
    return monday;
  }

  function formatUTC(date) {
    return date.getUTCDate() + " " + monthName(date.getUTCMonth()) + " " + date.getUTCFullYear();
  }

  function weekLabel(key) {
    var parts = key.split("-W");
    var monday = startOfISOWeek(Number(parts[0]), Number(parts[1]));
    var sunday = new Date(monday.getTime());
    sunday.setUTCDate(monday.getUTCDate() + 6);
    var left = monday.getUTCFullYear() === sunday.getUTCFullYear()
      ? monday.getUTCDate() + " " + monthName(monday.getUTCMonth())
      : formatUTC(monday);
    var end = formatUTC(sunday);
    if (window.BT && BT.i18n) return BT.i18n.t("week-of", { start: left, end: end });
    return "Week of " + left + " to " + end;
  }

  function daysCovered(goal) {
    var target = Number(goal && goal.target_amount) || 0;
    if (target <= 0) return 0;
    var ratio = Math.min(1, Math.max(0, Number(goal.current_amount) / target));
    return Math.round(ratio * 7);
  }

  function daysBetween(fromISO, toISO) {
    var a = fromISO.split("-").map(Number);
    var b = toISO.split("-").map(Number);
    var ms = Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2]);
    return Math.round(ms / 86400000);
  }

  function summarize(transactions) {
    var summary = {
      income_total: 0,
      expense_total: 0,
      income_categories: {},
      expense_categories: {},
      count: transactions.length
    };
    transactions.forEach(function (t) {
      var totalKey = t.type + "_total";
      var categoryKey = t.type + "_categories";
      summary[totalKey] = roundMoney(summary[totalKey] + Number(t.amount));
      summary[categoryKey][t.category] = roundMoney((summary[categoryKey][t.category] || 0) + Number(t.amount));
    });
    return summary;
  }

  function buildPeriodSummary(transactions, keyFn) {
    var groups = {};
    transactions.forEach(function (t) {
      var key = keyFn(t);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    var summary = {};
    Object.keys(groups).forEach(function (key) {
      summary[key] = summarize(groups[key]);
    });
    return summary;
  }

  function netOf(summary) {
    var income = summary.income_total;
    var expense = summary.expense_total;
    var net = roundMoney(income - expense);
    var percentSaved = income ? (net / income) * 100 : 0;
    return { income: income, expense: expense, net: net, percentSaved: percentSaved };
  }

  function sortedEntries(obj) {
    return Object.keys(obj).map(function (key) {
      return [key, obj[key]];
    }).sort(function (a, b) {
      return b[1] - a[1];
    });
  }

  function goalProgress(goal) {
    if (!goal.target_amount) return 0;
    return Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100);
  }

  function goalPace(goal, today) {
    var percent = goalProgress(goal);
    var remaining = roundMoney(Number(goal.target_amount) - Number(goal.current_amount));
    var daysLeft = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(goal.deadline || "")) {
      daysLeft = daysBetween(today, goal.deadline);
    }
    var pace = null;
    if (goal.goal_type === "smart" && daysLeft !== null && daysLeft > 0 && remaining > 0) {
      var monthsLeft = Math.max(daysLeft / 30, 1 / 30);
      var required = remaining / monthsLeft;
      pace = {
        required: required,
        onTrack: Number(goal.monthly_contribution) >= required
      };
    }
    return {
      percent: percent,
      remaining: remaining,
      daysLeft: daysLeft,
      pace: pace,
      status: percent >= 100 ? "complete" : "active"
    };
  }

  function conversionFactor(toPerFrom, fromPerTo) {
    var direct = Number(toPerFrom);
    var inverse = Number(fromPerTo);
    if (inverse >= 1 && direct > 0 && direct < 0.01) return 1 / inverse;
    if (direct > 0) return direct;
    if (inverse > 0) return 1 / inverse;
    return null;
  }

  function categoryTotals(transactions) {
    var totals = {};
    transactions.forEach(function (t) {
      if (t.type !== "expense") return;
      totals[t.category] = roundMoney((totals[t.category] || 0) + Number(t.amount));
    });
    var grand = roundMoney(Object.keys(totals).reduce(function (sum, key) {
      return sum + totals[key];
    }, 0));
    return { totals: totals, grand: grand, rows: sortedEntries(totals) };
  }

  BT.logic = {
    MONTHS: MONTHS,
    roundMoney: roundMoney,
    conversionFactor: conversionFactor,
    todayISO: todayISO,
    currentMonth: currentMonth,
    parseAmount: parseAmount,
    formatMoney: formatMoney,
    formatPercent: formatPercent,
    formatDate: formatDate,
    formatMonth: formatMonth,
    isoWeekKey: isoWeekKey,
    weekLabel: weekLabel,
    daysBetween: daysBetween,
    summarize: summarize,
    buildPeriodSummary: buildPeriodSummary,
    netOf: netOf,
    sortedEntries: sortedEntries,
    goalProgress: goalProgress,
    goalPace: goalPace,
    categoryTotals: categoryTotals,
    daysCovered: daysCovered
  };
})();

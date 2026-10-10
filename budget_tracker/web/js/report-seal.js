/*
 * A check code for a downloaded report.
 * The code is made from the figures on that page.
 * Typing it back shows those figures again.
 * Records are not sent anywhere to make the code.
 */
(function () {
  var BT = (window.BT = window.BT || {});
  var KEY = "budget-tracker-report-v1";
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var PAGE = {
    month: "6", days: "7", day: "8", category: "9", tx: "2", "tx-search": "5",
    progress: "15", goals: "11", "goal-search": "14"
  };
  var TITLE = {
    "6": "m6", "7": "m7", "8": "m8", "9": "m9", "2": "m2", "5": "m5",
    "15": "m15", "11": "m11", "14": "m14", "0": "reports"
  };
  var MONEY_PAGES = { "6": 1, "7": 1, "8": 1, "9": 1, "2": 1, "5": 1, "0": 1 };
  var GOAL_PAGES = { "15": 1, "11": 1, "14": 1 };

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256(bytes) {
    var bitLen = bytes.length * 8;
    var data = bytes.slice();
    data.push(0x80);
    while ((data.length % 64) !== 56) data.push(0);
    var hi = Math.floor(bitLen / 0x100000000);
    var lo = bitLen >>> 0;
    var s;
    for (s = 3; s >= 0; s--) data.push((hi >>> (s * 8)) & 255);
    for (s = 3; s >= 0; s--) data.push((lo >>> (s * 8)) & 255);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var off;
    for (off = 0; off < data.length; off += 64) {
      var w = [];
      var i;
      for (i = 0; i < 16; i++) {
        w[i] = ((data[off + i * 4] << 24) | (data[off + i * 4 + 1] << 16) | (data[off + i * 4 + 2] << 8) | data[off + i * 4 + 3]) >>> 0;
      }
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ ((~e) & g);
        var temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e;
        e = (d + temp1) >>> 0;
        d = c; c = b; b = a;
        a = (temp1 + temp2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0;
      H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0;
      H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0;
      H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0;
      H[7] = (H[7] + h) >>> 0;
    }
    var out = [];
    for (i = 0; i < 8; i++) {
      out.push((H[i] >>> 24) & 255, (H[i] >>> 16) & 255, (H[i] >>> 8) & 255, H[i] & 255);
    }
    return out;
  }

  function utf8(text) {
    return Array.prototype.slice.call(new TextEncoder().encode(text));
  }

  function hmac(message) {
    var key = utf8(KEY);
    if (key.length > 64) key = sha256(key);
    while (key.length < 64) key.push(0);
    var outer = [];
    var inner = [];
    var n;
    for (n = 0; n < 64; n++) {
      outer.push(key[n] ^ 0x5c);
      inner.push(key[n] ^ 0x36);
    }
    return sha256(outer.concat(sha256(inner.concat(utf8(message)))));
  }

  function macOf(body) {
    var digest = hmac(body).slice(0, 5);
    var bits = 0;
    var value = 0;
    var out = "";
    var i;
    for (i = 0; i < digest.length; i++) {
      value = (value << 8) | digest[i];
      bits += 8;
      while (bits >= 5) {
        bits -= 5;
        out += ALPHABET[(value >>> bits) & 31];
      }
    }
    return out;
  }

  function same(a, b) {
    if (a.length !== b.length) return false;
    var diff = 0;
    var i;
    for (i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  function moneyToken(amount) {
    var cents = Math.round(Number(amount) * 100);
    if (!isFinite(cents)) cents = 0;
    var sign = cents < 0 ? "N" : "";
    var abs = Math.abs(cents);
    var frac = String(abs % 100);
    if (frac.length < 2) frac = "0" + frac;
    return sign + Math.floor(abs / 100) + "." + frac;
  }

  function readMoney(token) {
    if (!/^N?\d+\.\d{2}$/.test(token || "")) return null;
    var negative = token.charAt(0) === "N";
    var value = Number(negative ? token.slice(1) : token);
    if (!isFinite(value)) return null;
    return negative ? -value : value;
  }

  function dateToken(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
    return iso.replace(/-/g, "");
  }

  function readDate(token) {
    if (!/^\d{8}$/.test(token || "")) return "";
    var iso = token.slice(0, 4) + "-" + token.slice(4, 6) + "-" + token.slice(6, 8);
    var year = Number(token.slice(0, 4));
    var month = Number(token.slice(4, 6));
    var day = Number(token.slice(6, 8));
    var check = new Date(Date.UTC(year, month - 1, day));
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return "";
    return iso;
  }

  function bodyFor(figures) {
    var kind = figures.kind === "goals" ? "G" : "M";
    var page = PAGE[figures.page] || "0";
    var currency = String(figures.currency || "").trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) currency = "XXX";
    var parts = [kind, page, currency, moneyToken(figures.a), moneyToken(figures.b)];
    if (kind === "M") parts.push(moneyToken(figures.c));
    var prepared = dateToken(figures.prepared);
    if (!prepared) return "";
    parts.push(prepared);
    if (page === "8") {
      var day = dateToken(figures.day);
      if (!day) return "";
      parts.push(day);
    }
    return parts.join("-");
  }

  function code(figures) {
    var body = bodyFor(figures || {});
    if (!body) return "";
    return body + "-" + macOf(body);
  }

  function read(text) {
    var raw = String(text || "").toUpperCase().replace(/\s+/g, "");
    var cut = raw.lastIndexOf("-");
    if (cut < 1) return null;
    var body = raw.slice(0, cut);
    var mac = raw.slice(cut + 1);
    if (!/^[0-9A-HJKMNP-TV-Z]{8}$/.test(mac) || !same(mac, macOf(body))) return null;
    var parts = body.split("-");
    var kind = parts[0];
    var page = parts[1];
    var currency = parts[2];
    if ((kind !== "M" && kind !== "G") || !TITLE[page] || !/^[A-Z]{3}$/.test(currency || "")) return null;
    if (kind === "G" && !GOAL_PAGES[page]) return null;
    if (kind === "M" && !MONEY_PAGES[page]) return null;
    var a = readMoney(parts[3]);
    var b = readMoney(parts[4]);
    if (a == null || b == null) return null;
    var c = 0;
    var prepared = "";
    var day = "";
    if (kind === "M") {
      c = readMoney(parts[5]);
      prepared = readDate(parts[6]);
      if (c == null || !prepared) return null;
      if (page === "8") {
        day = readDate(parts[7]);
        if (!day || parts.length !== 8) return null;
      } else if (parts.length !== 7) return null;
    } else {
      prepared = readDate(parts[5]);
      if (!prepared || parts.length !== 6) return null;
    }
    return {
      kind: kind === "G" ? "goals" : "money",
      page: page,
      titleKey: TITLE[page],
      currency: currency === "XXX" ? "" : currency,
      a: a,
      b: b,
      c: c,
      prepared: prepared,
      day: day
    };
  }

  BT.reportSeal = { code: code, read: read };
})();

/*
 * vault.js
 * When a lock is set, the money records on this phone are encrypted.
 * The 4 numbers never stay on the phone. A slow key stretch and a pause
 * after repeated wrong tries make guessing on the phone take a long time.
 * The command-line file stays readable by main.py; this lock protects the
 * copy kept in the browser.
 */
(function () {
  var BT = (window.BT = window.BT || {});
  var VAULT_KEY = "bt-vault";
  var LOCK_KEY = "bt-lock";
  var GUARD_KEY = "bt-guard";
  var DATA_KEY = "bt-data";
  var ITERATIONS = 210000;
  var sessionKey = null;

  function canSeal() {
    return !!(window.crypto && crypto.subtle && crypto.getRandomValues);
  }

  function bytesToB64(bytes) {
    var bin = "";
    var i;
    for (i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function b64ToBytes(text) {
    var bin = atob(text);
    var out = new Uint8Array(bin.length);
    var i;
    for (i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function readVault() {
    try {
      var raw = JSON.parse(localStorage.getItem(VAULT_KEY) || "null");
      if (!raw || raw.v !== 1 || !raw.salt || !raw.iv || !raw.ct) return null;
      return raw;
    } catch (e) {
      return null;
    }
  }

  function isSealed() {
    return !!readVault();
  }

  function legacyLock() {
    var stored = localStorage.getItem(LOCK_KEY) || "";
    return /^[0-9a-f]{64}$/.test(stored) ? stored : "";
  }

  function hasLock() {
    return isSealed() || !!legacyLock() || localStorage.getItem(LOCK_KEY) === "v1";
  }

  function active() {
    return !!sessionKey;
  }

  function lockedOut() {
    try {
      var guard = JSON.parse(localStorage.getItem(GUARD_KEY) || "{}");
      var left = Math.ceil(((Number(guard.until) || 0) - Date.now()) / 1000);
      return left > 0 ? left : 0;
    } catch (e) {
      return 0;
    }
  }

  function noteFailure() {
    var guard = {};
    try { guard = JSON.parse(localStorage.getItem(GUARD_KEY) || "{}"); } catch (e) { guard = {}; }
    var fails = (Number(guard.fails) || 0) + 1;
    var until = Number(guard.until) || 0;
    if (fails % 5 === 0) {
      var step = fails / 5;
      var seconds = Math.min(900, 30 * Math.pow(2, step - 1));
      until = Date.now() + seconds * 1000;
    }
    localStorage.setItem(GUARD_KEY, JSON.stringify({ fails: fails, until: until }));
  }

  function noteSuccess() {
    localStorage.removeItem(GUARD_KEY);
  }

  async function derive(pin, saltBytes) {
    var material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(String(pin)),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: ITERATIONS, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encrypt(key, text) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      new TextEncoder().encode(text)
    );
    return { iv: bytesToB64(iv), ct: bytesToB64(new Uint8Array(cipher)) };
  }

  async function seal(data, pin) {
    if (!canSeal() || !/^\d{4}$/.test(String(pin || ""))) return false;
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var key = await derive(pin, salt);
    var packed = await encrypt(key, JSON.stringify(data));
    localStorage.setItem(VAULT_KEY, JSON.stringify({
      v: 1,
      salt: bytesToB64(salt),
      iv: packed.iv,
      ct: packed.ct
    }));
    localStorage.removeItem(DATA_KEY);
    localStorage.setItem(LOCK_KEY, "v1");
    sessionKey = key;
    noteSuccess();
    return true;
  }

  async function write(data) {
    if (!sessionKey) return false;
    var existing = readVault();
    if (!existing) return false;
    var packed = await encrypt(sessionKey, JSON.stringify(data));
    existing.iv = packed.iv;
    existing.ct = packed.ct;
    localStorage.setItem(VAULT_KEY, JSON.stringify(existing));
    localStorage.removeItem(DATA_KEY);
    return true;
  }

  async function open(pin) {
    var wait = lockedOut();
    if (wait) return { ok: false, wait: wait };
    var box = readVault();
    if (!box) return { ok: false, missing: true };
    try {
      var key = await derive(pin, b64ToBytes(box.salt));
      var plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: b64ToBytes(box.iv) },
        key,
        b64ToBytes(box.ct)
      );
      sessionKey = key;
      noteSuccess();
      return { ok: true, data: JSON.parse(new TextDecoder().decode(plain)) };
    } catch (e) {
      sessionKey = null;
      noteFailure();
      return { ok: false, wait: lockedOut() };
    }
  }

  async function legacyHash(pin) {
    var data = new TextEncoder().encode("budget-tracker-lock-v1:" + pin);
    var buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map(function (byte) {
      var hex = byte.toString(16);
      return hex.length < 2 ? "0" + hex : hex;
    }).join("");
  }

  async function openLegacy(pin) {
    var stored = legacyLock();
    if (!stored) return { ok: false, missing: true };
    var wait = lockedOut();
    if (wait) return { ok: false, wait: wait };
    try {
      if ((await legacyHash(pin)) !== stored) {
        noteFailure();
        return { ok: false, wait: lockedOut() };
      }
    } catch (e) {
      return { ok: false };
    }
    noteSuccess();
    return { ok: true };
  }

  function clear() {
    sessionKey = null;
    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem(LOCK_KEY);
    noteSuccess();
  }

  BT.vault = {
    canSeal: canSeal,
    isSealed: isSealed,
    hasLock: hasLock,
    active: active,
    lockedOut: lockedOut,
    seal: seal,
    write: write,
    open: open,
    openLegacy: openLegacy,
    clear: clear
  };
})();

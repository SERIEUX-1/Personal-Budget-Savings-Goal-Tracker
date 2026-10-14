/*
 * The app shell is stored on the phone so Budget Tracker opens with no internet.
 * Records are not cached here; they stay in the JSON file or in the browser.
 */
var CACHE = "budget-tracker-v52";
var ASSETS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/logic.js",
  "./js/vault.js",
  "./js/store.js",
  "./js/i18n.js",
  "./js/i18n-world.js",
  "./js/i18n-world-b.js",
  "./js/i18n-world-c.js",
  "./js/languages.js",
  "./js/guide.js",
  "./js/guide-world.js",
  "./js/currencies.js",
  "./js/report-seal.js",
  "./js/ui.js",
  "./manifest.webmanifest",
  "./img/mr-serieux.jpg",
  "./img/sun.png",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(ASSETS);
  }));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key !== CACHE;
    }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () {
    return self.clients.claim();
  }).then(function () {
    return self.clients.matchAll({ type: "window" });
  }).then(function (clients) {
    clients.forEach(function (client) {
      if (client.navigate) client.navigate(client.url);
    });
  }));
});

function matchShell(request) {
  return caches.match(request).then(function (hit) {
    if (hit) return hit;
    if (request.mode === "navigate") return caches.match("./index.html");
    return null;
  });
}

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/api/") !== -1) return;
  if (event.request.method !== "GET") return;

  event.respondWith(fetch(event.request).then(function (response) {
    if (response && response.status === 200 && response.type === "basic") {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) {
        cache.put(event.request, copy);
      });
    }
    return response;
  }).catch(function () {
    return matchShell(event.request).then(function (cached) {
      return cached || caches.match("./index.html");
    });
  }));
});

function remindDb() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open("bt-remind", 1);
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains("kv")) req.result.createObjectStore("kv");
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

function remindGet(key) {
  return remindDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      var req = db.transaction("kv", "readonly").objectStore("kv").get(key);
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  });
}

function remindPut(key, value) {
  return remindDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put(value, key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

function localDayKey(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return date.getFullYear() + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
}

function showEveningFromWorker() {
  var now = new Date();
  if (now.getHours() < 20) return Promise.resolve();
  var day = localDayKey(now);
  return remindGet("prefs").then(function (prefs) {
    if (!prefs || !prefs.on) return;
    return remindGet("reminded").then(function (seen) {
      if (seen === day) return;
      return remindPut("reminded", day).then(function () {
        return self.registration.showNotification(prefs.title || "Budget Tracker", {
          body: prefs.body || "",
          icon: "icons/icon-192.png",
          badge: "icons/icon-192.png",
          tag: "bt-evening-" + day,
          lang: prefs.lang || "en",
          data: { url: "./index.html#menu" }
        });
      });
    });
  }).catch(function () {});
}

self.addEventListener("periodicsync", function (event) {
  if (event.tag !== "evening-reminder") return;
  event.waitUntil(showEveningFromWorker());
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var target = new URL("./index.html#menu", self.location).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    if (list.length && list[0].focus) return list[0].focus();
    if (self.clients.openWindow) return self.clients.openWindow(target);
  }));
});

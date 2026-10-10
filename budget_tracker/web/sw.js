/*
 * The app shell is stored on the phone so Budget Tracker opens with no internet.
 * Records are not cached here; they stay in the JSON file or in the browser.
 */
var CACHE = "budget-tracker-v40";
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
  "./icons/icon-512.png"
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

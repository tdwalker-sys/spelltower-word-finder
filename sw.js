// Offline support: every file the app needs is stored on the device the first time it loads.
// Change VERSION whenever any file other than index.html changes, so devices fetch the new copies.
const VERSION = "v1";
const CACHE = "spelltower-" + VERSION;
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "enable1.txt",
  "fonts/jost-latin.woff2",
  "fonts/source-sans-3-latin.woff2",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "ocr/tesseract.min.js",
  "ocr/worker.min.js",
  "ocr/eng-traineddata.wasm",
  "ocr/tesseract-core-lstm.wasm",
  "ocr/tesseract-core-lstm.wasm.js",
  "ocr/tesseract-core-simd-lstm.wasm",
  "ocr/tesseract-core-simd-lstm.wasm.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("spelltower-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // The page itself: newest copy when online, stored copy when offline.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); } return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  // Everything else (word list, text reader, fonts): stored copy first.
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request)));
});

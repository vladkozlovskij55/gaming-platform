const CACHE_NAME = "gamestudy-pwa-v2";
const APP_SHELL = [
    "./",
    "./index.html",
    "./profile.html",
    "./lessons.html",
    "./test.html",
    "./rating.html",
    "./admin.html",
    "./login.html",
    "./register.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/gamestudy-icon.svg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
});

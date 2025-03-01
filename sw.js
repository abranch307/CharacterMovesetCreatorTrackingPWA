self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("pose-cache").then((cache) => {
            return cache.addAll(["/", "/index.html", "/script.js", "/style.css"]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    if(event.request.url.startsWith("ws://") || event.request.url.startsWith("wss://")){
        return;
    }
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

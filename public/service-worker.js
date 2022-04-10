self.addEventListener("install", () => {
    self.skipWaiting()
}), self.addEventListener("activate", async () => {
    var e;
    await self.registration.unregister();
    for (e of await self.clients.matchAll({
            type: "window"
        })) e.navigate(e.url)
});
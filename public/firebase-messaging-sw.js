'use strict';

self.addEventListener('install', (event) => {
    event.waitUntil(skipWaiting());
}, false);

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
}, false);

self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const parsedData   = event.data.json();
    const notification = parsedData.data;
	console.log(notification);
    const title        = notification.heading;
    const body         = notification.desc;
    const icon         = notification.banner;
    const data         = notification;

    event.waitUntil(
        self.registration.showNotification(title, { body, icon, data })
    );
}, false);

self.addEventListener('notificationclick', (event) => {
	console.log(event);
    event.waitUntil(self.clients.openWindow(event.notification.data.url));
}, false);

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
});

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'New Notification', body: event.data.text() };
        }
    }

    const title = data.title || 'Fitness App Update';
    const options = {
        body: data.body || 'You have a new update.',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.svg',
        image: data.image, // Big picture
        vibrate: [200, 100, 200, 100, 200, 100, 200], // Custom vibration pattern
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/icons/checkmark.svg'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/xmark.svg'
            },
        ],
        tag: 'fitness-notification', // Group notifications
        renotify: true // Play sound/vibrate again
    };

    // Show Notification
    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => {
                // Update specific badge count if supported
                if ('setAppBadge' in navigator) {
                     // Generally handled in client, but can be done here if supported context
                     // navigator.setAppBadge(1).catch(error => console.error(error));
                }
            })
    );
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open URL
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If so, just focus it.
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});


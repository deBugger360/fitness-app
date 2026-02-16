"use client";

import { toast } from "@/components/ui/use-toast";

class PWAManager {
    private static instance: PWAManager;
    private swRegistration: ServiceWorkerRegistration | null = null;
    private isSubscribed = false;

    private constructor() { }

    public static getInstance(): PWAManager {
        if (!PWAManager.instance) {
            PWAManager.instance = new PWAManager();
        }
        return PWAManager.instance;
    }

    public async registerServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.swRegistration = registration;
                console.log('Service Worker registered with scope:', registration.scope);

                // Update UI or state if needed
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        } else {
            console.warn('Push messaging is not supported');
        }
        return null;
    }

    public async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');

            // Show a test notification immediately
            this.showLocalNotification(
                "Notifications Enabled! 🚀",
                "You will now receive updates for your fitness goals."
            );
            return true;
        } else {
            console.log('Notification permission denied.');
            return false;
        }
    }

    public showLocalNotification(title: string, body: string) {
        if (this.swRegistration) {
            const options = {
                body: body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: 1,
                    url: window.location.href // Focus current tab
                },
                actions: [
                    { action: 'explore', title: 'View' },
                    { action: 'close', title: 'Close' }
                ]
            };
            this.swRegistration.showNotification(title, options);

            // Allow setting app badge if supported
            if ('setAppBadge' in navigator) {
                // @ts-ignore
                navigator.setAppBadge(1).catch((e) => console.error(e));
            }
        } else {
            // Fallback to normal Web Notification if SW not ready
            new Notification(title, { body });
        }
    }

    public async clearBadge() {
        if ('clearAppBadge' in navigator) {
            try {
                // @ts-ignore
                await navigator.clearAppBadge();
            } catch (error) {
                console.error('Failed to clear badge', error);
            }
        }
    }
}

export const pwaManager = PWAManager.getInstance();

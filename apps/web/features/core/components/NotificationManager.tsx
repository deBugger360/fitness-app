"use client";

import React, { useEffect } from 'react';
import { db } from '@/lib/db';

export default function NotificationManager() {
    useEffect(() => {
        // 1. Check if notifications are enabled in settings
        const enabled = localStorage.getItem('notifications_enabled') === 'true';
        if (!enabled) return;

        // 2. Request permission if not granted
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        // 3. Setup Daily Check (Poll every minute for simplicity in this MVP)
        const interval = setInterval(async () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();

            // TRIGGER 1: Morning Plan Reminder (8:00 AM)
            if (hour === 8 && minute === 0) {
                checkAndSendReminder('morning_hiit_completed', 'Rise & Grind! ☀️', 'Your 15min HIIT session is waiting. Tap to start.');
            }

            // TRIGGER 2: Evening Walk Reminder (6:00 PM)
            if (hour === 18 && minute === 0) {
                checkAndSendReminder('evening_walk_minutes', 'Walk it Off 🚶', 'Close your rings with a sunset walk.');
            }

            // TRIGGER 3: Log Lunch (2:00 PM)
            if (hour === 14 && minute === 0) {
                checkAndSendLogReminder('lunch', 'Fuel Up! 🥗', 'Don\'t forget to log your lunch details.');
            }

        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const checkAndSendReminder = async (field: string, title: string, body: string) => {
        // Check if valid to send
        const today = new Date().toISOString().split('T')[0];
        const user = await db.table('users').limit(1).first();
        if (!user) return;

        const workout = await db.table('workouts')
            .where('date').equals(today)
            .and((w: any) => w.user_id === user.id)
            .first();

        // If not done (or not even created), send reminder
        // For 'evening_walk_minutes', check if > 0
        let isDone = false;
        if (workout) {
            if (field === 'morning_hiit_completed') isDone = (workout as any).morning_hiit_completed === 1;
            if (field === 'evening_walk_minutes') isDone = (workout as any).evening_walk_minutes > 0;
        }

        if (!isDone) {
            sendNotification(title, body);
        }
    };

    const checkAndSendLogReminder = async (mealType: string, title: string, body: string) => {
        const today = new Date().toISOString().split('T')[0];
        const user = await db.table('users').limit(1).first();
        if (!user) return;

        const log = await db.table('meals')
            .where('date').equals(today)
            .and((m: any) => m.user_id === user.id)
            .first();

        // If no log or specific meal slot empty
        if (!log || !(log as any)[mealType] || (log as any)[mealType].length < 2) {
            sendNotification(title, body);
        }
    };

    const sendNotification = (title: string, body: string) => {
        if (Notification.permission === 'granted') {
            // Standard Notification
            const options = {
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                vibrate: [100, 50, 100],
                tag: 'fitness-scribe-' + title // prevent duplicate stacking
            };

            // Try Service Worker registration first for "persistent" notification
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                });
            } else {
                new Notification(title, options);
            }
        }
    };

    return null; // Headless component
}

"use client";

import { useEffect } from "react";
import { getSyncManager, initSyncManager } from "@/lib/syncManager";
import { pwaManager } from "@/lib/pwaManager";

export default function SyncProvider() {
    useEffect(() => {
        // Initialize Core Sync
        const startSync = async () => {
            await initSyncManager();
        };
        startSync();

        // Initialize PWA Service Worker
        const initPWA = async () => {
            if ('serviceWorker' in navigator) {
                await pwaManager.registerServiceWorker();
            }
        };
        initPWA();

        return () => {
            getSyncManager().cleanup();
        };
    }, []);

    return null;
}

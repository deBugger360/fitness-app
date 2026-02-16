"use client";

import { useEffect } from "react";
import { syncManager, initSyncManager } from "@/lib/syncManager";
import { pwaManager } from "@/lib/pwaManager";

export default function SyncProvider() {
    useEffect(() => {
        // Initialize Core Sync
        initSyncManager();

        // Initialize PWA Service Worker
        const initPWA = async () => {
            if ('serviceWorker' in navigator) {
                await pwaManager.registerServiceWorker();
            }
        };
        initPWA();

        return () => {
            syncManager.cleanup();
        };
    }, []);

    return null;
}

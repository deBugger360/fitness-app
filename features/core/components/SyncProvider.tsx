"use client";

import { useEffect } from "react";
import { syncManager, initSyncManager } from "@/lib/syncManager";

export default function SyncProvider() {
    useEffect(() => {
        initSyncManager();
        return () => {
            syncManager.cleanup();
        };
    }, []);

    return null;
}

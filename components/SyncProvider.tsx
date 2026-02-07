"use client";

import { useEffect } from "react";
import { initSyncManager } from "@/lib/syncManager";

export default function SyncProvider() {
    useEffect(() => {
        initSyncManager();
    }, []);

    return null;
}

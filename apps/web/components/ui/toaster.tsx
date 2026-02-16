"use client"

import { useToast } from "@/components/ui/use-toast"
import { X, CheckCircle, AlertCircle } from "lucide-react"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed top-0 right-0 z-[100] flex flex-col p-4 w-full md:max-w-[420px] gap-2">
            {toasts.map(function ({ id, title, description, action, variant, ...props }) {
                return (
                    <div
                        key={id}
                        className={`
                            grid grid-cols-[auto_1fr_auto] items-start gap-4 w-full rounded-lg border p-4 shadow-lg pr-8 relative overflow-hidden transition-all animate-in slide-in-from-top-full duration-300
                            ${variant === "destructive"
                                ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50"
                                : "border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"}
                        `}
                        {...props}
                    >
                        {variant === "destructive" ? <AlertCircle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}

                        <div className="grid gap-1">
                            {title && <div className="text-sm font-semibold">{title}</div>}
                            {description && (
                                <div className="text-sm opacity-90">{description}</div>
                            )}
                        </div>
                        {action}
                        <button
                            onClick={() => dismiss(id)}
                            className={`absolute right-2 top-2 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 ${variant === "destructive" ? "text-red-900 hover:text-red-900" : "text-slate-950 hover:text-slate-950"}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-skeleton bg-slate-200 dark:bg-slate-800 rounded-2xl ${className}`} />
    );
}

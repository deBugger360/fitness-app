export default function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-skeleton bg-slate-200 rounded-2xl ${className}`} />
    );
}

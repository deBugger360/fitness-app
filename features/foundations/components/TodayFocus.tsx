export default function TodayFocus() {
    return (
        <div className="bg-indigo-600 dark:bg-indigo-900/50 text-white rounded-3xl p-6 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <h3 className="uppercase text-xs font-bold tracking-widest text-indigo-200 mb-2">Today's Focus: Connection</h3>
            <p className="font-bold text-lg leading-relaxed z-10 relative">Call a friend you haven't spoken to in a while. Ask how they are doing.</p>

            <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                Mark Complete
            </button>
        </div>
    );
}

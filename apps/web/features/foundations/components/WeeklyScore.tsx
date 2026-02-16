interface WeeklyScoreProps {
    data: any[]; // last 7 days scores
}

export default function WeeklyScore({ data }: WeeklyScoreProps) {
    // Current Week Score based on average completion
    const average = data.length > 0
        ? Math.round((data.reduce((acc, curr) => acc + (curr.score / 11) * 100, 0) / data.length))
        : 0;

    return (
        <div className="flex items-center justify-between">
            <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Consistency</span>
                <div className="flex items-end">
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{average}%</h2>
                    <span className="text-green-500 font-bold mb-2 ml-2 text-sm">↑ 2%</span>
                </div>
            </div>

            <div className="flex items-end space-x-1 h-12">
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center group">
                        <div
                            className={`w-2 rounded-full transition-all duration-500 ${d.score >= 8 ? 'bg-green-500' : d.score >= 5 ? 'bg-yellow-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                            style={{ height: `${(d.score / 11) * 40 + 4}px` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

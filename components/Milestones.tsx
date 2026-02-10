import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Trophy, Flame, Droplets, Dumbbell, ShieldCheck, Star } from 'lucide-react';

interface Milestone {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    isUnlocked: boolean;
    progress: number;
    target: number;
    color: string;
}

interface MilestonesProps {
    currentUserId: number | null;
}

const Milestones: React.FC<MilestonesProps> = ({ currentUserId }) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUserId) return;

        const calculateMilestones = async () => {
            try {
                // 1. Fetch Data
                const workouts = await db.table('workouts')
                    .where('user_id').equals(currentUserId)
                    .toArray();

                const meals = await db.table('meals')
                    .where('user_id').equals(currentUserId)
                    .toArray();

                const sugarLogs = await db.table('sugar_logs')
                    .where('user_id').equals(currentUserId)
                    .toArray();

                // 2. Calculate Metrics
                const totalWorkouts = workouts.length;
                const morningHiitCount = workouts.filter(w => w.morning_hiit_completed).length;

                // Hydration Streak (Days with > 2L)
                const hydratedDays = meals.filter(m => m.water_liters >= 3).length; // Goal is usually 3L

                // Sugar Resistance
                const sugarResisted = sugarLogs.filter(s => s.type === 'craving' && s.success_resisted).length;

                // 3. Define Milestones
                const definitions: Milestone[] = [
                    {
                        id: 'first_step',
                        title: 'First Step',
                        description: 'Complete your first workout.',
                        icon: Star,
                        isUnlocked: totalWorkouts >= 1,
                        progress: Math.min(totalWorkouts, 1),
                        target: 1,
                        color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
                    },
                    {
                        id: 'consistency',
                        title: 'Consistency is Key',
                        description: 'Complete 3 morning HIIT sessions.',
                        icon: Flame,
                        isUnlocked: morningHiitCount >= 3,
                        progress: morningHiitCount,
                        target: 3,
                        color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
                    },
                    {
                        id: 'week_warrior',
                        title: 'Work Week Warrior',
                        description: 'Log 5 total workouts.',
                        icon: Trophy,
                        isUnlocked: totalWorkouts >= 5,
                        progress: totalWorkouts,
                        target: 5,
                        color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
                    },
                    {
                        id: 'hydration',
                        title: 'Hydration Hero',
                        description: 'Hit 3L water goal 5 times.',
                        icon: Droplets,
                        isUnlocked: hydratedDays >= 5,
                        progress: hydratedDays,
                        target: 5,
                        color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'
                    },
                    {
                        id: 'sugar_guard',
                        title: 'Sugar Guard',
                        description: 'Resist 10 sugar cravings.',
                        icon: ShieldCheck,
                        isUnlocked: sugarResisted >= 10,
                        progress: sugarResisted,
                        target: 10,
                        color: 'text-green-500 bg-green-100 dark:bg-green-900/30'
                    },
                    {
                        id: 'iron_body',
                        title: 'Iron Body',
                        description: 'Complete 20 Morning HIITs.',
                        icon: Dumbbell,
                        isUnlocked: morningHiitCount >= 20,
                        progress: morningHiitCount,
                        target: 20,
                        color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'
                    }
                ];

                setMilestones(definitions);
            } catch (error) {
                console.error("Failed to load milestones", error);
            } finally {
                setLoading(false);
            }
        };

        calculateMilestones();
    }, [currentUserId]);

    if (loading) return <div className="animate-pulse h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>;

    return (
        <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                Milestones & Achievements
            </h2>
            <div className="grid grid-cols-2 gap-4">
                {milestones.map((m) => (
                    <div
                        key={m.id}
                        className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${m.isUnlocked
                            ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-70 grayscale-[0.5]'
                            }`}
                    >
                        {/* Progress Bar background for locked items */}
                        {!m.isUnlocked && (
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-500"
                                style={{ width: `${(m.progress / m.target) * 100}%` }}
                            />
                        )}

                        <div className="flex items-center mb-3">
                            <div className={`p-2 rounded-xl mr-3 ${m.isUnlocked ? m.color : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                <m.icon className="w-5 h-5" />
                            </div>
                            {m.isUnlocked && (
                                <div className="absolute top-3 right-3">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                                </div>
                            )}
                        </div>

                        <h3 className={`font-bold text-sm mb-1 ${m.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {m.title}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                            {m.description}
                        </p>

                        {!m.isUnlocked && (
                            <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase tracking-wide">
                                {m.progress} / {m.target} Completed
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Milestones;

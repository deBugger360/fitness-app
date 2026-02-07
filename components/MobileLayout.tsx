"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, ChartBar, User, ShieldHalf } from 'lucide-react';

interface MobileLayoutProps {
    children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    const pathname = usePathname();

    const tabs = [
        { name: 'Workout', icon: Home, href: '/' },
        { name: 'Meals', icon: Utensils, href: '/meals' },
        { name: 'Sugar', icon: ShieldHalf, href: '/sugar' },
        { name: 'Stats', icon: ChartBar, href: '/stats' },
        { name: 'Profile', icon: User, href: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center items-center">
            {/* Mobile Container */}
            <div className="w-full max-w-[500px] h-screen max-h-screen bg-white shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-slate-900/5">

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto scrollbar-hide pb-2">
                    {children}
                </main>

                {/* Bottom Navigation */}
                <nav className="h-[88px] pb-5 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around items-center shrink-0 z-50 px-2 transition-all">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href;

                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 tap-highlight-transparent group rounded-2xl mx-1 max-h-[64px] ${isActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
                                    <Icon className={`w-6 h-6 ${isActive ? 'fill-indigo-600 text-indigo-600' : 'text-current'}`} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'opacity-100 font-semibold' : 'opacity-80'}`}>{tab.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default MobileLayout;

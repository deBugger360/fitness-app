"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, ChartBar, User } from 'lucide-react';

interface MobileLayoutProps {
    children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    const pathname = usePathname();

    const tabs = [
        { name: 'Workout', icon: Home, href: '/' },
        { name: 'Meals', icon: Utensils, href: '/meals' },
        { name: 'Stats', icon: ChartBar, href: '/stats' },
        { name: 'Profile', icon: User, href: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            {/* Mobile Container */}
            <div className="w-full max-w-[500px] h-screen max-h-screen bg-white shadow-2xl flex flex-col relative overflow-hidden">

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    {children}
                </main>

                {/* Bottom Navigation */}
                <nav className="h-16 bg-white border-t border-gray-200 flex justify-around items-center shrink-0 z-50">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href;

                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-xs font-medium">{tab.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default MobileLayout;

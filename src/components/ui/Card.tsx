'use client';

import React from 'react';

interface CardProps {
    title: string;
    icon?: React.ReactNode;
    accentColor?: string;
    children: React.ReactNode;
    className?: string;
}

export default function Card({
    title,
    icon,
    accentColor = 'orange',
    children,
    className = '',
}: CardProps) {
    const accentMap: Record<string, string> = {
        orange: 'from-orange-500/20 to-transparent border-orange-500/10',
        blue: 'from-blue-500/20 to-transparent border-blue-500/10',
        green: 'from-emerald-500/20 to-transparent border-emerald-500/10',
        purple: 'from-purple-500/20 to-transparent border-purple-500/10',
        red: 'from-red-500/20 to-transparent border-red-500/10',
    };

    const headerAccent: Record<string, string> = {
        orange: 'text-orange-400',
        blue: 'text-blue-400',
        green: 'text-emerald-400',
        purple: 'text-purple-400',
        red: 'text-red-400',
    };

    return (
        <section
            className={`
        relative overflow-hidden rounded-2xl
        border border-white/[0.06]
        bg-[#111113]
        shadow-xl shadow-black/20
        transition-all duration-300
        hover:border-white/10 hover:shadow-2xl
        ${className}
      `}
        >
            {/* Gradient accent at top */}
            <div
                className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentMap[accentColor] || accentMap.orange}`}
            />

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
                {icon && (
                    <span className={headerAccent[accentColor] || headerAccent.orange}>
                        {icon}
                    </span>
                )}
                <h2 className="text-base font-semibold text-gray-200">{title}</h2>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5">{children}</div>
        </section>
    );
}

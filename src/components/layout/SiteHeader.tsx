'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, FlaskConical, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: 'Console', icon: FlaskConical },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/auth/verify', label: 'Verify', icon: ShieldCheck },
];

export default function SiteHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
                        <Utensils className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        Tasty
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 border border-white/[0.06]">
                        Dev
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {navLinks.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`
                  flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-white/10 text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                    }
                `}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

'use client';

import React from 'react';

interface PageShellProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export default function PageShell({ title, description, children }: PageShellProps) {
    return (
        <main className="min-h-screen bg-[#09090b]">
            {/* Subtle background texture */}
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.04),transparent_60%)]" />

            <div className="relative mx-auto max-w-7xl px-6 py-8">
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
                    {description && (
                        <p className="mt-1.5 text-sm text-gray-500">{description}</p>
                    )}
                </div>

                {/* Page content */}
                <div className="space-y-6">{children}</div>
            </div>
        </main>
    );
}

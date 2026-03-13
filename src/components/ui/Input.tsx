'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
}

export default function Input({
    label,
    icon,
    error,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={inputId}
                className="text-xs font-medium uppercase tracking-wider text-gray-400"
            >
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    className={`
            w-full rounded-lg border border-white/10 bg-white/5
            px-3 py-2.5 text-sm text-gray-200
            placeholder:text-gray-600
            transition-all duration-200
            focus:border-orange-500/50 focus:bg-white/[0.07]
            focus:outline-none focus:ring-2 focus:ring-orange-500/20
            hover:border-white/20
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-red-400">{error}</span>
            )}
        </div>
    );
}

'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
    content: string;
    maxHeight?: string;
}

export default function CodeBlock({ content, maxHeight = '360px' }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0c]">
            {/* Copy button */}
            <button
                onClick={handleCopy}
                className="
          absolute right-3 top-3 z-10
          rounded-md border border-white/10 bg-white/5
          p-1.5 text-gray-500
          opacity-0 transition-all duration-200
          hover:bg-white/10 hover:text-gray-300
          group-hover:opacity-100
        "
                title="Copy to clipboard"
            >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            <pre
                className="overflow-auto p-4 text-xs leading-relaxed text-gray-300 font-mono"
                style={{ maxHeight }}
            >
                {content}
            </pre>
        </div>
    );
}

'use client';

import React from 'react';
import { Terminal, ScrollText, Trash2 } from 'lucide-react';
import { Card, CodeBlock, Button } from '../ui';
import { useConsoleStore } from '../../store/consoleStore';

export default function ResultViewer() {
    const { result, logs, clearLogs } = useConsoleStore();

    return (
        <div className="space-y-6">
            {/* API Result */}
            <Card title="API Result" icon={<Terminal className="h-4 w-4" />} accentColor="orange">
                <CodeBlock content={result} />
            </Card>

            {/* Activity Log */}
            <Card title="Activity Log" icon={<ScrollText className="h-4 w-4" />} accentColor="orange">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">{logs.length} entries</span>
                    {logs.length > 0 && (
                        <Button
                            variant="ghost"
                            onClick={clearLogs}
                            icon={<Trash2 className="h-3 w-3" />}
                            className="!px-2 !py-1 text-xs"
                        >
                            Clear
                        </Button>
                    )}
                </div>
                <div className="max-h-[260px] overflow-auto rounded-xl border border-white/[0.06] bg-[#0a0a0c]">
                    {logs.length > 0 ? (
                        <ul className="divide-y divide-white/[0.04]">
                            {logs.map((log, index) => (
                                <li
                                    key={`${log.time}-${index}`}
                                    className="flex items-start gap-3 px-4 py-2.5 text-sm"
                                >
                                    <span className="shrink-0 font-mono text-xs text-gray-600">
                                        {log.time}
                                    </span>
                                    <span
                                        className={`
                      ${log.message.includes('failed') ? 'text-red-400' : ''}
                      ${log.message.includes('success') ? 'text-emerald-400' : ''}
                      ${!log.message.includes('failed') && !log.message.includes('success') ? 'text-gray-400' : ''}
                    `}
                                    >
                                        {log.message}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center py-8 text-sm text-gray-700">
                            No activity yet
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

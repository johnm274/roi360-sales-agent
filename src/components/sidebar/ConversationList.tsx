'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConversationItem {
    id: string;
    title: string | null;
    useCase: string | null;
    updatedAt: string;
}

interface ConversationListProps {
    activeConversationId?: string | null;
    onRefreshKey?: number;
    onNewChat?: () => void;
}

export default function ConversationList({
    activeConversationId,
    onRefreshKey,
    onNewChat,
}: ConversationListProps) {
    const [conversations, setConversations] =
        useState<ConversationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, [onRefreshKey]);

    async function loadConversations() {
        setLoading(true);
        try {
            const res = await fetch(
                '/api/conversations',
            );
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch {
            // Ignore errors
        }
        setLoading(false);
    }

    const quickActions = [
        {
            key: 'qualify',
            label: 'Qualify a prospect',
        },
        {
            key: 'call-prep',
            label: 'Prepare for a call',
        },
        { key: 'email', label: 'Draft an email' },
        {
            key: 'objection',
            label: 'Handle an objection',
        },
        {
            key: 'pricing',
            label: 'Recommend pricing',
        },
        {
            key: 'proposal',
            label: 'Build a proposal',
        },
        {
            key: 'feature',
            label: 'Explain a feature',
        },
        {
            key: 'implementation',
            label: 'Plan implementation',
        },
    ];

    return (
        <div className="flex h-full flex-col">
            <div className="p-3">
                <button
                    onClick={onNewChat}
                    className="flex w-full items-center
                        justify-center gap-2 rounded-lg
                        border border-white/20 px-3
                        py-2 text-sm text-white
                        transition-colors
                        hover:bg-white/10"
                >
                    + New Chat
                </button>
            </div>

            {/* Quick Actions */}
            <div className="border-b border-white/10 px-2 pb-3">
                <h3
                    className="px-2 py-1 text-xs
                        font-semibold uppercase
                        tracking-wider text-gray-500"
                >
                    Quick Actions
                </h3>
                <div className="space-y-0.5">
                    {quickActions.map((action) => (
                        <Link
                            key={action.key}
                            href={`/chat?action=${action.key}`}
                            className="block rounded-md
                                px-3 py-1.5 text-xs
                                text-gray-400
                                transition-colors
                                hover:bg-white/10
                                hover:text-white"
                        >
                            {action.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div
                        className="p-3 text-xs
                            text-gray-400"
                    >
                        Loading...
                    </div>
                ) : conversations.length === 0 ? (
                    <div
                        className="p-3 text-xs
                            text-gray-400"
                    >
                        No conversations yet.
                    </div>
                ) : (
                    <div className="space-y-0.5 px-2">
                        <h3
                            className="px-2 py-1 text-xs
                                font-semibold uppercase
                                tracking-wider
                                text-gray-500"
                        >
                            Recent
                        </h3>
                        {conversations
                            .slice(0, 20)
                            .map((conv) => (
                                <Link
                                    key={conv.id}
                                    href={`/chat?c=${conv.id}`}
                                    className={`block
                                        rounded-lg px-3
                                        py-2 text-sm
                                        transition-colors
                                        hover:bg-white/10 ${
                                            activeConversationId ===
                                            conv.id
                                                ? 'bg-white/10 text-white'
                                                : 'text-gray-300'
                                        }`}
                                >
                                    <p
                                        className="truncate
                                            text-xs"
                                    >
                                        {conv.title ||
                                            'Untitled'}
                                    </p>
                                    <p
                                        className="text-[10px]
                                            text-gray-500"
                                    >
                                        {new Date(
                                            conv.updatedAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </Link>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import ChatWindow from './ChatWindow';
import ConversationList from '../sidebar/ConversationList';

interface ChatLayoutProps {
    initialAction?: string | null;
    initialConversationId?: string | null;
}

export default function ChatLayout({
    initialAction,
    initialConversationId,
}: ChatLayoutProps) {
    const [sidebarOpen, setSidebarOpen] =
        useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [chatResetKey, setChatResetKey] =
        useState(0);
    const [activeConversationId, setActiveConversationId] =
        useState<string | null>(
            initialConversationId || null,
        );

    function handleConversationCreated(id: string) {
        setActiveConversationId(id);
        setRefreshKey((k) => k + 1);
    }

    function handleNewChat() {
        setActiveConversationId(null);
        setChatResetKey((k) => k + 1);
    }

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div
                className={`flex-shrink-0 transition-all
                    duration-200 ${
                        sidebarOpen
                            ? 'w-64'
                            : 'w-0'
                    } overflow-hidden`}
            >
                <div
                    className="flex h-full w-64
                        flex-col border-r
                        border-gray-200 bg-[#1a1a2e]"
                >
                    <ConversationList
                        activeConversationId={
                            activeConversationId
                        }
                        onRefreshKey={refreshKey}
                        onNewChat={handleNewChat}
                    />
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Toggle sidebar button */}
                <div className="flex-1 overflow-hidden">
                    <div className="relative h-full">
                        <button
                            onClick={() =>
                                setSidebarOpen(
                                    !sidebarOpen,
                                )
                            }
                            className="absolute left-2
                                top-3 z-10 rounded-md
                                border border-gray-200
                                bg-white p-1.5 text-xs
                                text-gray-400
                                shadow-sm
                                hover:text-gray-600"
                            title={
                                sidebarOpen
                                    ? 'Hide sidebar'
                                    : 'Show sidebar'
                            }
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                        <ChatWindow
                            key={chatResetKey}
                            initialAction={
                                initialAction
                            }
                            initialConversationId={
                                initialConversationId
                            }
                            onConversationCreated={
                                handleConversationCreated
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

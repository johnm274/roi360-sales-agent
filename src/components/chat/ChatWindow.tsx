'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import OutputModeToggle from './OutputModeToggle';
import type { OutputMode } from '@/types/conversation';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatWindowProps {
    initialAction?: string | null;
    initialConversationId?: string | null;
    onConversationCreated?: (id: string) => void;
}

const ACTION_PROMPTS: Record<string, string> = {
    qualify:
        'I have a prospect I\'d like to qualify. Let me describe them...',
    'call-prep':
        'I need to prepare for a sales call. Here\'s the context...',
    email:
        'I need to draft an email. Here\'s the situation...',
    objection:
        'I\'m dealing with an objection from a prospect...',
    proposal:
        'I need to build a proposal section. Here\'s what I know...',
    pricing:
        'I need a pricing recommendation. Here\'s the client...',
    feature:
        'Can you explain a feature for me in plain language?',
    implementation:
        'I need help planning an implementation...',
};

export default function ChatWindow({
    initialAction,
    initialConversationId,
    onConversationCreated,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<
        ChatMessage[]
    >([]);
    const [isStreaming, setIsStreaming] =
        useState(false);
    const [conversationId, setConversationId] =
        useState<string | null>(
            initialConversationId || null,
        );
    const [outputMode, setOutputMode] =
        useState<OutputMode>('standard');
    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [messages]);

    // Load or reset conversation on navigation
    useEffect(() => {
        if (!initialConversationId) {
            setMessages([]);
            setConversationId(null);
            return;
        }

        async function loadMessages() {
            try {
                const res = await fetch(
                    `/api/conversations?id=${initialConversationId}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages) {
                        setMessages(
                            data.messages.map(
                                (m: {
                                    id: string;
                                    role: string;
                                    content: string;
                                }) => ({
                                    id: m.id,
                                    role: m.role as
                                        | 'user'
                                        | 'assistant',
                                    content: m.content,
                                }),
                            ),
                        );
                    }
                }
            } catch {
                // Ignore load errors
            }
        }

        loadMessages();
    }, [initialConversationId]);

    async function sendMessage(content: string) {
        if (!content.trim() || isStreaming) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
        };

        const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: '',
        };

        setMessages((prev) => [
            ...prev,
            userMsg,
            assistantMsg,
        ]);
        setIsStreaming(true);

        try {
            const response = await fetch(
                '/api/chat',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify({
                        message: content,
                        conversationId,
                        outputMode,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Chat failed: ${response.status}`,
                );
            }

            const reader =
                response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error(
                    'No response stream',
                );
            }

            let buffer = '';

            while (true) {
                const { done, value } =
                    await reader.read();
                if (done) break;

                buffer += decoder.decode(
                    value,
                    { stream: true },
                );

                const lines = buffer.split('\n');
                buffer =
                    lines[lines.length - 1];

                for (
                    let i = 0;
                    i < lines.length - 1;
                    i++
                ) {
                    const line = lines[i].trim();
                    if (
                        !line.startsWith('data: ')
                    )
                        continue;

                    const data = JSON.parse(
                        line.slice(6),
                    );

                    if (data.type === 'text') {
                        setMessages((prev) => {
                            if (
                                prev.length === 0
                            )
                                return prev;
                            const last =
                                prev[
                                    prev.length - 1
                                ];
                            if (
                                last.role !==
                                'assistant'
                            )
                                return prev;
                            return [
                                ...prev.slice(
                                    0,
                                    -1,
                                ),
                                {
                                    ...last,
                                    content:
                                        last.content +
                                        data.text,
                                },
                            ];
                        });
                    } else if (
                        data.type === 'done'
                    ) {
                        setConversationId(
                            data.conversationId,
                        );
                        onConversationCreated?.(
                            data.conversationId,
                        );
                    } else if (
                        data.type === 'error'
                    ) {
                        setMessages((prev) => {
                            if (
                                prev.length === 0
                            )
                                return prev;
                            const last =
                                prev[
                                    prev.length - 1
                                ];
                            if (
                                last.role !==
                                'assistant'
                            )
                                return prev;
                            return [
                                ...prev.slice(
                                    0,
                                    -1,
                                ),
                                {
                                    ...last,
                                    content: `Error: ${data.error}`,
                                },
                            ];
                        });
                    }
                }
            }
        } catch (error) {
            setMessages((prev) => {
                if (prev.length === 0) return prev;
                const last =
                    prev[prev.length - 1];
                if (last.role !== 'assistant')
                    return prev;
                return [
                    ...prev.slice(0, -1),
                    {
                        ...last,
                        content:
                            error instanceof Error
                                ? `Error: ${error.message}`
                                : 'An error occurred',
                    },
                ];
            });
        } finally {
            setIsStreaming(false);
        }
    }

    const placeholder = initialAction
        ? ACTION_PROMPTS[initialAction] ||
          'Ask me anything about selling ROI360...'
        : 'Ask me anything about selling ROI360...';

    return (
        <div className="flex h-full flex-col">
            <div
                className="flex items-center
                    justify-between border-b
                    border-gray-200 px-4 py-2"
            >
                <span className="text-sm text-gray-500">
                    {conversationId
                        ? 'Conversation active'
                        : 'New conversation'}
                </span>
                <OutputModeToggle
                    mode={outputMode}
                    onChange={setOutputMode}
                />
            </div>

            <div
                className="flex-1 overflow-y-auto
                    px-4 py-6"
            >
                {messages.length === 0 && (
                    <div
                        className="flex h-full
                            flex-col items-center
                            justify-center text-center"
                    >
                        <h2
                            className="mb-2 text-xl
                                font-bold"
                            style={{
                                color: '#c8102e',
                            }}
                        >
                            ROI360 Sales Agent
                        </h2>
                        <p
                            className="mb-6 max-w-md
                                text-sm text-gray-500"
                        >
                            Your AI sales consultant.
                            Describe a prospect, ask
                            for help with a call,
                            draft an email, or get
                            advice on pricing and
                            objection handling.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                        isStreaming={
                            isStreaming &&
                            msg.id ===
                                messages[
                                    messages.length -
                                        1
                                ]?.id &&
                            msg.role ===
                                'assistant'
                        }
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <InputBar
                onSend={sendMessage}
                disabled={isStreaming}
                placeholder={placeholder}
            />
        </div>
    );
}

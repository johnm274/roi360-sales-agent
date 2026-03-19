'use client';

import CopyButton from '@/components/shared/CopyButton';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

export default function MessageBubble({
    role,
    content,
    isStreaming,
}: MessageBubbleProps) {
    const isUser = role === 'user';

    return (
        <div
            className={`group mb-4 flex ${
                isUser
                    ? 'justify-end'
                    : 'justify-start'
            }`}
        >
            <div
                className={`relative max-w-[80%] rounded-2xl
                    px-4 py-3 ${
                        isUser
                            ? 'bg-[#c8102e] text-white'
                            : 'bg-gray-100 text-gray-800'
                    }`}
            >
                {!isUser &&
                    content &&
                    !isStreaming && (
                        <div
                            className="absolute -top-2
                                right-2 opacity-0
                                transition-opacity
                                group-hover:opacity-100"
                        >
                            <CopyButton
                                text={content}
                            />
                        </div>
                    )}
                {isUser ? (
                    <p className="text-sm whitespace-pre-wrap">
                        {content}
                    </p>
                ) : (
                    <div className="prose prose-sm max-w-none">
                        <MarkdownContent
                            content={content}
                        />
                        {isStreaming &&
                            !content && (
                                <span
                                    className="inline-block
                                        h-4 w-2
                                        animate-pulse
                                        bg-gray-400"
                                />
                            )}
                        {isStreaming &&
                            content && (
                                <span
                                    className="inline-block
                                        h-4 w-0.5
                                        animate-pulse
                                        bg-gray-400"
                                />
                            )}
                    </div>
                )}
            </div>
        </div>
    );
}

function MarkdownContent({
    content,
}: {
    content: string;
}) {
    // Simple markdown rendering — bold, headers,
    // bullet points, line breaks
    const lines = content.split('\n');

    return (
        <div className="text-sm leading-relaxed">
            {lines.map((line, i) => {
                // Headers
                if (line.startsWith('### ')) {
                    return (
                        <h4
                            key={i}
                            className="mb-1 mt-3
                                font-bold text-gray-900"
                        >
                            {processInline(
                                line.slice(4),
                            )}
                        </h4>
                    );
                }
                if (line.startsWith('## ')) {
                    return (
                        <h3
                            key={i}
                            className="mb-2 mt-4 text-base
                                font-bold text-gray-900"
                        >
                            {processInline(
                                line.slice(3),
                            )}
                        </h3>
                    );
                }
                if (line.startsWith('# ')) {
                    return (
                        <h2
                            key={i}
                            className="mb-2 mt-4 text-lg
                                font-bold text-gray-900"
                        >
                            {processInline(
                                line.slice(2),
                            )}
                        </h2>
                    );
                }

                // Bullet points
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                        <div
                            key={i}
                            className="ml-4 flex gap-2"
                        >
                            <span className="text-gray-400">
                                &bull;
                            </span>
                            <span>
                                {processInline(
                                    line.slice(2),
                                )}
                            </span>
                        </div>
                    );
                }

                // Numbered lists
                const numMatch = line.match(
                    /^(\d+)\.\s/,
                );
                if (numMatch) {
                    return (
                        <div
                            key={i}
                            className="ml-4 flex gap-2"
                        >
                            <span className="text-gray-500">
                                {numMatch[1]}.
                            </span>
                            <span>
                                {processInline(
                                    line.slice(
                                        numMatch[0]
                                            .length,
                                    ),
                                )}
                            </span>
                        </div>
                    );
                }

                // Empty lines
                if (!line.trim()) {
                    return (
                        <div
                            key={i}
                            className="h-2"
                        />
                    );
                }

                // Regular paragraphs
                return (
                    <p key={i} className="mb-1">
                        {processInline(line)}
                    </p>
                );
            })}
        </div>
    );
}

function processInline(
    text: string,
): React.ReactNode {
    // Process bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (
            part.startsWith('**') &&
            part.endsWith('**')
        ) {
            return (
                <strong key={i}>
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
}

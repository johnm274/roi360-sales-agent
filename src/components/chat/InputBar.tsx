'use client';

import { useState, useRef } from 'react';

interface InputBarProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function InputBar({
    onSend,
    disabled,
    placeholder,
}: InputBarProps) {
    const [input, setInput] = useState('');
    const textareaRef =
        useRef<HTMLTextAreaElement>(null);

    function handleSubmit(
        e: React.FormEvent,
    ) {
        e.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input.trim());
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height =
                'auto';
        }
    }

    function handleKeyDown(
        e: React.KeyboardEvent,
    ) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(
                e as unknown as React.FormEvent,
            );
        }
    }

    function handleInput() {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${Math.min(
                el.scrollHeight,
                200,
            )}px`;
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200
                bg-white p-4"
        >
            <div
                className="mx-auto flex max-w-3xl
                    items-end gap-3"
            >
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) =>
                        setInput(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder={
                        placeholder ||
                        'Ask me anything...'
                    }
                    disabled={disabled}
                    rows={1}
                    className="flex-1 resize-none
                        rounded-xl border
                        border-gray-300 px-4
                        py-2.5 text-sm
                        focus:border-[#c8102e]
                        focus:outline-none
                        focus:ring-1
                        focus:ring-[#c8102e]
                        disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={
                        disabled || !input.trim()
                    }
                    className="rounded-xl px-5
                        py-2.5 text-sm font-medium
                        text-white
                        transition-colors
                        disabled:opacity-50"
                    style={{
                        backgroundColor:
                            '#c8102e',
                    }}
                >
                    {disabled
                        ? 'Thinking...'
                        : 'Send'}
                </button>
            </div>
            <p
                className="mt-2 text-center text-xs
                    text-gray-400"
            >
                Shift+Enter for new line. The
                agent advises — always validate
                with the client.
            </p>
        </form>
    );
}

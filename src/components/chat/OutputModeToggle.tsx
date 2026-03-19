'use client';

import type { OutputMode } from '@/types/conversation';

interface OutputModeToggleProps {
    mode: OutputMode;
    onChange: (mode: OutputMode) => void;
}

const modes: {
    value: OutputMode;
    label: string;
}[] = [
    { value: 'eli12', label: 'Simple' },
    { value: 'standard', label: 'Standard' },
    { value: 'board', label: 'Board-level' },
];

export default function OutputModeToggle({
    mode,
    onChange,
}: OutputModeToggleProps) {
    return (
        <div
            className="flex items-center gap-1
                rounded-lg bg-gray-100 p-0.5"
        >
            {modes.map((m) => (
                <button
                    key={m.value}
                    onClick={() =>
                        onChange(m.value)
                    }
                    className={`rounded-md px-3 py-1
                        text-xs font-medium
                        transition-colors ${
                            mode === m.value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {m.label}
                </button>
            ))}
        </div>
    );
}

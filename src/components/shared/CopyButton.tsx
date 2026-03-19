'use client';

import { useState } from 'react';

interface CopyButtonProps {
    text: string;
}

export default function CopyButton({
    text,
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={handleCopy}
            className="rounded-md border
                border-gray-200 px-2 py-1
                text-[10px] text-gray-400
                transition-colors
                hover:bg-gray-100
                hover:text-gray-600"
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

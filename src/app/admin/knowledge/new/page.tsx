'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewKnowledgePage() {
    const router = useRouter();
    const [filename, setFilename] = useState('');
    const [content, setContent] = useState(
        '# New Knowledge File\n\n',
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function handleCreate() {
        if (!filename.trim()) {
            setError('Filename is required');
            return;
        }

        setSaving(true);
        setError('');

        const res = await fetch(
            '/api/admin/knowledge',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify({
                    filename: filename.trim(),
                    content,
                }),
            },
        );

        if (res.ok) {
            router.push('/admin/knowledge');
        } else {
            const data = await res.json();
            setError(
                data.error || 'Failed to create',
            );
        }
        setSaving(false);
    }

    return (
        <div className="mx-auto max-w-5xl p-8">
            <div className="mb-6">
                <Link
                    href="/admin/knowledge"
                    className="text-xs text-gray-500
                        hover:text-gray-700"
                >
                    &larr; Back to Knowledge
                    Manager
                </Link>
                <h1 className="mt-1 text-xl font-bold">
                    Add New Knowledge
                </h1>
            </div>

            <div className="mb-4">
                <label
                    className="mb-1 block text-sm
                        font-medium text-gray-700"
                >
                    Filename
                </label>
                <input
                    type="text"
                    value={filename}
                    onChange={(e) =>
                        setFilename(e.target.value)
                    }
                    placeholder="e.g., case-study-franchise"
                    className="w-full max-w-md
                        rounded-lg border
                        border-gray-300 px-4
                        py-2.5 text-sm
                        focus:border-[#c8102e]
                        focus:outline-none
                        focus:ring-1
                        focus:ring-[#c8102e]"
                />
                <p className="mt-1 text-xs text-gray-400">
                    Will be saved as{' '}
                    {filename
                        ? filename.replace(
                              /[^a-zA-Z0-9-_.]/g,
                              '-',
                          ) + '.md'
                        : '_.md'}
                </p>
            </div>

            {error && (
                <p className="mb-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div
                className="rounded-xl border
                    border-gray-200 bg-white"
            >
                <textarea
                    value={content}
                    onChange={(e) =>
                        setContent(e.target.value)
                    }
                    className="h-[60vh] w-full
                        resize-none rounded-xl
                        p-6 font-mono text-sm
                        leading-relaxed
                        focus:outline-none"
                    spellCheck={false}
                />
            </div>

            <div className="mt-4 flex gap-3">
                <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="rounded-lg px-6
                        py-2.5 text-sm
                        font-medium text-white
                        disabled:opacity-50"
                    style={{
                        backgroundColor: '#c8102e',
                    }}
                >
                    {saving
                        ? 'Creating...'
                        : 'Create File'}
                </button>
                <Link
                    href="/admin/knowledge"
                    className="rounded-lg border
                        border-gray-300 px-6
                        py-2.5 text-sm
                        text-gray-600
                        hover:bg-gray-50"
                >
                    Cancel
                </Link>
            </div>
        </div>
    );
}

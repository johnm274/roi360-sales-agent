'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditKnowledgePage() {
    const params = useParams();
    const router = useRouter();
    const filename = params.filename as string;

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadFile();
    }, [filename]);

    async function loadFile() {
        setLoading(true);
        const res = await fetch(
            `/api/admin/knowledge/${encodeURIComponent(filename)}`,
        );
        if (res.ok) {
            const data = await res.json();
            setContent(data.content);
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        setSaved(false);

        await fetch(
            `/api/admin/knowledge/${encodeURIComponent(filename)}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify({ content }),
            },
        );

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl p-8">
                <p className="text-gray-500">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl p-8">
            <div
                className="mb-6 flex items-center
                    justify-between"
            >
                <div>
                    <Link
                        href="/admin/knowledge"
                        className="text-xs text-gray-500
                            hover:text-gray-700"
                    >
                        &larr; Back to Knowledge
                        Manager
                    </Link>
                    <h1 className="mt-1 text-xl font-bold">
                        {decodeURIComponent(
                            filename,
                        )}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="text-sm text-green-600">
                            Saved!
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg px-4
                            py-2 text-sm
                            font-medium text-white
                            disabled:opacity-50"
                        style={{
                            backgroundColor:
                                '#c8102e',
                        }}
                    >
                        {saving
                            ? 'Saving...'
                            : 'Save'}
                    </button>
                </div>
            </div>

            <div
                className="rounded-xl border
                    border-gray-200 bg-white"
            >
                <textarea
                    value={content}
                    onChange={(e) =>
                        setContent(e.target.value)
                    }
                    className="h-[70vh] w-full
                        resize-none rounded-xl
                        p-6 font-mono text-sm
                        leading-relaxed
                        focus:outline-none"
                    spellCheck={false}
                />
            </div>

            <p
                className="mt-3 text-xs
                    text-gray-400"
            >
                Edit the markdown content above.
                Use # for headings, - for bullet
                points, **bold** for emphasis.
                Changes take effect on the next
                conversation.
            </p>
        </div>
    );
}

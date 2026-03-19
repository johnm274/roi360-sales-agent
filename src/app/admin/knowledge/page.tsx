'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface KnowledgeFile {
    id: string;
    filename: string;
    title: string;
    category: string;
    size: number;
    modified: string;
    preview: string;
}

export default function KnowledgeManagerPage() {
    const [files, setFiles] = useState<
        KnowledgeFile[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadFiles();
    }, []);

    async function loadFiles() {
        setLoading(true);
        const res = await fetch(
            '/api/admin/knowledge',
        );
        const data = await res.json();
        setFiles(data);
        setLoading(false);
    }

    async function deleteFile(filename: string) {
        if (
            !confirm(
                `Delete "${filename}"? This cannot be undone.`,
            )
        )
            return;

        await fetch('/api/admin/knowledge', {
            method: 'DELETE',
            headers: {
                'Content-Type':
                    'application/json',
            },
            body: JSON.stringify({ filename }),
        });
        loadFiles();
    }

    const filtered = files.filter(
        (f) =>
            f.title
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            f.category
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    return (
        <div className="mx-auto max-w-5xl p-8">
            <div
                className="mb-8 flex items-center
                    justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold">
                        Knowledge Manager
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage what the AI Sales
                        Agent knows. Edit files,
                        add new knowledge, or
                        remove outdated content.
                    </p>
                </div>
                <Link
                    href="/admin/knowledge/new"
                    className="rounded-lg px-4 py-2
                        text-sm font-medium
                        text-white"
                    style={{
                        backgroundColor: '#c8102e',
                    }}
                >
                    + Add New
                </Link>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search knowledge files..."
                    className="w-full rounded-lg
                        border border-gray-300
                        px-4 py-2.5 text-sm
                        focus:border-[#c8102e]
                        focus:outline-none
                        focus:ring-1
                        focus:ring-[#c8102e]"
                />
            </div>

            {loading ? (
                <p className="text-gray-500">
                    Loading...
                </p>
            ) : filtered.length === 0 ? (
                <p className="text-gray-500">
                    No knowledge files found.
                </p>
            ) : (
                <div className="space-y-3">
                    {filtered.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center
                                justify-between
                                rounded-xl border
                                border-gray-200
                                bg-white p-4"
                        >
                            <div className="flex-1">
                                <Link
                                    href={`/admin/knowledge/${encodeURIComponent(file.filename)}`}
                                    className="text-sm
                                        font-semibold
                                        text-gray-800
                                        hover:text-[#c8102e]"
                                >
                                    {file.title}
                                </Link>
                                <p
                                    className="mt-0.5
                                        text-xs
                                        text-gray-500"
                                >
                                    {file.filename}{' '}
                                    &middot;{' '}
                                    {(
                                        file.size /
                                        1024
                                    ).toFixed(1)}
                                    KB &middot;
                                    Modified{' '}
                                    {new Date(
                                        file.modified,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/knowledge/${encodeURIComponent(file.filename)}`}
                                    className="rounded-md
                                        border
                                        border-gray-300
                                        px-3 py-1
                                        text-xs
                                        text-gray-600
                                        hover:bg-gray-50"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() =>
                                        deleteFile(
                                            file.filename,
                                        )
                                    }
                                    className="rounded-md
                                        border
                                        border-red-200
                                        px-3 py-1
                                        text-xs
                                        text-red-600
                                        hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div
                className="mt-8 rounded-xl border
                    border-blue-100 bg-blue-50 p-4"
            >
                <h3
                    className="mb-1 text-sm
                        font-semibold text-blue-800"
                >
                    How this works
                </h3>
                <p className="text-xs text-blue-700">
                    These markdown files are what
                    the AI Sales Agent uses to
                    answer partner questions. Edit
                    them to update pricing,
                    objection scripts, product
                    knowledge, or any other
                    information. Changes take
                    effect immediately on the next
                    conversation.
                </p>
            </div>
        </div>
    );
}

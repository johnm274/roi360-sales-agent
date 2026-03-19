'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header
            className="flex h-14 items-center
                justify-between border-b
                border-gray-200 px-6"
            style={{ backgroundColor: '#1a1a2e' }}
        >
            <div className="flex items-center gap-6">
                <Link
                    href="/dashboard"
                    className="text-xl font-bold text-white"
                >
                    <span style={{ color: '#c8102e' }}>
                        ROI360
                    </span>{' '}
                    <span className="text-sm font-normal text-gray-300">
                        Sales Agent
                    </span>
                </Link>

                <nav className="flex gap-4">
                    <Link
                        href="/dashboard"
                        className="text-sm text-gray-300
                            hover:text-white"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/chat"
                        className="text-sm text-gray-300
                            hover:text-white"
                    >
                        Chat
                    </Link>
                    {session?.user?.isAdmin && (
                        <Link
                            href="/admin/knowledge"
                            className="text-sm text-gray-300
                                hover:text-white"
                        >
                            Admin
                        </Link>
                    )}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                    {session?.user?.name}
                    {session?.user?.companyName && (
                        <span className="text-gray-500">
                            {' '}
                            &middot;{' '}
                            {session.user.companyName}
                        </span>
                    )}
                </span>
                <button
                    onClick={() => signOut()}
                    className="rounded-md px-3 py-1 text-sm
                        text-gray-400 transition-colors
                        hover:bg-white/10 hover:text-white"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(
        e: React.FormEvent,
    ) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError(
                'Invalid email or password',
            );
        } else {
            router.push('/dashboard');
        }
    }

    return (
        <div
            className="flex min-h-screen items-center
                justify-center"
            style={{
                background:
                    'linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 100%)',
            }}
        >
            <div
                className="w-full max-w-md rounded-2xl
                    bg-white p-8 shadow-xl"
            >
                <div className="mb-8 text-center">
                    <h1
                        className="text-3xl font-bold"
                        style={{ color: '#c8102e' }}
                    >
                        ROI360
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        AI Sales Agent
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm
                                font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            className="w-full rounded-lg border
                                border-gray-300 px-4 py-2.5
                                text-sm focus:border-[#c8102e]
                                focus:outline-none focus:ring-1
                                focus:ring-[#c8102e]"
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm
                                font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            className="w-full rounded-lg border
                                border-gray-300 px-4 py-2.5
                                text-sm focus:border-[#c8102e]
                                focus:outline-none focus:ring-1
                                focus:ring-[#c8102e]"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <p
                            className="mb-4 text-center
                                text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg px-4
                            py-2.5 text-sm font-medium
                            text-white transition-colors
                            disabled:opacity-50"
                        style={{
                            backgroundColor: '#c8102e',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor =
                                    '#a50d24';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                '#c8102e';
                        }}
                    >
                        {loading
                            ? 'Signing in...'
                            : 'Sign In'}
                    </button>
                </form>

                <p
                    className="mt-6 text-center text-xs
                        text-gray-400"
                >
                    Brand and Marketing Control
                    Software
                </p>
            </div>
        </div>
    );
}

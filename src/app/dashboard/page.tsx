import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import Header from '@/components/shared/Header';
import Link from 'next/link';

const quickActions = [
    {
        label: 'Qualify a prospect',
        description:
            'Describe a customer and get ICP scoring',
        href: '/chat?action=qualify',
    },
    {
        label: 'Prepare for a call',
        description:
            'Generate discovery questions and talk track',
        href: '/chat?action=call-prep',
    },
    {
        label: 'Draft an email',
        description:
            'Intro, follow-up, or proposal email',
        href: '/chat?action=email',
    },
    {
        label: 'Handle an objection',
        description:
            'Get a scripted response to pushback',
        href: '/chat?action=objection',
    },
    {
        label: 'Build a proposal section',
        description:
            'Value story from discovery notes',
        href: '/chat?action=proposal',
    },
    {
        label: 'Recommend pricing',
        description:
            'Tier and commercial model recommendation',
        href: '/chat?action=pricing',
    },
    {
        label: 'Explain a feature',
        description:
            'Plain-language feature explanation',
        href: '/chat?action=feature',
    },
    {
        label: 'Plan implementation',
        description:
            'POC structure, milestones, timeline',
        href: '/chat?action=implementation',
    },
];

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-gray-50 p-8">
                <div className="mx-auto max-w-5xl">
                    <h1 className="mb-2 text-2xl font-bold">
                        Welcome back,{' '}
                        {session.user.name}
                    </h1>
                    <p className="mb-8 text-gray-500">
                        Your AI sales consultant is
                        ready. What would you like to
                        work on?
                    </p>

                    <div className="mb-8">
                        <Link
                            href="/chat"
                            className="inline-flex items-center
                                gap-2 rounded-lg px-6 py-3
                                text-sm font-medium text-white
                                transition-colors"
                            style={{
                                backgroundColor: '#c8102e',
                            }}
                        >
                            Start New Conversation
                        </Link>
                    </div>

                    <h2
                        className="mb-4 text-lg
                            font-semibold text-gray-700"
                    >
                        Quick Actions
                    </h2>
                    <div
                        className="grid grid-cols-1 gap-4
                            sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="rounded-xl border
                                    border-gray-200 bg-white
                                    p-5 transition-all
                                    hover:border-[#c8102e]/30
                                    hover:shadow-md"
                            >
                                <h3
                                    className="mb-1 text-sm
                                        font-semibold
                                        text-gray-800"
                                >
                                    {action.label}
                                </h3>
                                <p
                                    className="text-xs
                                        text-gray-500"
                                >
                                    {action.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import Header from '@/components/shared/Header';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    if (!session.user.isAdmin) {
        redirect('/dashboard');
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    );
}

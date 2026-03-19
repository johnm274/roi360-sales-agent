import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import Header from '@/components/shared/Header';
import ChatLayout from '@/components/chat/ChatLayout';

interface ChatPageProps {
    searchParams: Promise<{
        action?: string;
        c?: string;
    }>;
}

export default async function ChatPage({
    searchParams,
}: ChatPageProps) {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const params = await searchParams;
    const action = params.action || null;
    const conversationId = params.c || null;

    return (
        <div className="flex h-screen flex-col">
            <Header />
            <main
                className="flex-1 overflow-hidden
                    bg-gray-50"
            >
                <ChatLayout
                    initialAction={action}
                    initialConversationId={
                        conversationId
                    }
                />
            </main>
        </div>
    );
}

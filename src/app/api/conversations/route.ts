import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import {
    conversations,
    messages,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 },
        );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // If an ID is provided, return that
    // conversation with its messages
    if (id) {
        const convRows = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, id));

        const conv = convRows[0];

        if (
            !conv ||
            conv.partnerId !== session.user.id
        ) {
            return NextResponse.json(
                { error: 'Not found' },
                { status: 404 },
            );
        }

        const msgs = await db
            .select()
            .from(messages)
            .where(
                eq(messages.conversationId, id),
            )
            .orderBy(messages.createdAt);

        return NextResponse.json({
            ...conv,
            messages: msgs,
        });
    }

    // Otherwise list all conversations
    const convs = await db
        .select()
        .from(conversations)
        .where(
            eq(
                conversations.partnerId,
                session.user.id,
            ),
        )
        .orderBy(desc(conversations.updatedAt));

    return NextResponse.json(convs);
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 },
        );
    }

    const { id } = await req.json();

    // Verify ownership
    const convRows = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, id));

    const conv = convRows[0];

    if (
        !conv ||
        conv.partnerId !== session.user.id
    ) {
        return NextResponse.json(
            { error: 'Not found' },
            { status: 404 },
        );
    }

    // Delete messages first, then conversation
    await db
        .delete(messages)
        .where(eq(messages.conversationId, id));
    await db
        .delete(conversations)
        .where(eq(conversations.id, id));

    return NextResponse.json({ success: true });
}

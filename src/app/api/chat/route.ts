import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';
import { getAnthropicClient } from '@/lib/ai/client';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { getContextForMessage } from '@/lib/knowledge/retriever';
import { db } from '@/lib/db/client';
import {
    partners,
    conversations,
    messages,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { OutputMode } from '@/types/conversation';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    const body = await req.json();
    const {
        message,
        conversationId,
        outputMode = 'standard',
    } = body as {
        message: string;
        conversationId?: string;
        outputMode?: OutputMode;
    };

    if (!message?.trim()) {
        return new Response('Message is required', {
            status: 400,
        });
    }

    // Get partner profile
    const partnerRows = await db
        .select()
        .from(partners)
        .where(eq(partners.id, session.user.id));

    const partner = partnerRows[0];

    if (!partner) {
        return new Response('Partner not found', {
            status: 404,
        });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
        convId = uuidv4();
        await db.insert(conversations).values({
            id: convId,
            partnerId: partner.id,
            title: message.slice(0, 100),
            outputMode,
        });
    }

    // Save user message
    await db.insert(messages).values({
        id: uuidv4(),
        conversationId: convId,
        role: 'user',
        content: message,
    });

    // Load conversation history
    const allHistory = await db
        .select()
        .from(messages)
        .where(
            eq(messages.conversationId, convId),
        );
    const history = allHistory.slice(-20);

    // Build context
    const contextKnowledge =
        await getContextForMessage(message);
    const sectors = partner.sectors
        ? JSON.parse(partner.sectors)
        : null;
    const systemPrompt = buildSystemPrompt(
        partner.name,
        partner.companyName,
        sectors,
        partner.strengths,
        partner.notes,
        outputMode,
        contextKnowledge,
    );

    // Build messages for Claude
    const claudeMessages = history.map((m) => ({
        role: (m.role === 'user'
            ? 'user'
            : 'assistant') as 'user' | 'assistant',
        content: m.content,
    }));

    // Stream response
    const client = getAnthropicClient();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            let fullResponse = '';

            try {
                const response =
                    client.messages.stream({
                        model: 'claude-sonnet-4-20250514',
                        max_tokens: 4096,
                        system: systemPrompt,
                        messages: claudeMessages,
                    });

                for await (const event of response) {
                    if (
                        event.type ===
                            'content_block_delta' &&
                        event.delta.type ===
                            'text_delta'
                    ) {
                        const text =
                            event.delta.text;
                        fullResponse += text;
                        const data =
                            JSON.stringify({
                                type: 'text',
                                text,
                            });
                        controller.enqueue(
                            encoder.encode(
                                `data: ${data}\n\n`,
                            ),
                        );
                    }
                }

                // Save assistant response
                await db
                    .insert(messages)
                    .values({
                        id: uuidv4(),
                        conversationId: convId!,
                        role: 'assistant',
                        content: fullResponse,
                    });

                // Send done event with conversation ID
                const doneData = JSON.stringify({
                    type: 'done',
                    conversationId: convId,
                });
                controller.enqueue(
                    encoder.encode(
                        `data: ${doneData}\n\n`,
                    ),
                );
            } catch (error) {
                let errMsg =
                    error instanceof Error
                        ? error.message
                        : 'Unknown error';
                if (
                    errMsg.includes(
                        'ANTHROPIC_API_KEY',
                    )
                ) {
                    errMsg =
                        'API key not configured. Please set ANTHROPIC_API_KEY in .env.local';
                }
                const errData = JSON.stringify({
                    type: 'error',
                    error: errMsg,
                });
                controller.enqueue(
                    encoder.encode(
                        `data: ${errData}\n\n`,
                    ),
                );
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}

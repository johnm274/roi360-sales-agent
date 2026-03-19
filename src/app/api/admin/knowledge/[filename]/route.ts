import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { knowledgeFiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    _req: NextRequest,
    {
        params,
    }: { params: Promise<{ filename: string }> },
) {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 },
        );
    }

    const { filename } = await params;

    try {
        const rows = await db
            .select()
            .from(knowledgeFiles)
            .where(
                eq(
                    knowledgeFiles.filename,
                    filename,
                ),
            );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 },
            );
        }

        return NextResponse.json({
            filename: rows[0].filename,
            content: rows[0].content,
        });
    } catch {
        return NextResponse.json(
            { error: 'File not found' },
            { status: 404 },
        );
    }
}

export async function PUT(
    req: NextRequest,
    {
        params,
    }: { params: Promise<{ filename: string }> },
) {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 },
        );
    }

    const { filename } = await params;
    const { content } = await req.json();

    try {
        await db
            .update(knowledgeFiles)
            .set({
                content,
                updatedAt:
                    new Date().toISOString(),
            })
            .where(
                eq(
                    knowledgeFiles.filename,
                    filename,
                ),
            );

        return NextResponse.json({
            success: true,
        });
    } catch {
        return NextResponse.json(
            { error: 'Failed to save' },
            { status: 500 },
        );
    }
}

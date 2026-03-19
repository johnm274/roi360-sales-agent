import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { knowledgeFiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 },
        );
    }

    try {
        const files = await db
            .select()
            .from(knowledgeFiles);

        const fileList = files.map((file) => {
            const firstLine =
                (file.content || '')
                    .split('\n')[0] || '';
            const title = firstLine
                .replace(/^#+\s*/, '')
                .trim();

            return {
                id: file.id,
                filename: file.filename,
                title: title || file.filename,
                category: file.category,
                size: (file.content || '').length,
                modified: file.updatedAt,
                preview:
                    (file.content || '').slice(
                        0,
                        200,
                    ) + '...',
            };
        });

        return NextResponse.json(fileList);
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 },
        );
    }

    const { filename, content, category } =
        await req.json();

    if (!filename || !content) {
        return NextResponse.json(
            {
                error:
                    'Filename and content required',
            },
            { status: 400 },
        );
    }

    // Sanitise filename
    const safeName =
        filename
            .replace(/[^a-zA-Z0-9-_.]/g, '-')
            .replace(/\.md$/, '') + '.md';

    const derivedCategory =
        category ||
        safeName
            .replace('.md', '')
            .replace(/-/g, ' ');

    const id = uuidv4();

    await db.insert(knowledgeFiles).values({
        id,
        filename: safeName,
        category: derivedCategory,
        content,
    });

    return NextResponse.json({
        id,
        filename: safeName,
        success: true,
    });
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 },
        );
    }

    const { filename } = await req.json();

    try {
        await db
            .delete(knowledgeFiles)
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
            { error: 'File not found' },
            { status: 404 },
        );
    }
}

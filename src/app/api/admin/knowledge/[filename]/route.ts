import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import fs from 'fs';
import path from 'path';

function getKnowledgeDir(): string {
    return (
        process.env.KNOWLEDGE_SOURCE_DIR ||
        path.join(
            process.cwd(),
            'knowledge',
            'source',
        )
    );
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ filename: string }> },
) {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 },
        );
    }

    const { filename } = await params;
    const dir = getKnowledgeDir();
    const filePath = path.join(dir, filename);

    try {
        const content = fs.readFileSync(
            filePath,
            'utf-8',
        );
        return NextResponse.json({
            filename,
            content,
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
    { params }: { params: Promise<{ filename: string }> },
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

    const dir = getKnowledgeDir();
    const filePath = path.join(dir, filename);

    try {
        fs.writeFileSync(
            filePath,
            content,
            'utf-8',
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

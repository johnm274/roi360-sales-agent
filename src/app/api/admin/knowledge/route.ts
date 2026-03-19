import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

export async function GET() {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 },
        );
    }

    const dir = getKnowledgeDir();

    try {
        const files = fs
            .readdirSync(dir)
            .filter((f) => f.endsWith('.md'));

        const fileList = files.map((filename) => {
            const filePath = path.join(
                dir,
                filename,
            );
            const stats = fs.statSync(filePath);
            const content = fs.readFileSync(
                filePath,
                'utf-8',
            );
            const firstLine =
                content.split('\n')[0] || '';
            const title = firstLine
                .replace(/^#+\s*/, '')
                .trim();

            // Derive category from filename
            const category = filename
                .replace('.md', '')
                .replace(/-/g, ' ');

            return {
                id: filename,
                filename,
                title: title || filename,
                category,
                size: stats.size,
                modified: stats.mtime.toISOString(),
                preview:
                    content.slice(0, 200) + '...',
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

    const { filename, content } =
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
    const safeName = filename
        .replace(/[^a-zA-Z0-9-_.]/g, '-')
        .replace(/\.md$/, '') + '.md';

    const dir = getKnowledgeDir();
    const filePath = path.join(dir, safeName);

    fs.writeFileSync(filePath, content, 'utf-8');

    return NextResponse.json({
        id: safeName,
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
    const dir = getKnowledgeDir();
    const filePath = path.join(dir, filename);

    try {
        fs.unlinkSync(filePath);
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

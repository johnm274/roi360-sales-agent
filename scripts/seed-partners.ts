import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { hashSync } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as schema from '../src/lib/db/schema';
import path from 'path';
import fs from 'fs';

const dbUrl =
    process.env.TURSO_DATABASE_URL ||
    'file:./data/sales-agent.db';
const authToken =
    process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({
    url: dbUrl,
    authToken,
});

const db = drizzle(client, { schema });

const seedPartners = [
    {
        id: uuidv4(),
        name: 'John Murphy',
        email: 'john@roi360.co.uk',
        passwordHash: hashSync('admin123', 12),
        companyName: 'ROI360',
        sectors: JSON.stringify([
            'Print',
            'Marketing Services',
        ]),
        strengths:
            'Platform owner, deep product knowledge',
        notes: 'Admin account',
        isAdmin: true,
    },
    {
        id: uuidv4(),
        name: 'Stuart Davies',
        email: 'stuart@roi360.co.uk',
        passwordHash: hashSync('sales123', 12),
        companyName: 'ROI360',
        sectors: JSON.stringify([
            'Print',
            'Franchise',
        ]),
        strengths:
            'New business, pipeline generation',
        notes: 'Sales manager',
        isAdmin: false,
    },
    {
        id: uuidv4(),
        name: 'Demo Partner',
        email: 'demo@example.com',
        passwordHash: hashSync('demo123', 12),
        companyName: 'Acme Print Services',
        sectors: JSON.stringify([
            'Commercial Print',
            'Marketing Services',
        ]),
        strengths:
            'Strong local relationships, good service reputation',
        notes: 'Demo partner account for testing',
        isAdmin: false,
    },
];

async function seedKnowledgeFiles() {
    const knowledgeDir = path.join(
        process.cwd(),
        'knowledge',
        'source',
    );

    if (!fs.existsSync(knowledgeDir)) {
        console.log(
            'No knowledge/source directory found, skipping knowledge seeding.',
        );
        return;
    }

    const files = fs
        .readdirSync(knowledgeDir)
        .filter((f) => f.endsWith('.md'));

    console.log(
        `\nSeeding ${files.length} knowledge files...`,
    );

    for (const filename of files) {
        const filePath = path.join(
            knowledgeDir,
            filename,
        );
        const content = fs.readFileSync(
            filePath,
            'utf-8',
        );
        const category = filename
            .replace('.md', '')
            .replace(/-/g, ' ');

        try {
            await db
                .insert(schema.knowledgeFiles)
                .values({
                    id: uuidv4(),
                    filename,
                    category,
                    content,
                })
                .onConflictDoNothing();
            console.log(
                `  Loaded: ${filename} (${category})`,
            );
        } catch (err) {
            console.log(
                `  Skipped: ${filename} (already exists)`,
            );
        }
    }
}

async function main() {
    // Ensure data directory exists for local
    if (dbUrl.startsWith('file:')) {
        const dataDir = path.join(
            process.cwd(),
            'data',
        );
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, {
                recursive: true,
            });
        }
    }

    console.log('Seeding partner accounts...');

    for (const partner of seedPartners) {
        try {
            await db
                .insert(schema.partners)
                .values(partner)
                .onConflictDoNothing();
            console.log(
                `  Created: ${partner.name} (${partner.email})`,
            );
        } catch (err) {
            console.log(
                `  Skipped: ${partner.name} (already exists)`,
            );
        }
    }

    // Seed knowledge files from filesystem
    // into database
    await seedKnowledgeFiles();

    console.log('\nDone! Test credentials:');
    console.log(
        '  Admin:   john@roi360.co.uk / admin123',
    );
    console.log(
        '  Sales:   stuart@roi360.co.uk / sales123',
    );
    console.log(
        '  Partner: demo@example.com / demo123',
    );
}

main().catch(console.error);

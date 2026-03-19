import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { hashSync } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as schema from '../src/lib/db/schema';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sales-agent.db');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite, { schema });

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

console.log('Seeding partner accounts...');

for (const partner of seedPartners) {
    try {
        db.insert(schema.partners)
            .values(partner)
            .onConflictDoNothing()
            .run();
        console.log(
            `  Created: ${partner.name} (${partner.email})`,
        );
    } catch (err) {
        console.log(
            `  Skipped: ${partner.name} (already exists)`,
        );
    }
}

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

sqlite.close();

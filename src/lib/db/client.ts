import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

function getDb()
{
    if (!_db)
    {
        const client = createClient({
            url:
                process.env.TURSO_DATABASE_URL ||
                'file:./data/sales-agent.db',
            authToken:
                process.env.TURSO_AUTH_TOKEN ||
                undefined,
        });
        _db = drizzle(client, { schema });
    }
    return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(_target, prop)
    {
        return (getDb() as any)[prop];
    },
});

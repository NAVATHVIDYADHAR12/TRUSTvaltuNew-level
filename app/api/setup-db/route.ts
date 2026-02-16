import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split statements by semicolon, but careful with triggers/functions
        // For simplicity, we can try executing the whole block if the driver supports it,
        // or we might need a more robust split. 
        // The pg-node driver usually allows multiple statements in one query.
        // @neondatabase/serverless uses `ws` or `http` and might support multi-statement.

        // Let's try executing the whole string.
        await sql.query(schemaSql);

        return NextResponse.json({ message: 'Database schema applied successfully' });
    } catch (error: any) {
        console.error('Database setup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

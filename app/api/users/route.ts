import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
    try {
        const usersResult = await sql.query(`
            SELECT id, name, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);

        const users = usersResult.rows.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.created_at
        }));

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Fetch users error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

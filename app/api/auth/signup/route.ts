import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUsers = await sql.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUsers.rows.length > 0) {
            return NextResponse.json({ message: 'User already exists' }, { status: 409 });
        }

        // Insert new user
        // Note: In a real app, you MUST hash the password. 
        // For this standalone demo without backend auth logic, we are just storing the user record.
        const result = await sql.query(`
            INSERT INTO users (name, email, role, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id, name, email, role
        `, [name, email, role || 'client']);

        return NextResponse.json({
            success: true,
            user: result.rows[0]
        }, { status: 201 });

    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

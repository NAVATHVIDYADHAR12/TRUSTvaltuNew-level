import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    try {
        // Fetch user
        const userResult = await sql.query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];

        // Fetch relations
        const socialResult = await sql.query(`SELECT * FROM social_links WHERE user_id = $1`, [user.id]);
        const postsResult = await sql.query(`SELECT * FROM posts WHERE user_id = $1`, [user.id]);
        const certificatesResult = await sql.query(`SELECT * FROM certificates WHERE user_id = $1`, [user.id]);
        const badgesResult = await sql.query(`SELECT * FROM badges WHERE user_id = $1`, [user.id]);
        const followersResult = await sql.query(`SELECT * FROM followers WHERE following_id = $1`, [user.id]);
        const followingResult = await sql.query(`SELECT * FROM followers WHERE follower_id = $1`, [user.id]);

        // Map to frontend User type
        const responseUser = {
            _id: user.id,
            name: user.name,
            email: user.email,
            profilePic: user.profile_pic,
            bio: user.bio,
            summary: user.summary,
            role: user.role,
            profession: user.profession,
            skills: user.skills || [],
            experience: user.experience,
            photoPosition: user.photo_position,
            socialLinks: socialResult.rows.map(row => ({ platform: row.platform, url: row.url })),
            posts: postsResult.rows.map(row => ({
                id: row.id,
                caption: row.caption,
                imageUrl: row.image_url,
                likes: [], // ToDo: fetch likes
                createdAt: row.created_at,
                userId: row.user_id
            })),
            certificates: certificatesResult.rows.map(row => ({
                id: row.id,
                title: row.title,
                issuer: row.issuer,
                date: row.date,
                fileUrl: row.file_url
            })),
            badges: badgesResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                imageUrl: row.image_url,
                date: row.date
            })),
            followers: followersResult.rows.map(r => r.follower_id),
            following: followingResult.rows.map(r => r.following_id),
            teams: [] // ToDo: fetch teams
        };

        return NextResponse.json(responseUser);

    } catch (error: any) {
        console.error('Fetch profile error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, profilePic, bio, summary, role, profession, skills, experience, photoPosition, socialLinks } = body;

        // 1. Upsert User
        // We use ON CONFLICT (email) DO UPDATE
        const userResult = await sql.query(`
      INSERT INTO users (email, name, profile_pic, bio, summary, role, profession, skills, experience, photo_position)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) 
      DO UPDATE SET
        name = EXCLUDED.name,
        profile_pic = EXCLUDED.profile_pic,
        bio = EXCLUDED.bio,
        summary = EXCLUDED.summary,
        role = EXCLUDED.role,
        profession = EXCLUDED.profession,
        skills = EXCLUDED.skills,
        experience = EXCLUDED.experience,
        photo_position = EXCLUDED.photo_position,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [email, name, profilePic, bio, summary, role, profession, skills, experience, photoPosition]);

        const userId = userResult.rows[0].id;

        // 2. Update Social Links (Delete all and re-insert for simplicity, or upsert)
        // Deleting and re-inserting is easiest for this scale
        if (socialLinks && Array.isArray(socialLinks)) {
            await sql.query(`DELETE FROM social_links WHERE user_id = $1`, [userId]);
            for (const link of socialLinks) {
                if (link.url) {
                    await sql.query(`
            INSERT INTO social_links (user_id, platform, url) VALUES ($1, $2, $3)
          `, [userId, link.platform, link.url]);
                }
            }
        }

        return NextResponse.json({ success: true, userId });

    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

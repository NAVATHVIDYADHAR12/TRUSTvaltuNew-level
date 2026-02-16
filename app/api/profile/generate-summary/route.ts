import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, bio, profession, skills, experience } = body;

        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            return NextResponse.json(
                { error: 'Groq API key not configured. Please add GROQ_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        const prompt = `Generate a professional, concise summary (2-3 sentences) for a profile with the following details:
- Name: ${name}
- Profession: ${profession}
- Bio: ${bio}
- Skills: ${skills?.join(', ') || 'Not specified'}
- Experience: ${experience || 'Not specified'}

The summary should be suitable for text-to-speech and highlight key strengths and expertise.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional profile summary writer. Create concise, impactful summaries that highlight key strengths.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Groq API error:', error);
            return NextResponse.json(
                { error: 'Failed to generate summary. Please check your Groq API key.' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const summary = data.choices[0]?.message?.content || '';

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('Error generating AI summary:', error);
        return NextResponse.json(
            { error: 'Failed to generate summary' },
            { status: 500 }
        );
    }
}

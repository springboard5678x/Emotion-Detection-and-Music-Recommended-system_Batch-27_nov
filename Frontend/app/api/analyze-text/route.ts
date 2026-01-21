import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
        }

        const systemPrompt = `You are a music therapist and mood analyst. 
        
        First, perform a STRICT SAFETY CHECK:
        Analyze the user's input text for any offensive, explicit, hate speech, sexual, or harmful content.
        
        If the input is OFFENSIVE, EXPLICIT, or HARMFUL:
        Return ONLY this strict JSON object:
        {
            "is_offensive": true,
            "error": "Our vibe check detected inappropriate content. Please keep it chill."
        }

        If the input is SAFE:
        Analyze the user's emotional state.
        CRITICAL: Your goal is to improve the user's mood.
        - If the user is SAD, ANGRY, ANXIOUS, or NEGATIVE: Recommend HAPPY, UPLIFTING, CALM, or ENERGETIC songs to cheer them up. Do NOT match the sad vibe.
        - If the user is HAPPY or POSITIVE: Recommend songs that match or enhance their positive vibe.
        
        Return this strict JSON object:
        {
            "is_offensive": false,
            "emotion": "Detected Emotion (e.g., Happy, Melancholic, Energetic)",
            "confidence": "Confidence Level (e.g., 95%)",
            "songs": [
                {
                    "track_name": "Song Title",
                    "artists": "Artist Name",
                    "valence": 0.5,
                    "energy": 0.5,
                    "track_genre": "Genre",
                    "emotion_id": "emotion_label"
                }
            ]
        }
        
        Provide exactly 5 song recommendations that follow the INVERSE MOOD logic for negative emotions. Return ONLY JSON.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq API Error: ${error}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse the JSON content
        let parsedResult;
        try {
            parsedResult = JSON.parse(content);
        } catch (e) {
            console.error("Failed to parse JSON from Groq:", content);
            throw new Error("Failed to parse AI response");
        }

        // Handle Offensive Content
        if (parsedResult.is_offensive) {
            return NextResponse.json(
                { error: parsedResult.error || "Inappropriate content detected" },
                { status: 400 }
            );
        }

        return NextResponse.json(parsedResult);

    } catch (error) {
        console.error('Text Analysis Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}

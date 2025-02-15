import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GOOGLE_AI_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Google AI API key not configured'
        }), 
        { status: 500 }
      );
    }

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({
        content: text
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Google AI API error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while processing your request',
        suggestion: 'Please try again later.'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 
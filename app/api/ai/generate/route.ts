import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Kiểm tra API key tồn tại
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Log first 8 chars of API key
    console.log("Using API key:", apiKey.substring(0, 8) + "...");
    
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    
    // Trả về lỗi chi tiết hơn
    return NextResponse.json(
      { 
        error: "Failed to generate content",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
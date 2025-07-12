import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const response = await model;
    const result = response.text;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error generating flowchart:", error);
    return NextResponse.json(
      { error: "Failed to generate flowchart" },
      { status: 500 }
    );
  }
}

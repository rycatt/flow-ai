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

    const systemPrompt = `You are a flowchart generation AI. Convert the user's text description into a JSON object with nodes and edges for a React Flow diagram.

Rules:
1. Create nodes with unique IDs, positions (x, y coordinates), and data.label
2. Create edges connecting nodes with source and target IDs
3. Use different node types: 'input' for start, 'output' for end, 'default' for process steps
4. Position nodes logically (top to bottom, left to right)
5. Each step in the flow should be a separate node
6. Decision points should branch into multiple paths
7. LIMIT: Maximum 8-10 nodes total for better visualization
8. Keep the flowchart simple and focused on the main process

Response format:
{
  "nodes": [
    {
      "id": "1",
      "type": "input",
      "position": { "x": 100, "y": 50 },
      "data": { "label": "Start" }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2"
    }
  ]
}

IMPORTANT:
- Respond ONLY with valid JSON, no explanation or markdown
- Use data.label for node labels, not just "label"
- Position nodes with reasonable spacing (x: 100-600, y: 50-400)
- Keep it simple: 8-10 nodes maximum

User's process: "${prompt}"`;

    const model = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
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

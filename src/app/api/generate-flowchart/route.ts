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

    const systemPrompt = `You are a flowchart generation AI. Convert the user's text description into a JSON object with nodes and edges for a React Flow diagram using sub-flows (parent-child nodes).

Rules:
1. Create nodes with unique IDs, positions (x, y coordinates), and data.label
2. Create edges connecting nodes with source and target IDs
3. Use different node types: 'input' for start, 'output' for end, 'default' for process steps, 'group' for parent nodes
4. Position nodes logically (top to bottom, left to right)
5. Each step in the flow should be a separate node
6. Decision points should branch into multiple paths
7. LIMIT: Maximum 15-20 nodes total for better visualization
8. Organize the process into logical phases using parent-child relationships
9. Use parentId to create sub-flows within group nodes

Sub-Flow Organization:
- Create parent nodes with type 'group' for each phase (Setup, Processing, Validation, Output)
- Use parentId to make child nodes belong to their parent group
- Position child nodes close together within their parent (e.g., x: 20-180, y: 20-180)
- Parent nodes should be only as large as needed to fit their children (avoid large or empty containers)
- Avoid overlapping nodes and keep the layout compact and readable
- Parent nodes must appear before their children in the nodes array

Response format:
{
  "nodes": [
    {
      "id": "1",
      "type": "input",
      "position": { "x": 300, "y": 50 },
      "data": { "label": "Start" }
    },
    {
      "id": "setup-group",
      "type": "group",
      "position": { "x": 200, "y": 150 },
      "style": { "width": 180, "height": 120 },
      "data": { "label": "Setup Phase" }
    },
    {
      "id": "2",
      "type": "default",
      "position": { "x": 20, "y": 20 },
      "parentId": "setup-group",
      "data": { "label": "Initialize System" }
    },
    {
      "id": "3",
      "type": "default",
      "position": { "x": 20, "y": 60 },
      "parentId": "setup-group",
      "data": { "label": "Load Configuration" }
    },
    {
      "id": "processing-group",
      "type": "group",
      "position": { "x": 500, "y": 150 },
      "style": { "width": 180, "height": 120 },
      "data": { "label": "Processing Phase" }
    },
    {
      "id": "4",
      "type": "default",
      "position": { "x": 20, "y": 20 },
      "parentId": "processing-group",
      "data": { "label": "Process Data" }
    },
    {
      "id": "5",
      "type": "default",
      "position": { "x": 20, "y": 60 },
      "parentId": "processing-group",
      "data": { "label": "Apply Rules" }
    },
    {
      "id": "6",
      "type": "output",
      "position": { "x": 300, "y": 400 },
      "data": { "label": "End" }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" },
    { "id": "e3-4", "source": "3", "target": "4" },
    { "id": "e4-5", "source": "4", "target": "5" },
    { "id": "e5-6", "source": "5", "target": "6" }
  ]
}

IMPORTANT:
- Respond ONLY with valid JSON, no explanation or markdown
- Use data.label for node labels, not just "label"
- Position parent nodes with minimal size to fit their children (e.g., width: 180, height: 120)
- Position child nodes close together within parent (avoid large gaps)
- Avoid overlapping nodes and keep the layout compact and readable
- Parent nodes must appear before their children in the nodes array

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

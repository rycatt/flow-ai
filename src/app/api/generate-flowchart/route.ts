import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

interface FlowchartData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { label: string };
    parentId?: string;
    style?: { width?: number; height?: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
  }>;
}

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

    const systemPrompt = `You are a flowchart generation AI responsible for creating well-organized, effective, quality flowcharts. Generate React Flow JSON with nodes and edges from process description.

RULES:
1. Node types: 'input' (start), 'output' (end), 'default' (process), 'decision' (choice/condition), 'group' (container/phase)
2. Required fields: id, type, position {x,y}, data.label
3. Decision nodes: create labeled edges for each outcome ("Yes/No", "Press 1/2/3"). All outgoing edges from decision nodes must have a label.
4. Groups: For each logical phase, create a group node (type: 'group') with a clear label. All steps in a phase should be child nodes with parentId set to the group node's id. Group nodes must be connected to the main flow (either directly or via their first/last child).
5. Layout: vertical main flow, horizontal branches, 100-150px spacing. No overlapping nodes. Keep the layout compact and readable.
6. Connectivity: every node connects, no floating or unused nodes, all branches reconnect to the main flow or end.
7. Parent nodes before children in array.
8. Max 15-20 nodes for performance.
9. Output valid JSON only, no markdown or explanation.

Example structure:
{
  "nodes": [
    {"id": "start", "type": "input", "position": {"x": 400, "y": 50}, "data": {"label": "Start"}},
    {"id": "group1", "type": "group", "position": {"x": 300, "y": 150}, "style": {"width": 200, "height": 100}, "data": {"label": "Phase 1"}},
    {"id": "decision1", "type": "decision", "position": {"x": 50, "y": 40}, "parentId": "group1", "data": {"label": "Choice?"}}
  ],
  "edges": [
    {"id": "e1", "source": "start", "target": "group1"},
    {"id": "e2", "source": "decision1", "target": "next", "label": "Yes"}
  ]
}

Process: "${prompt}"`;

    const model = ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: systemPrompt,
    });

    const response = await model;
    const generatedText = response.text;

    if (!generatedText) {
      throw new Error("No response generated");
    }

    const cleanedText = generatedText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\s*[\w\s:]*\n/, "")
      .trim();

    let flowchartData: FlowchartData;

    try {
      flowchartData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", generatedText);
      throw new Error("Invalid JSON response from AI");
    }

    if (!flowchartData.nodes || !Array.isArray(flowchartData.nodes)) {
      throw new Error("Invalid nodes structure");
    }

    if (!flowchartData.edges || !Array.isArray(flowchartData.edges)) {
      throw new Error("Invalid edges structure");
    }

    flowchartData.nodes = flowchartData.nodes.map((node, index) => ({
      id: node.id || `node-${index}`,
      type: node.type === "decision" ? "default" : node.type || "default",
      position: node.position || {
        x: 100 + (index % 3) * 200,
        y: 100 + Math.floor(index / 3) * 100,
      },
      data: { label: node.data?.label || `Step ${index + 1}` },
      parentId: node.parentId,
      style: node.style,
    }));

    const validNodeIds = new Set(flowchartData.nodes.map((node) => node.id));

    flowchartData.edges = flowchartData.edges
      .filter((edge) => {
        const isValid =
          edge.source &&
          edge.target &&
          validNodeIds.has(edge.source) &&
          validNodeIds.has(edge.target);
        if (!isValid) {
          console.warn(
            `Filtering out invalid edge: ${edge.source} -> ${edge.target}`
          );
        }
        return isValid;
      })
      .map((edge) => {
        const cleaned = { ...edge };
        if (
          "sourceHandle" in cleaned &&
          (cleaned.sourceHandle === null ||
            cleaned.sourceHandle === "null" ||
            cleaned.sourceHandle === undefined)
        ) {
          delete cleaned.sourceHandle;
        }
        if (
          "targetHandle" in cleaned &&
          (cleaned.targetHandle === null ||
            cleaned.targetHandle === "null" ||
            cleaned.targetHandle === undefined)
        ) {
          delete cleaned.targetHandle;
        }
        return cleaned;
      });

    return NextResponse.json({ result: JSON.stringify(flowchartData) });
  } catch (error) {
    console.error("Error generating flowchart:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate flowchart",
      },
      { status: 500 }
    );
  }
}

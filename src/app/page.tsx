"use client";
import { FlowchartCanvas } from "@/components/FlowchartCanvas";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceInput } from "@/components/VoiceInput";
import { Edge, Node, ReactFlowProvider } from "@xyflow/react";
import { WandSparkles } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  const handleClick = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-flowchart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      try {
        let cleanResponse = data.result;
        if (cleanResponse.includes("```json")) {
          cleanResponse = cleanResponse.replace(/```json\n?/g, "");
        }
        if (cleanResponse.includes("```")) {
          cleanResponse = cleanResponse.replace(/```\n?/g, "");
        }

        cleanResponse = cleanResponse.trim();
        const parsedData = JSON.parse(cleanResponse);

        if (parsedData.nodes && parsedData.edges) {
          console.log("Setting nodes:", parsedData.nodes);
          console.log("Setting edges:", parsedData.edges);
          setNodes(parsedData.nodes);
          setEdges(parsedData.edges);
        } else {
          console.log("No nodes or edges found in parsed data");
        }
      } catch (parseError) {
        console.log("Could not parse AI response as JSON:", parseError);
        console.log("Raw response:", data.result);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    console.log("Current nodes:", nodes);
    console.log("Current edges:", edges);
  }, [nodes, edges]);

  return (
    <div className="h-screen flex">
      <main className="flex w-full">
        <div className="w-1/3 min-w-96 p-8 border-r border-gray-200 bg-white">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Flow AI
            </h1>
            <p className="text-gray-600">
              Turn your ideas into interactive flowcharts
            </p>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-medium flex items-center gap-2">
                  <WandSparkles />
                  Create Flowchart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Tell me about your process..."
                    disabled={isGenerating}
                    className="w-full h-96 p-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none transition-all duration-200"
                  />
                  <div className="absolute bottom-3 right-3">
                    <VoiceInput onTranscription={setPrompt} />
                  </div>
                </div>
                <button
                  onClick={handleClick}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 cursor-pointer mt-2 transform disabled:transform-none disabled:cursor-default"
                >
                  {isGenerating ? <LoadingSpinner /> : "Generate Flowchart"}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex-1 h-screen relative">
          {isGenerating && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm z-10 rounded-lg shadow-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <div>
                  <p className="text-gray-700 font-medium text-sm">
                    Generating your flowchart...
                  </p>
                  <p className="text-xs text-gray-500">
                    Watch as your flowchart comes to life
                  </p>
                </div>
              </div>
            </div>
          )}
          {animationComplete && (
            <div className="absolute top-4 left-4 bg-green-50 border border-green-200 z-10 rounded-lg shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-green-600">
                    Your flowchart is ready
                  </p>
                </div>
              </div>
            </div>
          )}
          <ReactFlowProvider>
            <FlowchartCanvas
              nodes={nodes}
              edges={edges}
              onAnimationComplete={() => {
                setAnimationComplete(true);
                setTimeout(() => setAnimationComplete(false), 3000);
              }}
            />
          </ReactFlowProvider>
        </div>
      </main>
    </div>
  );
}

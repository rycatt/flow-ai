"use client";
import { FlowchartCanvas } from "@/components/FlowchartCanvas";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceInput } from "@/components/VoiceInput";
import { Edge, Node } from "@xyflow/react";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleClick = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/generate-flowchart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
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
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current nodes:", nodes);
    console.log("Current edges:", edges);
  }, [nodes, edges]);

  return (
    <div className="h-screen flex">
      <main className="flex w-full">
        <div className="w-[450px] p-5 border-r border-gray-200 bg-white">
          <div className="flex flex-col gap-4 p-4">
            <h1 className="text-3xl semibold">Flow AI</h1>
            <p className="text-gray-600">
              Describe your process and get an interactive flowchart
            </p>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Describe Your Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. User login, order processing, or customer support workflow"
                    disabled={loading}
                    className="w-full h-96 p-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none transition-all duration-200"
                  />
                  <div className="absolute bottom-3 right-3">
                    <VoiceInput onTranscription={setInput} />
                  </div>
                </div>
                <button
                  onClick={handleClick}
                  disabled={loading || !input.trim()}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 cursor-pointer mt-2 transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? <LoadingSpinner /> : "Generate Flowchart"}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex-1 h-screen relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Generating your flowchart...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few seconds
                </p>
              </div>
            </div>
          )}
          <FlowchartCanvas nodes={nodes} edges={edges} />
        </div>
      </main>
    </div>
  );
}

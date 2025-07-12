"use client";
import React, { useState } from "react";
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

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
      setOutput(data.result || "");
    } catch (error) {
      console.error("Error:", error);
      setOutput("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      <main className="flex w-full">
        <div className="w-96 p-5 border-r border-gray-200 bg-white">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter prompt"
            disabled={loading}
            className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={handleClick} 
            disabled={loading || !input.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? "Generating..." : "Ask Gemini"}
          </button>
          <p className="mt-4 text-sm text-gray-700">{output}</p>
        </div>
        <div className="flex-1 h-screen">
          <ReactFlow 
            defaultNodes={[]} 
            defaultEdges={[]}
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="ccc" variant={BackgroundVariant.Dots}/>
          </ReactFlow>
        </div>
      </main>
    </div>
  );
}

import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";

interface FlowchartCanvasProps {
  nodes?: Node[];
  edges?: Edge[];
}

export const FlowchartCanvas = ({
  nodes: initialNodes = [],
  edges: initialEdges = [],
}: FlowchartCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="w-full h-full"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        defaultEdgeOptions={{ zIndex: 1 }}
      >
        <Controls className="!bg-card !border-border" />
        <MiniMap
          className="absolute bottom-2 right-2 bg-white/95 border border-gray-300"
          nodeColor={(node) => {
            const label = (node.data?.label as string) || "";
            if (label.includes("Setup")) return "#059669";
            if (label.includes("Processing")) return "#3b82f6";
            if (label.includes("Validation")) return "#f59e0b";
            if (label.includes("Output")) return "#dc2626";
            switch (node.type) {
              case "input":
                return "#059669";
              case "output":
                return "#dc2626";
              case "group":
                return "#8b5cf6";
              default:
                return "#374151";
            }
          }}
          nodeStrokeColor="#111827"
          nodeStrokeWidth={1.5}
          zoomable
          pannable
        />
        <Background
          variant={BackgroundVariant.Cross}
          gap={20}
          size={2}
          color="#9ca3af"
        />
      </ReactFlow>
    </div>
  );
};

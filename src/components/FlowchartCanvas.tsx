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
            if (label.includes("Setup")) return "#00bcd4";
            if (label.includes("Processing")) return "#2196f3";
            if (label.includes("Validation")) return "#ff9800";
            if (label.includes("Output")) return "#f44336";
            switch (node.type) {
              case "input":
                return "#00bcd4";
              case "output":
                return "#f44336";
              case "group":
                return "rgba(23, 92, 246, 0.2)";
              default:
                return "#607d8b";
            }
          }}
          nodeStrokeColor="#263238"
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

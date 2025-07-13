import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  Panel,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Eraser as EraserIcon, MousePointer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ErasableEdge } from "./ErasableEdge";
import { ErasableNode } from "./ErasableNode";
import { Eraser } from "./EraserTool";
import { Button } from "./ui/button";

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
  const [nodeId, setNodeId] = useState(0);
  const reactFlowInstance = useReactFlow();
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isEraserActive, setIsEraserActive] = useState(false);

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (isEraserActive) return;

      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastClickTime;

      if (timeDiff < 300) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - 150,
          y: event.clientY - 50,
        });

        const newNode = {
          id: `node-${nodeId}`,
          type: "erasable-node",
          position,
          data: { label: `Node ${nodeId + 1}` },
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeId((id) => id + 1);
        setLastClickTime(0);
      } else {
        setLastClickTime(currentTime);
      }
    },
    [nodeId, setNodes, reactFlowInstance, lastClickTime, isEraserActive]
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, type: "erasable-edge" }, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (nodes.length === 0) {
      setNodeId(0);
    }
  }, [nodes.length]);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const nodeTypes = {
    "erasable-node": ErasableNode,
  };

  const edgeTypes = {
    "erasable-edge": ErasableEdge,
  };

  return (
    <div className="w-full h-full cursor-crosshair">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="w-full h-full"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        defaultEdgeOptions={{ zIndex: 1, type: "erasable-edge" }}
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

        <Panel position="top-right">
          <div className="flex flex-col gap-2">
            <Button
              variant={isEraserActive ? "default" : "outline"}
              onClick={() => setIsEraserActive(true)}
            >
              <EraserIcon />
            </Button>
            <Button
              variant={!isEraserActive ? "default" : "outline"}
              onClick={() => setIsEraserActive(false)}
            >
              <MousePointer />
            </Button>
          </div>
        </Panel>
        {isEraserActive && <Eraser />}
      </ReactFlow>
    </div>
  );
};

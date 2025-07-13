import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  Node,
  NodeChange,
  Panel,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Eraser as EraserIcon, MousePointer } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlowchartCanvasProps } from "../types/flowchart";
import { ErasableEdge } from "./ErasableEdge";
import { ErasableNode } from "./ErasableNode";
import { Eraser } from "./EraserTool";
import { Button } from "./ui/button";

export const FlowchartCanvas = ({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onAnimationComplete,
}: FlowchartCanvasProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [currentEdgeIndex, setCurrentEdgeIndex] = useState(0);
  const [nodeId, setNodeId] = useState(0);
  const reactFlowInstance = useReactFlow();
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const prevNodesRef = useRef<Node[]>([]);

  const NODE_DELAY = 200;
  const EDGE_DELAY = 50;

  useEffect(() => {
    const nodesChanged =
      JSON.stringify(initialNodes) !== JSON.stringify(prevNodesRef.current);
    if (initialNodes.length > 0 && !isAnimating && nodesChanged) {
      prevNodesRef.current = initialNodes;
      startAnimation();
    }
  }, [initialNodes, isAnimating]);

  const startAnimation = () => {
    setNodes([]);
    setEdges([]);
    setCurrentNodeIndex(0);
    setCurrentEdgeIndex(0);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (!isAnimating || currentNodeIndex >= initialNodes.length) {
      return;
    }

    const timer = setTimeout(() => {
      setNodes((prev) => [...prev, initialNodes[currentNodeIndex]]);
      setCurrentNodeIndex((prev) => prev + 1);
    }, NODE_DELAY);

    return () => clearTimeout(timer);
  }, [isAnimating, currentNodeIndex, initialNodes, NODE_DELAY]);

  useEffect(() => {
    if (!isAnimating || currentEdgeIndex >= initialEdges.length) {
      return;
    }

    if (currentNodeIndex < initialNodes.length) {
      return;
    }

    const timer = setTimeout(() => {
      setEdges((prev) => [...prev, initialEdges[currentEdgeIndex]]);
      setCurrentEdgeIndex((prev) => prev + 1);
    }, EDGE_DELAY);

    return () => clearTimeout(timer);
  }, [
    isAnimating,
    currentEdgeIndex,
    initialEdges,
    currentNodeIndex,
    initialNodes.length,
    EDGE_DELAY,
  ]);

  useEffect(() => {
    if (
      isAnimating &&
      currentNodeIndex >= initialNodes.length &&
      currentEdgeIndex >= initialEdges.length
    ) {
      setIsAnimating(false);
      onAnimationComplete?.();
    }
  }, [
    isAnimating,
    currentNodeIndex,
    currentEdgeIndex,
    initialNodes.length,
    initialEdges.length,
    onAnimationComplete,
  ]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      onNodesChange?.(changes);
    },
    [nodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      onEdgesChange?.(changes);
    },
    [edges, onEdgesChange]
  );

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

  const nodeTypes = {
    "erasable-node": ErasableNode,
  };

  const edgeTypes = {
    "erasable-edge": ErasableEdge,
  };

  const progress =
    initialNodes.length > 0
      ? Math.round(
          ((currentNodeIndex + currentEdgeIndex) /
            (initialNodes.length + initialEdges.length)) *
            100
        )
      : 0;

  return (
    <div className="w-full h-full cursor-crosshair">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="w-full h-full"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        defaultEdgeOptions={{ zIndex: 1, type: "erasable-edge" }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
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

        {isAnimating && (
          <Panel position="top-left">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">
                  {currentNodeIndex}/{initialNodes.length} nodes •{" "}
                  {currentEdgeIndex}/{initialEdges.length} edges
                </div>
              </div>
            </div>
          </Panel>
        )}

        {isEraserActive && <Eraser />}
      </ReactFlow>
    </div>
  );
};

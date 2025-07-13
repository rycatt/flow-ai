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
import { Eraser as EraserIcon, Moon, MousePointer, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlowchartCanvasProps } from "../../types/flowchart";
import { Button } from "../ui/button";
import { ErasableEdge } from "./ErasableEdge";
import { ErasableNode } from "./ErasableNode";
import { Eraser } from "./EraserTool";

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
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
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

  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  }, []);

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
    default: ErasableNode,
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
    <div className="w-full h-full cursor-crosshair bg-background">
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
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          style={{
            backgroundColor: isDarkTheme
              ? "rgba(38, 38, 38, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
            border: isDarkTheme
              ? "1px solid rgb(64, 64, 64)"
              : "1px solid rgb(229, 231, 235)",
            borderRadius: "8px",
            backdropFilter: "blur(8px)",
          }}
        />
        <MiniMap
          style={{
            backgroundColor: isDarkTheme
              ? "rgba(38, 38, 38, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
            border: isDarkTheme
              ? "1px solid rgb(64, 64, 64)"
              : "1px solid rgb(229, 231, 235)",
            borderRadius: "8px",
            backdropFilter: "blur(8px)",
          }}
          nodeColor={(node) => {
            const label = (node.data?.label as string) || "";
            if (isDarkTheme) {
              if (label.includes("Setup")) return "#e5e7eb";
              if (label.includes("Processing")) return "#d1d5db";
              if (label.includes("Validation")) return "#9ca3af";
              if (label.includes("Output")) return "#6b7280";
              switch (node.type) {
                case "input":
                  return "#e5e7eb";
                case "output":
                  return "#6b7280";
                case "group":
                  return "rgba(229, 231, 235, 0.2)";
                default:
                  return "#d1d5db";
              }
            } else {
              if (label.includes("Setup")) return "#374151";
              if (label.includes("Processing")) return "#6b7280";
              if (label.includes("Validation")) return "#9ca3af";
              if (label.includes("Output")) return "#d1d5db";
              switch (node.type) {
                case "input":
                  return "#374151";
                case "output":
                  return "#d1d5db";
                case "group":
                  return "rgba(55, 65, 81, 0.2)";
                default:
                  return "#6b7280";
              }
            }
          }}
          nodeStrokeColor={isDarkTheme ? "#374151" : "#e5e7eb"}
          nodeStrokeWidth={1.5}
          maskColor={
            isDarkTheme ? "rgba(10, 10, 10, 0.8)" : "rgba(255, 255, 255, 0.8)"
          }
          zoomable
          pannable
        />
        <Background
          variant={BackgroundVariant.Cross}
          gap={20}
          size={2}
          color={isDarkTheme ? "#262626" : "#9ca3af"}
          style={{
            backgroundColor: isDarkTheme ? "#0a0a0a" : "#f9fafb",
          }}
        />

        <Panel position="top-right">
          <div className="flex flex-col gap-2">
            <Button
              className="bg-white dark:bg-neutral-800/60 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-700"
              variant="outline"
              onClick={toggleTheme}
            >
              {isDarkTheme ? <Moon /> : <Sun />}
            </Button>
            <Button
              className={`${
                isEraserActive
                  ? "bg-gray-900 dark:bg-white text-white dark:text-neutral-900"
                  : "bg-white dark:bg-neutral-800/60 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-700"
              }`}
              variant="outline"
              onClick={() => setIsEraserActive(true)}
            >
              <EraserIcon />
            </Button>
            <Button
              className={`${
                !isEraserActive
                  ? "bg-gray-900 dark:bg-white text-white dark:text-neutral-900"
                  : "bg-white dark:bg-neutral-800/60 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-700"
              }`}
              variant="outline"
              onClick={() => setIsEraserActive(false)}
            >
              <MousePointer />
            </Button>
          </div>
        </Panel>

        {isAnimating && (
          <Panel position="top-left">
            <div
              className={`backdrop-blur-sm rounded-lg shadow-lg p-4 border ${
                isDarkTheme
                  ? "bg-neutral-800/90 border-neutral-600"
                  : "bg-white/90 border-gray-200"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span>{progress}%</span>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    isDarkTheme ? "bg-neutral-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gray-900 dark:bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div
                  className={`text-xs ${
                    isDarkTheme ? "text-neutral-300" : "text-gray-600"
                  }`}
                >
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

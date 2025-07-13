import { Edge, EdgeChange, Node, NodeChange } from "@xyflow/react";

export interface ProcessNodeData {
  label: string;
  description?: string;
  type: "input" | "output" | "process" | "decision";
}

export interface FlowchartData {
  nodes: Node[];
  edges: Edge[];
}

export interface FlowchartCanvasProps {
  nodes?: Node[];
  edges?: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onAnimationComplete?: () => void;
}

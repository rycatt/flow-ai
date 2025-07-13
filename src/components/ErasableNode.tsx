import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useEffect, useRef, useState } from "react";

export type ErasableNodeType = Node<
  { toBeDeleted?: boolean; label?: string },
  "erasable-node"
>;

export function ErasableNode({
  data: { label, toBeDeleted },
  id,
}: NodeProps<ErasableNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!toBeDeleted) {
      setIsEditing(true);
      setEditValue(label || "");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleInputBlur = () => {
    saveEdit();
  };

  const saveEdit = () => {
    if (editValue.trim() !== "") {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, label: editValue.trim() } }
            : node
        )
      );
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(label || "");
    setIsEditing(false);
  };

  return (
    <div
      style={{ opacity: toBeDeleted ? 0.3 : 1 }}
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer"
    >
      <Handle type="target" position={Position.Top} />
      <div className="min-w-[120px] text-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="w-full text-sm border-none outline-none bg-transparent text-center"
          />
        ) : (
          <div className="text-sm text-gray-900">
            {label || "Double-click to edit"}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

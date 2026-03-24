import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export interface GraphData {
  nodes: { id: string; label: string }[];
  edges: { source: string; target: string; label?: string }[];
}

interface GraphCanvasProps {
  data: GraphData | null;
}

function autoLayout(nodes: GraphData["nodes"]): Node[] {
  const count = nodes.length;
  const radius = Math.max(180, count * 40);
  const cx = 400;
  const cy = 300;

  return nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      id: n.id,
      position: {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      },
      data: { label: n.label },
      style: {
        background: "hsl(var(--node-bg))",
        border: "2px solid hsl(var(--node-border))",
        borderRadius: "var(--radius)",
        padding: "12px 20px",
        fontSize: "13px",
        fontWeight: 500,
        color: "hsl(var(--node-text))",
        boxShadow: "0 2px 8px hsl(220 25% 10% / 0.06)",
        minWidth: "80px",
        textAlign: "center" as const,
      },
    };
  });
}

function toEdges(edges: GraphData["edges"]): Edge[] {
  return edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label || "",
    animated: true,
    style: { stroke: "hsl(var(--edge-color))", strokeWidth: 1.5 },
    labelStyle: {
      fontSize: 11,
      fill: "hsl(var(--muted-foreground))",
      fontWeight: 500,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--edge-color))" },
  }));
}

const GraphCanvas = ({ data }: GraphCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data) {
      setNodes(autoLayout(data.nodes));
      setEdges(toEdges(data.edges));
    }
  }, [data, setNodes, setEdges]);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm tracking-wide">Your graph will appear here</p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
      <Controls
        className="!bg-card !border-border !shadow-sm"
        showInteractive={false}
      />
    </ReactFlow>
  );
};

export default GraphCanvas;

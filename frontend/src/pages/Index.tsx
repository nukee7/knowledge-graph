import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import TextInputPanel, { type PredictionFormData } from "@/components/TextInputPanel";
import GraphCanvas, { type GraphData } from "@/components/GraphCanvas";
import { toast } from "sonner";

const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";
const API_ENDPOINT = `${API_PREFIX}/extract`;

interface Triple {
  sentence?: string;
  entity1: string;
  relation: string;
  entity2: string;
  confidence?: number;
}

interface PredictionResponse {
  predictions?: Triple[];
  triples?: Triple[];
  results?: Triple[];
  count?: number;
}

function toNodeId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeTriples(data: PredictionResponse | Triple[]): Triple[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.predictions || data.triples || data.results || [];
}

function buildGraphData(triples: Triple[]): GraphData {
  const nodes = new Map<string, { id: string; label: string }>();
  const edges: GraphData["edges"] = [];

  for (const triple of triples) {
    const entity1 = triple.entity1.trim();
    const entity2 = triple.entity2.trim();
    const sourceId = toNodeId(entity1);
    const targetId = toNodeId(entity2);

    nodes.set(sourceId, { id: sourceId, label: entity1 });
    nodes.set(targetId, { id: targetId, label: entity2 });

    edges.push({
      source: sourceId,
      target: targetId,
      label: triple.relation,
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}

// Demo fallback when no backend is running
const DEMO_DATA: GraphData = {
  nodes: [
    { id: "albert-einstein", label: "Albert Einstein" },
    { id: "theory-of-relativity", label: "Theory of Relativity" },
    { id: "ulm", label: "Ulm" },
    { id: "switzerland", label: "Switzerland" },
  ],
  edges: [
    { source: "albert-einstein", target: "theory-of-relativity", label: "developed" },
    { source: "albert-einstein", target: "ulm", label: "born in" },
    { source: "albert-einstein", target: "switzerland", label: "moved to" },
  ],
};

const Index = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleSubmit = useCallback(async (payload: PredictionFormData) => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data: PredictionResponse | Triple[] = await res.json();
      const triples = normalizeTriples(data);

      if (triples.length === 0) {
        throw new Error("No triples returned");
      }

      const graph = buildGraphData(triples);
      setGraphData(graph);
      toast.success(`Graph generated from ${triples.length} relation${triples.length === 1 ? "" : "s"}`);
    } catch {
      // Fallback to demo data when backend isn't available
      setGraphData(DEMO_DATA);
      toast.info("Using demo data — start the backend on port 8000 to get real graph results", {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex min-h-screen bg-background transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      {/* Left panel */}
      <div className="w-[380px] shrink-0 border-r border-border bg-card">
        <TextInputPanel onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* Graph area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <GraphCanvas data={graphData} />
        </div>

        {/* Floating title */}
        <div className="absolute left-6 top-5 flex items-start gap-4">
          <div className="pointer-events-none">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Text → Graph
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-relation graph extraction
            </p>
          </div>
          <Link
            to="/about"
            className="mt-0.5 rounded-md border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground hover:bg-card"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;

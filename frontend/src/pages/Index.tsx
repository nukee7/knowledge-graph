import { useState, useCallback, useRef, useEffect } from "react";
import TextInputPanel from "@/components/TextInputPanel";
import GraphCanvas, { type GraphData } from "@/components/GraphCanvas";
import { toast } from "sonner";

// ──────────────────────────────────────────────
// CONFIGURE YOUR API ENDPOINT HERE
// The backend should accept POST { text: string }
// and return { nodes: [{id, label}], edges: [{source, target, label?}] }
const API_ENDPOINT = "/api/extract-graph";
// ──────────────────────────────────────────────

// Demo fallback when no backend is running
const DEMO_DATA: GraphData = {
  nodes: [
    { id: "einstein", label: "Albert Einstein" },
    { id: "relativity", label: "Theory of Relativity" },
    { id: "ulm", label: "Ulm, Germany" },
    { id: "switzerland", label: "Switzerland" },
    { id: "physics", label: "Physics" },
    { id: "nobel", label: "Nobel Prize" },
  ],
  edges: [
    { source: "einstein", target: "relativity", label: "developed" },
    { source: "einstein", target: "ulm", label: "born in" },
    { source: "einstein", target: "switzerland", label: "moved to" },
    { source: "einstein", target: "physics", label: "field" },
    { source: "einstein", target: "nobel", label: "awarded" },
    { source: "relativity", target: "physics", label: "belongs to" },
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

  const handleSubmit = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data: GraphData = await res.json();
      setGraphData(data);
      toast.success(`Graph generated — ${data.nodes.length} nodes, ${data.edges.length} edges`);
    } catch {
      // Fallback to demo data when backend isn't available
      setGraphData(DEMO_DATA);
      toast.info("Using demo data — connect your API endpoint to get real results", {
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
        <div className="pointer-events-none absolute left-6 top-5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Text → Graph
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Knowledge graph extraction
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

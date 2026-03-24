import { useState, useCallback, useRef, useEffect } from "react";
import TextInputPanel, { type PredictionFormData } from "@/components/TextInputPanel";
import GraphCanvas, { type GraphData } from "@/components/GraphCanvas";
import { toast } from "sonner";

const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";
const API_ENDPOINT = `${API_PREFIX}/predict`;

interface PredictionResponse {
  prediction: {
    entity1: string;
    relation: string;
    entity2: string;
  };
}

function buildGraphData(prediction: PredictionResponse["prediction"]): GraphData {
  return {
    nodes: [
      { id: prediction.entity1, label: prediction.entity1 },
      { id: prediction.entity2, label: prediction.entity2 },
    ],
    edges: [
      {
        source: prediction.entity1,
        target: prediction.entity2,
        label: prediction.relation,
      },
    ],
  };
}

// Demo fallback when no backend is running
const DEMO_DATA: GraphData = {
  nodes: [
    { id: "configuration", label: "configuration" },
    { id: "elements", label: "elements" },
  ],
  edges: [
    { source: "configuration", target: "elements", label: "component-whole" },
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

      const data: PredictionResponse = await res.json();
      const graph = buildGraphData(data.prediction);
      setGraphData(graph);
      toast.success(`Predicted relation: ${data.prediction.relation}`);
    } catch {
      // Fallback to demo data when backend isn't available
      setGraphData(DEMO_DATA);
      toast.info("Using demo data — start the backend on port 8000 to get real predictions", {
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
            Backend-connected relation prediction
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

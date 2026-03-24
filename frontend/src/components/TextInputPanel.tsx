import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

export interface PredictionFormData {
  text: string;
}

interface TextInputPanelProps {
  onSubmit: (payload: PredictionFormData) => void;
  loading: boolean;
}

const TextInputPanel = ({ onSubmit, loading }: TextInputPanelProps) => {
  const [text, setText] = useState("");

  const isDisabled = !text.trim() || loading;

  const handleSubmit = () => {
    if (isDisabled) return;

    onSubmit({
      text: text.trim(),
    });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Paragraph Input
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste one paragraph and the backend will return multiple relation triples for the graph.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Albert Einstein developed the theory of relativity. He was born in Ulm, Germany and later moved to Switzerland."
        className="flex-1 resize-none rounded-lg border border-input bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      />

      <Button
        onClick={handleSubmit}
        disabled={isDisabled}
        className="w-full active:scale-[0.97] transition-all"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Send />
            Generate Graph
          </>
        )}
      </Button>
    </div>
  );
};

export default TextInputPanel;

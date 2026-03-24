import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface TextInputPanelProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

const TextInputPanel = ({ onSubmit, loading }: TextInputPanelProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) onSubmit(text.trim());
  };

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Input Text
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a paragraph to extract a knowledge graph.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Albert Einstein developed the theory of relativity. He was born in Ulm, Germany and later moved to Switzerland…"
        className="flex-1 resize-none rounded-lg border border-input bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      />

      <Button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
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

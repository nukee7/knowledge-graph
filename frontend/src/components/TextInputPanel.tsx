import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";

export interface PredictionFormData {
  sentence: string;
  entity1: string;
  entity2: string;
}

interface TextInputPanelProps {
  onSubmit: (payload: PredictionFormData) => void;
  loading: boolean;
}

const TextInputPanel = ({ onSubmit, loading }: TextInputPanelProps) => {
  const [sentence, setSentence] = useState("");
  const [entity1, setEntity1] = useState("");
  const [entity2, setEntity2] = useState("");

  const isDisabled = !sentence.trim() || !entity1.trim() || !entity2.trim() || loading;

  const handleSubmit = () => {
    if (isDisabled) return;

    onSubmit({
      sentence: sentence.trim(),
      entity1: entity1.trim(),
      entity2: entity2.trim(),
    });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Prediction Input
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter one sentence and the two entities you want the backend on port 8000 to evaluate.
        </p>
      </div>

      <div className="space-y-3">
        <Input
          value={entity1}
          onChange={(e) => setEntity1(e.target.value)}
          placeholder="Entity 1"
        />
        <Input
          value={entity2}
          onChange={(e) => setEntity2(e.target.value)}
          placeholder="Entity 2"
        />
      </div>

      <textarea
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        placeholder="The system has a configuration of antenna elements."
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
            Predict Relation
          </>
        )}
      </Button>
    </div>
  );
};

export default TextInputPanel;

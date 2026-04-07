import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RELATION_TYPES = [
  { name: "Cause-Effect", count: 1003, example: "Smoking causes cancer." },
  { name: "Component-Whole", count: 941, example: "The wheel is part of the car." },
  { name: "Content-Container", count: 540, example: "The juice was in the bottle." },
  { name: "Entity-Destination", count: 845, example: "The troops were sent to the front." },
  { name: "Entity-Origin", count: 716, example: "The river flows from the mountains." },
  { name: "Instrument-Agency", count: 504, example: "The author uses a disassembler." },
  { name: "Member-Collection", count: 690, example: "A soldier belongs to the army." },
  { name: "Message-Topic", count: 634, example: "The lecture was about economics." },
  { name: "Product-Producer", count: 717, example: "The factory manufactures cars." },
  { name: "Other", count: 1410, example: "No specific relation." },
];

const TOTAL_SAMPLES = 8000;

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              About this Project
            </h1>
            <p className="text-xs text-muted-foreground">
              Multi-relation knowledge graph extraction from text
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        {/* Project Overview */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">Project Overview</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This application extracts semantic relationships from natural language
            text and visualizes them as an interactive knowledge graph. Given a
            paragraph, the system identifies entities, classifies the relation
            between each entity pair, and renders the resulting triples as a
            directed graph you can explore in the browser.
          </p>
        </section>

        <Separator />

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Entity Detection",
                desc: "spaCy NER extracts named entities from each sentence, with a noun-chunk fallback for broader coverage.",
              },
              {
                step: "2",
                title: "Relation Classification",
                desc: "A BiLSTM + Attention model classifies the relation type for every entity pair within a configurable token distance.",
              },
              {
                step: "3",
                title: "Graph Visualization",
                desc: "Extracted triples are rendered as an interactive, directed graph using React Flow with automatic layout.",
              },
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden">
                <span className="absolute right-3 top-2 text-4xl font-black text-muted/30">
                  {item.step}
                </span>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Model Architecture */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Model Architecture
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
                {[
                  ["Type", "BiLSTM + Attention"],
                  ["Word Embedding", "50-dim"],
                  ["Position Embedding", "10-dim x 2"],
                  ["Hidden Units", "64 (bidirectional)"],
                  ["Dropout", "0.5"],
                  ["Output Classes", "10"],
                  ["Tokenizer", "NLTK word_tokenize"],
                  ["Entity Marking", "<e1>/<e2> tags"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground">{label}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The model concatenates word embeddings with two relative-position
            embeddings (one per entity), passes them through a bidirectional LSTM,
            applies an attention layer to produce a fixed-length context vector,
            and classifies it into one of 10 relation types.
          </p>
        </section>

        <Separator />

        {/* Dataset */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Dataset — SemEval-2010 Task 8
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The model is trained on the{" "}
            <span className="font-medium text-foreground">
              SemEval-2010 Task 8
            </span>{" "}
            relation classification dataset, which contains{" "}
            <span className="font-medium text-foreground">
              {TOTAL_SAMPLES.toLocaleString()} annotated samples
            </span>{" "}
            across 10 relation classes. Each sample consists of a sentence with
            two marked entities and a labeled directional relation.
          </p>

          {/* Relation breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Relation Distribution</h3>
            <div className="space-y-1.5">
              {RELATION_TYPES.sort((a, b) => b.count - a.count).map((rel) => {
                const pct = (rel.count / TOTAL_SAMPLES) * 100;
                return (
                  <div key={rel.name} className="group">
                    <div className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-xs font-medium text-foreground">
                        {rel.name}
                      </span>
                      <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {rel.count}
                      </Badge>
                    </div>
                    <p className="mt-0.5 pl-[172px] text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {rel.example}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample format */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sample Format</h3>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
{`{
  "sentence": "The system as described above has its greatest
               application in an arrayed configuration of
               antenna elements.",
  "entity1":  "configuration",
  "entity2":  "elements",
  "relation": "Component-Whole",
  "direction": "e2,e1"
}`}
            </pre>
          </div>
        </section>

        <Separator />

        {/* Tech Stack */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Tech Stack</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Frontend</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {[
                  "React 18",
                  "TypeScript",
                  "Vite",
                  "Tailwind CSS",
                  "React Flow",
                  "Radix UI",
                  "TanStack Query",
                ].map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Backend</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {[
                  "Python 3.11",
                  "FastAPI",
                  "PyTorch",
                  "spaCy",
                  "NLTK",
                  "Uvicorn",
                  "Docker",
                ].map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-4 pb-10 text-center text-xs text-muted-foreground">
          Built as a knowledge graph extraction research project.
        </div>
      </main>
    </div>
  );
};

export default About;

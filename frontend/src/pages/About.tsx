import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const RELATION_TYPES = [
  { name: "Cause-Effect", count: 1400, example: "Smoking causes cancer." },
  { name: "Component-Whole", count: 1400, example: "The wheel is part of the car." },
  { name: "Content-Container", count: 1400, example: "The juice was in the bottle." },
  { name: "Entity-Destination", count: 1400, example: "The troops were sent to the front." },
  { name: "Entity-Origin", count: 1400, example: "The river flows from the mountains." },
  { name: "Instrument-Agency", count: 1400, example: "The author uses a disassembler." },
  { name: "Member-Collection", count: 1400, example: "A soldier belongs to the army." },
  { name: "Message-Topic", count: 1400, example: "The lecture was about economics." },
  { name: "Product-Producer", count: 1400, example: "The factory manufactures cars." },
  { name: "Other", count: 1410, example: "No specific relation." },
];

const ORIGINAL_RELATION_TYPES = [
  { name: "Cause-Effect", count: 1003 },
  { name: "Component-Whole", count: 941 },
  { name: "Content-Container", count: 540 },
  { name: "Entity-Destination", count: 845 },
  { name: "Entity-Origin", count: 716 },
  { name: "Instrument-Agency", count: 504 },
  { name: "Member-Collection", count: 690 },
  { name: "Message-Topic", count: 634 },
  { name: "Product-Producer", count: 717 },
  { name: "Other", count: 1410 },
];

const ORIGINAL_TOTAL = 8000;
const TOTAL_SAMPLES = 14010;

const TEST_RESULTS = [
  { name: "Cause-Effect", precision: 0.90, recall: 0.86, f1: 0.88, support: 299 },
  { name: "Component-Whole", precision: 0.75, recall: 0.81, f1: 0.78, support: 313 },
  { name: "Content-Container", precision: 0.90, recall: 0.93, f1: 0.91, support: 281 },
  { name: "Entity-Destination", precision: 0.90, recall: 0.88, f1: 0.89, support: 274 },
  { name: "Entity-Origin", precision: 0.89, recall: 0.86, f1: 0.87, support: 286 },
  { name: "Instrument-Agency", precision: 0.87, recall: 0.90, f1: 0.88, support: 260 },
  { name: "Member-Collection", precision: 0.90, recall: 0.96, f1: 0.93, support: 295 },
  { name: "Message-Topic", precision: 0.84, recall: 0.84, f1: 0.84, support: 268 },
  { name: "Other", precision: 0.39, recall: 0.35, f1: 0.37, support: 262 },
  { name: "Product-Producer", precision: 0.84, recall: 0.83, f1: 0.84, support: 264 },
];

/* ------------------------------------------------------------------ */
/*  Survey Tab                                                         */
/* ------------------------------------------------------------------ */

const SurveyTab = () => (
  <div className="space-y-8">
    {/* 1. Introduction */}
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">1. Introduction</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Information extraction from unstructured text is a core challenge in Natural
        Language Processing (Grishman, 1997). As the volume of textual data grows,
        automated methods for structuring this information become essential
        (Freitag, 2000). This project focuses on
        <span className="font-medium text-foreground"> relation extraction</span> —
        identifying semantic relationships between entities mentioned in text — and
        representing the output as a
        <span className="font-medium text-foreground"> knowledge graph</span>.
      </p>
      <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
        <p className="text-[10px] font-medium text-foreground">References</p>
        <p className="text-[10px] text-muted-foreground">
          [1] Freitag, D. (2000). <span className="italic">Machine Learning for Information Extraction in Informal Domains.</span> Machine Learning, 39(2-3), 169-202.
        </p>
        <p className="text-[10px] text-muted-foreground">
          [2] Grishman, R. (1997). <span className="italic">Information Extraction: Techniques and Challenges.</span> International Summer School on Information Extraction.
        </p>
      </div>
    </section>

    <Separator />

    {/* 2. Knowledge Graphs */}
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">2. Knowledge Graphs</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        A knowledge graph is a structured representation of real-world entities and
        the relationships between them, stored as
        <span className="font-medium text-foreground"> (subject, relation, object) </span>
        triples (Nickel et al., 2016). Notable examples include Google's Knowledge
        Graph, Wikidata, and DBpedia. They power search engines, question answering
        systems, and recommendation engines (Hogan et al., 2021). Building them
        manually is expensive — automated extraction from text is the scalable
        alternative.
      </p>
      <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
        <p className="text-[10px] font-medium text-foreground">References</p>
        <p className="text-[10px] text-muted-foreground">
          [12] Nickel, M., Murphy, K., Tresp, V., & Gabrilovich, E. (2016). <span className="italic">A Review of Relational Machine Learning for Knowledge Graphs.</span> Proceedings of the IEEE, 104(1), 11-33.
        </p>
        <p className="text-[10px] text-muted-foreground">
          [13] Hogan, A., et al. (2021). <span className="italic">Knowledge Graphs.</span> ACM Computing Surveys, 54(4).
        </p>
      </div>
    </section>

    <Separator />

    {/* 3. Relation Extraction */}
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">3. Relation Extraction</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Relation extraction (RE) is the task of identifying the semantic relationship
        between two entities in a sentence. Given the sentence{" "}
        <span className="italic">"Einstein was born in Ulm"</span>, an RE system should
        extract the triple{" "}
        <span className="font-medium text-foreground">(Einstein, born-in, Ulm)</span>.
        RE is typically framed as a classification problem: given a sentence and two
        marked entities, predict which relation class holds between them.
      </p>
    </section>

    <Separator />

    {/* 4. Datasets for Relation Extraction */}
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        4. Datasets for Relation Extraction
      </h2>
      <h3 className="text-lg font-semibold tracking-tight">
        SemEval-2010 Task 8
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The{" "}
        <span className="font-medium text-foreground">SemEval-2010 Task 8</span>{" "}
        dataset is a standard benchmark for multi-way classification of semantic
        relations between pairs of nominals (Hendrickx et al., 2010). It was
        introduced as a shared task at the 4th International Workshop on Semantic
        Evaluations (SemEval-2010).
      </p>
      <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
        <p className="text-[10px] font-medium text-foreground">References</p>
        <p className="text-[10px] text-muted-foreground">
          [14] Hendrickx, I., et al. (2010). <span className="italic">SemEval-2010 Task 8: Multi-Way Classification of Semantic Relations Between Pairs of Nominals.</span> Proceedings of the Workshop on Semantic Evaluations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dataset Characteristics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs text-muted-foreground">
            <p>Each sample consists of a sentence where two entities are marked
              with <span className="font-mono text-foreground">&lt;e1&gt;</span> and{" "}
              <span className="font-mono text-foreground">&lt;e2&gt;</span> tags.
              The task is to classify the directed relation between them into one of
              9 semantic relation types (+ Other).</p>
            <p>Relations are directional — <span className="font-medium text-foreground">Cause-Effect(e1,e2)</span>{" "}
              means e1 causes e2, while <span className="font-medium text-foreground">Cause-Effect(e2,e1)</span>{" "}
              means e2 causes e1.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Key Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              {[
                ["Original Samples", "8,000"],
                ["Augmented Samples", "14,010"],
                ["Relation Classes", "10 (9 + Other)"],
                ["Directional", "Yes (e1,e2 / e2,e1)"],
                ["Language", "English"],
                ["Source", "Web text (various domains)"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relation Types Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Relation Types</h3>
        <Card>
          <CardContent className="pt-4 pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relation</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Cause-Effect", desc: "One entity causes or leads to the other", ex: "Smoking causes cancer" },
                  { name: "Component-Whole", desc: "One entity is a component/part of the other", ex: "The wheel is part of the car" },
                  { name: "Content-Container", desc: "One entity is contained within the other", ex: "Juice was in the bottle" },
                  { name: "Entity-Destination", desc: "An entity moves toward a destination", ex: "Troops were sent to the front" },
                  { name: "Entity-Origin", desc: "An entity originates from a source", ex: "The river flows from mountains" },
                  { name: "Instrument-Agency", desc: "An agent uses an instrument", ex: "The author uses a disassembler" },
                  { name: "Member-Collection", desc: "An entity is a member of a collection", ex: "A soldier belongs to the army" },
                  { name: "Message-Topic", desc: "A message/communication is about a topic", ex: "The lecture was about economics" },
                  { name: "Product-Producer", desc: "An entity produces or creates the other", ex: "The factory manufactures cars" },
                  { name: "Other", desc: "No specific semantic relation", ex: "The child was wrapped in a cradle" },
                ].map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium text-xs">{r.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.desc}</TableCell>
                    <TableCell className="text-right text-xs italic text-muted-foreground">{r.ex}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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

      {/* Original Distribution */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Original Distribution (8,000 samples)</h3>
        <div className="space-y-1.5">
          {ORIGINAL_RELATION_TYPES.sort((a, b) => b.count - a.count).map((rel) => {
            const pct = (rel.count / ORIGINAL_TOTAL) * 100;
            return (
              <div key={rel.name} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs font-medium text-foreground">
                  {rel.name}
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-red-500/50 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {rel.count}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Data Augmentation */}
      <h3 className="text-lg font-semibold tracking-tight">
        Data Augmentation
      </h3>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Why Augmentation Was Needed</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The original SemEval-2010 dataset has a
          <span className="font-medium text-foreground"> significant class imbalance</span>.
          The "Other" class contains 1,410 samples while "Instrument-Agency" has
          only 504 — nearly a 3:1 ratio. This imbalance causes the model to
          be biased toward majority classes, underperforming on minority relations.
          Training on imbalanced data leads to:
        </p>
        <ul className="space-y-1 text-sm text-muted-foreground pl-4">
          <li>
            <span className="font-medium text-foreground">Prediction bias</span>{" "}
            — model defaults to predicting frequent classes
          </li>
          <li>
            <span className="font-medium text-foreground">Poor minority recall</span>{" "}
            — rare relations like Instrument-Agency and Content-Container get misclassified
          </li>
          <li>
            <span className="font-medium text-foreground">Misleading accuracy</span>{" "}
            — overall accuracy looks decent while per-class performance is poor
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Augmentation Method — Synonym Replacement</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We used
          <span className="font-medium text-foreground"> WordNet-based synonym replacement </span>
          to generate new training samples. For each sentence, 1-3 non-entity words
          are replaced with their synonyms from WordNet. Entity names, relation labels,
          and direction are preserved exactly — only the surrounding context changes.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-muted-foreground">
              <p>1. For each underrepresented class, randomly select a source sample</p>
              <p>2. Identify non-entity words longer than 3 characters</p>
              <p>3. Look up synonyms in WordNet for 1-3 of those words</p>
              <p>4. Replace with a random synonym, preserving punctuation and casing</p>
              <p>5. Keep the original entity names, relation, and direction intact</p>
              <p>6. Repeat until the class reaches the target count (1,400)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Why Synonym Replacement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Preserves semantics</span>{" "}
                — synonyms maintain the meaning of the sentence, so the relation label remains valid
              </p>
              <p>
                <span className="font-medium text-foreground">Entity-safe</span>{" "}
                — only non-entity words are modified, ensuring the relation between entities is unchanged
              </p>
              <p>
                <span className="font-medium text-foreground">Vocabulary diversity</span>{" "}
                — introduces new words the model wouldn't otherwise see, improving generalization
              </p>
              <p>
                <span className="font-medium text-foreground">No external data needed</span>{" "}
                — works entirely from the existing dataset using WordNet, a built-in lexical database
              </p>
            </CardContent>
          </Card>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
{`# Example augmentation
Original:  "The author of a keygen uses a disassembler to look at the raw assembly code."
Augmented: "The writer of a keygen uses a disassembler to look at the raw assembly code."
           ↑ "author" → "writer" (synonym)

Entities:  author, disassembler  →  unchanged
Relation:  Instrument-Agency     →  unchanged
Direction: e2,e1                 →  unchanged`}
        </pre>
      </div>

      {/* Balanced Distribution */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Balanced Distribution (14,010 samples)</h4>
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
                      className="h-full rounded-full bg-green-500/50 transition-all"
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

      {/* Impact Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
            {[
              ["Original Size", "8,000"],
              ["Augmented Size", "14,010"],
              ["New Samples Added", "6,010"],
              ["Target Per Class", "1,400"],
              ["Imbalance Ratio (Before)", "2.8:1"],
              ["Imbalance Ratio (After)", "~1:1"],
              ["Method", "WordNet synonyms"],
              ["Augmented Classes", "9 of 10"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>

    <Separator />

    {/* 5. Evolution of RE Models */}
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        5. Evolution of Relation Extraction Models
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Relation extraction methods have evolved through five major paradigms,
        each addressing limitations of its predecessor:
      </p>

      {/* Evolution flow */}
      <div className="space-y-3">
        {/* Stage 1: Rule-based */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">1</div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Rule-Based Systems</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The earliest RE approaches used hand-written lexico-syntactic patterns
                  (Grishman, 1997). Hearst patterns (1992) like{" "}
                  <span className="font-mono text-foreground">"X such as Y"</span> could
                  extract hypernym relations with high precision. Machine learning for
                  information extraction in informal domains showed promise but remained
                  limited (Freitag, 2000). Rules must be manually crafted for each relation
                  type and domain, resulting in low recall and poor generalization to unseen
                  text patterns.
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">High precision</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Low recall</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Manual effort</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Domain-specific</Badge>
                </div>
                <div className="rounded border border-border bg-muted/50 p-2 mt-1 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    [1] Freitag, D. (2000). <span className="italic">Machine Learning for Information Extraction in Informal Domains.</span> Machine Learning, 39(2-3), 169-202.
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    [2] Grishman, R. (1997). <span className="italic">Information Extraction: Techniques and Challenges.</span> International Summer School on Information Extraction.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center text-muted-foreground text-lg">↓</div>

        {/* Stage 2: Traditional ML */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">2</div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Traditional Machine Learning</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Statistical classifiers (SVM, MaxEnt, Naive Bayes) replaced manual rules
                  by learning from annotated data. Kernel methods for relation extraction
                  (Zelenko et al., 2003) operated directly on parse tree structures.
                  Combining lexical, syntactic, and semantic features with maximum entropy
                  models (Kambhatla, 2004) showed strong results. Features were still
                  hand-engineered — POS tags, dependency parse paths, word distance, lexical
                  patterns. These methods improved recall but required extensive feature
                  engineering and struggled with unseen syntactic patterns.
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">Better recall</Badge>
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">Learns from data</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Feature engineering</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Needs parsed input</Badge>
                </div>
                <div className="rounded border border-border bg-muted/50 p-2 mt-1 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    [3] Zelenko, D., Aone, C., & Richardella, A. (2003). <span className="italic">Kernel Methods for Relation Extraction.</span> JMLR, 3, 1083-1106.
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    [4] Kambhatla, N. (2004). <span className="italic">Combining Lexical, Syntactic, and Semantic Features with Maximum Entropy Models for Extracting Relations.</span> Proceedings of ACL.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center text-muted-foreground text-lg">↓</div>

        {/* Stage 3: Deep Learning */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">3</div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Deep Learning (RNN / CNN / LSTM)</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Deep learning eliminated manual feature engineering entirely.
                  Recursive neural networks for semantic compositionality (Socher et al.,
                  2012) showed that neural models could learn meaningful representations.{" "}
                  <span className="font-medium text-foreground">CNNs</span> for relation
                  classification (Zeng et al., 2014) learned local n-gram features from
                  word + position embeddings.{" "}
                  <span className="font-medium text-foreground">Bidirectional RNNs</span>{" "}
                  (Zhang & Wang, 2015) captured long-range sequential dependencies, reading
                  context from both directions. Position embeddings were introduced to encode
                  the relative distance of each token to the two entities, giving the model
                  spatial awareness without explicit parsing.
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">No feature engineering</Badge>
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">Learns representations</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Treats all tokens equally</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Fixed-length bottleneck</Badge>
                </div>
                <div className="rounded border border-border bg-muted/50 p-2 mt-1 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    [5] Socher, R., et al. (2012). <span className="italic">Semantic Compositionality Through Recursive Matrix-Vector Spaces.</span> Proceedings of EMNLP.
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    [6] Zeng, D., Liu, K., Lai, S., Zhou, G., & Zhao, J. (2014). <span className="italic">Relation Classification via Convolutional Deep Neural Network.</span> Proceedings of COLING.
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    [7] Zhang, Y., & Wang, D. (2015). <span className="italic">A Bidirectional Recurrent Neural Network for Relation Classification.</span> Proceedings of PACLIC.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center text-muted-foreground text-lg">↓</div>

        {/* Stage 4: Attention */}
        <Card className="border-primary/50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Attention Models
                  <Badge variant="default" className="text-[10px]">Our approach</Badge>
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The attention mechanism, originally proposed for neural machine translation
                  (Bahdanau et al., 2015), solved the fixed-length bottleneck by allowing
                  models to focus on the most relevant tokens. Neural relation extraction
                  with selective attention over instances (Lin et al., 2016) applied this to
                  RE, computing a weighted sum over all hidden states — tokens near the
                  entities or carrying relational meaning receive higher weights. Combined
                  with BiLSTMs, this produced strong results on SemEval-2010 (~85% F1)
                  while remaining lightweight enough for CPU inference.{" "}
                  <span className="font-medium text-foreground">
                    This is the paradigm our project uses.
                  </span>
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">Focuses on key tokens</Badge>
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">Interpretable weights</Badge>
                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">Lightweight</Badge>
                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">No pre-trained knowledge</Badge>
                </div>
                <div className="rounded border border-border bg-muted/50 p-2 mt-1 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    [8] Bahdanau, D., Cho, K., & Bengio, Y. (2015). <span className="italic">Neural Machine Translation by Jointly Learning to Align and Translate.</span> Proceedings of ICLR.
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    [9] Lin, Y., Shen, S., Liu, Z., Luan, H., & Sun, M. (2016). <span className="italic">Neural Relation Extraction with Selective Attention over Instances.</span> Proceedings of ACL.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </section>

    <Separator />

    {/* 6. Limitations of Existing Approaches */}
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">
        6. Limitations of Existing Approaches
      </h2>
      <ul className="space-y-2 text-sm text-muted-foreground pl-4">
        <li className="flex gap-2">
          <span className="text-foreground font-medium shrink-0">Compute cost:</span>
          Transformer models are heavy — BERT-base has 110M parameters, making real-time inference on CPU impractical.
        </li>
        <li className="flex gap-2">
          <span className="text-foreground font-medium shrink-0">Entity pair explosion:</span>
          Most systems evaluate all O(n^2) entity pairs per sentence, which is wasteful when entities are far apart and unlikely to be related.
        </li>
        <li className="flex gap-2">
          <span className="text-foreground font-medium shrink-0">Pipeline disconnect:</span>
          RE models are often evaluated in isolation — few systems integrate entity detection, relation classification, and visualization end-to-end.
        </li>
        <li className="flex gap-2">
          <span className="text-foreground font-medium shrink-0">Class imbalance:</span>
          Benchmarks like SemEval-2010 have skewed distributions. The "Other" class often dominates, biasing models toward predicting no relation.
        </li>
      </ul>
    </section>

    <Separator />

    {/* 7. Motivation for Our Approach */}
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">
        7. Motivation for Our Approach
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        This project aims to build a
        <span className="font-medium text-foreground"> lightweight, end-to-end knowledge graph extraction system </span>
        that balances accuracy with practical deployability. Rather than using
        heavy transformer models, we use a
        <span className="font-medium text-foreground"> BiLSTM + Attention </span>
        architecture that runs efficiently on CPU. We introduce
        <span className="font-medium text-foreground"> distance-based entity pair filtering </span>
        to prune unlikely pairs before classification, reducing inference cost. We
        address class imbalance through
        <span className="font-medium text-foreground"> synonym-based data augmentation</span>,
        balancing the training distribution to 1,400 samples per class. The full
        pipeline — from raw text to interactive graph — is integrated into a single
        application.
      </p>
    </section>

  </div>
);

/* ------------------------------------------------------------------ */
/*  Analysis Tab                                                       */
/* ------------------------------------------------------------------ */

const AnalysisTab = () => (
  <div className="space-y-8">
    {/* Summary cards */}
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">82.4%</p>
          <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">0.82</p>
          <p className="text-xs text-muted-foreground mt-1">Macro Avg F1</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">2,802</p>
          <p className="text-xs text-muted-foreground mt-1">Test Samples</p>
        </CardContent>
      </Card>
    </div>

    <Separator />

    {/* Classification Report */}
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        Classification Report
      </h2>
      <Card>
        <CardContent className="pt-4 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relation</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">F1-Score</TableHead>
                <TableHead className="text-right">Support</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TEST_RESULTS.sort((a, b) => b.f1 - a.f1).map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium text-xs">{r.name}</TableCell>
                  <TableCell className="text-right text-xs">{r.precision.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-xs">{r.recall.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-xs">
                    <span
                      className={
                        r.f1 >= 0.85
                          ? "text-green-500"
                          : r.f1 >= 0.7
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {r.f1.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {r.support}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-medium text-xs">Weighted Avg</TableCell>
                <TableCell className="text-right text-xs">0.82</TableCell>
                <TableCell className="text-right text-xs">0.82</TableCell>
                <TableCell className="text-right text-xs font-semibold">0.82</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">2,802</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </section>

    <Separator />

    {/* Training Config */}
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Training Configuration</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
            {[
              ["Epochs", "40"],
              ["Batch Size", "32"],
              ["Learning Rate", "0.001"],
              ["Optimizer", "Adam"],
              ["Loss", "CrossEntropyLoss"],
              ["Train/Test Split", "80 / 20"],
              ["Final Train Loss", "0.012"],
              ["Augmentation", "Synonym replacement"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Innovation Tab                                                     */
/* ------------------------------------------------------------------ */

const InnovationTab = () => (
  <div className="space-y-8">
    {/* Overview */}
    <section className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Our system combines two key innovations: a
        <span className="font-medium text-foreground"> deep learning architecture </span>
        (BiLSTM + Attention) for relation classification and a
        <span className="font-medium text-foreground"> distance-based entity pair filtering </span>
        strategy that prunes unlikely entity pairs before they reach the model.
        Together, these make the pipeline both accurate and efficient enough for
        real-time, CPU-based inference.
      </p>
    </section>

    <Separator />

    {/* Innovation 1: Distance-Based Entity Pair Filtering */}
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        Distance-Based Entity Pair Filtering
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        In a sentence with <span className="font-mono text-foreground">n</span> entities,
        a naive approach evaluates all{" "}
        <span className="font-mono text-foreground">n(n-1)/2</span> pairs through the
        classifier. Most distant pairs are unrelated — evaluating them wastes compute
        and introduces noise. Our approach filters pairs
        <span className="font-medium text-foreground"> before </span> classification
        using token distance.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>1. Extract entities via spaCy NER (with noun fallback)</li>
              <li>2. Compute token-level distance between each entity pair</li>
              <li>
                3. Discard pairs where distance &gt;{" "}
                <span className="font-mono text-foreground">max_distance</span> (default: 5 tokens)
              </li>
              <li>
                4. Cap at{" "}
                <span className="font-mono text-foreground">max_pairs</span> (default: 15)
                per sentence
              </li>
              <li>5. Classify only the surviving pairs</li>
              <li>6. Select the highest-confidence result per sentence</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Reduced inference cost</span>{" "}
                — fewer pairs means fewer forward passes through the model
              </li>
              <li>
                <span className="font-medium text-foreground">Less noise</span>{" "}
                — distant entity pairs rarely have meaningful relations; filtering them
                prevents low-confidence predictions from polluting the graph
              </li>
              <li>
                <span className="font-medium text-foreground">Configurable</span>{" "}
                — max_distance and max_pairs can be tuned per use case
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
{`# Distance-based filtering (server/app.py)
def generate_entity_pairs(entities, max_distance=5, max_pairs=15):
    pairs = []
    for i in range(len(entities)):
        for j in range(i + 1, len(entities)):
            if len(pairs) >= max_pairs:
                return pairs
            distance = abs(get_position(e1) - get_position(e2))
            if distance <= max_distance:
                pairs.append((e1.text, e2.text))
    return pairs`}
      </pre>
    </section>

    <Separator />

    {/* Innovation 2: Deep Learning Model */}
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        BiLSTM + Attention Architecture
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Instead of heavyweight transformers, we use a lightweight BiLSTM with an
        attention mechanism that achieves competitive accuracy while running
        efficiently on CPU.
      </p>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
            {[
              ["Architecture", "BiLSTM + Attention"],
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Input Representation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Each token is represented by concatenating a 50-dim word embedding
              with two 10-dim relative position embeddings (distance to entity 1 and
              entity 2), producing a 70-dim input vector per token.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bidirectional LSTM</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A bidirectional LSTM with 64 hidden units processes the sequence in
              both directions, capturing left and right context for each token.
              The output is a 128-dim hidden state per token.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Attention + Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              An attention layer computes a weighted sum over all hidden states,
              focusing on the most relation-relevant tokens. The resulting context
              vector passes through dropout (0.5) and a linear layer to predict
              one of 10 relation classes.
            </p>
          </CardContent>
        </Card>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
{`# Model forward pass (src/model.py)
def forward(self, word_ids, pos1, pos2):
    word_emb  = self.word_embedding(word_ids)    # [batch, seq, 50]
    pos1_emb  = self.pos1_embedding(pos1)        # [batch, seq, 10]
    pos2_emb  = self.pos2_embedding(pos2)        # [batch, seq, 10]

    x = torch.cat([word_emb, pos1_emb, pos2_emb], dim=2)  # [batch, seq, 70]

    lstm_out, _ = self.lstm(x)                   # [batch, seq, 128]

    attn_weights = F.softmax(self.attention(lstm_out), dim=1)
    context = torch.sum(attn_weights * lstm_out, dim=1)    # [batch, 128]

    return self.fc(self.dropout(context))        # [batch, 10]`}
      </pre>
    </section>

    <Separator />

    {/* End-to-end pipeline */}
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        End-to-End Pipeline
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Unlike standalone RE models, this system integrates entity detection,
        distance filtering, relation classification, and graph visualization into
        a single deployable application.
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {[
          "Raw Text",
          "Sentence Splitting (spaCy)",
          "Entity Detection (NER + Noun Fallback)",
          "Distance-Based Pair Filtering",
          "BiLSTM + Attention Classification",
          "Confidence-Based Selection",
          "Interactive Knowledge Graph",
        ].map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <Badge variant={i === 0 || i === 6 ? "default" : "outline"}>
              {step}
            </Badge>
            {i < 6 && <span className="text-muted-foreground">→</span>}
          </span>
        ))}
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
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

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

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Tabs defaultValue="survey">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="survey">Survey</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="innovation">Innovation</TabsTrigger>
          </TabsList>

          <TabsContent value="survey" className="mt-8">
            <SurveyTab />
          </TabsContent>

          <TabsContent value="analysis" className="mt-8">
            <AnalysisTab />
          </TabsContent>

          <TabsContent value="innovation" className="mt-8">
            <InnovationTab />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="pt-8 pb-10 text-center text-xs text-muted-foreground">
          Built as a knowledge graph extraction research project.
        </div>
      </main>
    </div>
  );
};

export default About;

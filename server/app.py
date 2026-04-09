import torch
import spacy
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.datasetloader import RelationDataset
from src.model import RelationModel
from src.inference import predict_with_confidence


# =========================
# CONFIG
# =========================

DATA_PATH = "./data/processed/processed_data.json"
MODEL_PATH = "./models/model.pth"

EMBEDDING_DIM = 100
POS_EMBEDDING_DIM = 10
HIDDEN_DIM = 128


# =========================
# FASTAPI INIT
# =========================

app = FastAPI(
    title="Knowledge Graph Relation Extraction API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp = spacy.load("en_core_web_sm")


# =========================
# REQUEST SCHEMA
# =========================

class ParagraphRequest(BaseModel):
    text: str


# =========================
# LOAD MODEL ON STARTUP
# =========================

dataset = None
model = None


@app.on_event("startup")
def load_model():

    global dataset, model

    print("Loading dataset...")
    dataset = RelationDataset(DATA_PATH)

    vocab_size = len(dataset.vocab)
    num_classes = len(dataset.label_map)

    model_instance = RelationModel(
        vocab_size,
        EMBEDDING_DIM,
        POS_EMBEDDING_DIM,
        HIDDEN_DIM,
        num_classes
    )

    print("Loading trained model...")
    model_instance.load_state_dict(
        torch.load(MODEL_PATH, map_location="cpu")
    )

    model_instance.eval()

    model = model_instance

    print("Model loaded successfully")


# =========================
# DEPENDENCY-BASED PAIRING
# =========================

def dependency_pairs(sentence):
    """
    Extract entity pairs from the dependency tree.
    Covers: verb relations, prepositional phrases,
    compound nouns, appositives, and passive agents.
    """

    pairs = []
    seen = set()

    def add_pair(e1, e2):
        # Skip pronouns — not meaningful entities
        if e1.lower() in ("it", "he", "she", "they", "them", "his", "her", "its", "this", "that", "these", "those", "who", "which"):
            return
        if e2.lower() in ("it", "he", "she", "they", "them", "his", "her", "its", "this", "that", "these", "those", "who", "which"):
            return
        key = (e1.lower(), e2.lower())
        if key not in seen and e1.lower() != e2.lower():
            seen.add(key)
            pairs.append((e1, e2))

    for token in sentence:

        # 1. Verb → subject + direct object / attribute
        if token.pos_ == "VERB":

            verbs = [token]

            # Collect coordinated verbs (sells and distributes)
            for child in token.children:
                if child.dep_ == "conj" and child.pos_ == "VERB":
                    verbs.append(child)

            # Find subject from the main verb
            subject = None
            for child in token.children:
                if child.dep_ in ["nsubj", "nsubjpass"]:
                    subject = child

            if subject is None:
                continue

            for verb in verbs:

                # Direct object
                for child in verb.children:
                    if child.dep_ in ["dobj", "attr"]:
                        add_pair(subject.text, child.text)

                # 2. Verb → subject + prepositional object
                #    e.g. "sells computers through channels"
                #    e.g. "distributes accessories to customers"
                for child in verb.children:
                    if child.dep_ == "prep":
                        for grandchild in child.children:
                            if grandchild.dep_ == "pobj":
                                add_pair(subject.text, grandchild.text)

                                # Also pair direct object with prep object
                                # e.g. (accessories, customers)
                                for sibling in verb.children:
                                    if sibling.dep_ == "dobj":
                                        add_pair(sibling.text, grandchild.text)

        # 3. Noun → prep → pobj (noun-of-noun)
        #    e.g. "regions of the world", "parts of the car"
        if token.pos_ in ["NOUN", "PROPN"]:

            for child in token.children:
                if child.dep_ == "prep":
                    for grandchild in child.children:
                        if grandchild.dep_ == "pobj":
                            add_pair(token.text, grandchild.text)

            # 4. Compound nouns
            #    e.g. "automation systems" → (automation, systems)
            for child in token.children:
                if child.dep_ == "compound":
                    add_pair(child.text, token.text)

            # 5. Appositive relations
            #    e.g. "Einstein, a physicist" → (Einstein, physicist)
            for child in token.children:
                if child.dep_ == "appos":
                    add_pair(token.text, child.text)

    return pairs


# =========================
# CORE EXTRACTION LOGIC
# =========================

def extract_triples_from_text(text):

    doc = nlp(text)

    results = []

    for sentence in doc.sents:

        sentence_text = sentence.text

        print("Sentence:", sentence_text)

        pairs = dependency_pairs(sentence)

        print("Pairs:", pairs)

        if not pairs:
            continue

        CONFIDENCE_THRESHOLD = 0.5

        # Evaluate all candidate pairs
        for e1, e2 in pairs:

            prediction = predict_with_confidence(
                sentence_text,
                e1,
                e2
            )

            confidence = prediction["confidence"]

            print(
                "PAIR:",
                e1,
                e2,
                "REL:",
                prediction["relation"],
                "CONF:",
                round(confidence, 4)
            )

            # Keep all predictions above threshold
            # that are not "Other"
            if (
                confidence >= CONFIDENCE_THRESHOLD
                and prediction["relation"] != "Other"
            ):
                results.append(
                    {
                        "sentence": sentence_text,
                        "entity1": prediction["entity1"],
                        "relation": prediction["relation"],
                        "entity2": prediction["entity2"],
                        "confidence": round(
                            confidence,
                            4
                        )
                    }
                )

    return results


# =========================
# API ENDPOINTS
# =========================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


@app.post("/extract")
def extract_relations(request: ParagraphRequest):

    triples = extract_triples_from_text(
        request.text
    )

    return {
        "triples": triples,
        "count": len(triples)
    }
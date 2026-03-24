import torch
import spacy
from fastapi import FastAPI
from pydantic import BaseModel

from src.datasetloader import RelationDataset
from src.model import RelationModel
from src.inference import predict_with_confidence


# =========================
# CONFIG
# =========================

DATA_PATH = "./data/processed/processed_data.json"
MODEL_PATH = "./models/model.pth"

EMBEDDING_DIM = 50
POS_EMBEDDING_DIM = 10
HIDDEN_DIM = 64


# =========================
# FASTAPI INIT
# =========================

app = FastAPI(
    title="Knowledge Graph Relation Extraction API",
    version="1.0"
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
# ENTITY DETECTION
# =========================

def get_entities(sentence):

    # Try Named Entity Recognition first
    entities = list(sentence.ents)

    # Fallback to noun detection if needed
    if len(entities) < 2:

        entities = [
            token
            for token in sentence
            if token.pos_ in ["NOUN", "PROPN"]
        ]

    return entities


# =========================
# POSITION HELPER
# =========================

def get_position(entity):

    if hasattr(entity, "start"):
        return entity.start

    return entity.i


# =========================
# PAIR GENERATION
# =========================

def generate_entity_pairs(
    entities,
    max_distance=5,
    max_pairs=15
):

    pairs = []

    for i in range(len(entities)):
        for j in range(i + 1, len(entities)):

            if len(pairs) >= max_pairs:
                return pairs

            e1 = entities[i]
            e2 = entities[j]

            pos1 = get_position(e1)
            pos2 = get_position(e2)

            distance = abs(
                pos1 - pos2
            )

            if distance <= max_distance:

                pairs.append(
                    (
                        e1.text,
                        e2.text
                    )
                )

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

        entities = get_entities(sentence)

        print(
            "Entities:",
            [e.text for e in entities]
        )

        if len(entities) < 2:
            continue

        pairs = generate_entity_pairs(
            entities,
            max_distance=5,
            max_pairs=15
        )

        print("Pairs:", pairs)

        if not pairs:
            continue

        best_result = None
        best_confidence = -1

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

            # Always select highest confidence
            if confidence > best_confidence:

                best_confidence = confidence
                best_result = prediction

        # Always append one result per sentence
        if best_result is not None:

            print("BEST RESULT:", best_result)

            results.append(
                {
                    "sentence": sentence_text,
                    "entity1": best_result["entity1"],
                    "relation": best_result["relation"],
                    "entity2": best_result["entity2"],
                    "confidence": round(
                        best_confidence,
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
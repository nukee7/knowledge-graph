import torch
import spacy
from fastapi import FastAPI
from pydantic import BaseModel

from src.datasetloader import RelationDataset
from src.model import RelationModel
from src.inference import predict_relation


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


# Load spaCy model
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
# HELPER FUNCTIONS
# =========================

def generate_entity_pairs(
    entities,
    max_distance=5,
    max_pairs=15
):
    """
    Generate entity pairs using distance-based filtering
    and a maximum pair limit.

    Parameters:
        entities: list of spaCy entities
        max_distance: maximum token distance allowed
        max_pairs: maximum number of pairs to generate

    Returns:
        list of (entity1, entity2) tuples
    """

    pairs = []

    for i in range(len(entities)):
        for j in range(i + 1, len(entities)):

            # Stop if pair limit reached
            if len(pairs) >= max_pairs:
                return pairs

            e1 = entities[i]
            e2 = entities[j]

            # Token distance between entities
            distance = abs(e1.start - e2.start)

            # Keep only nearby entities
            if distance <= max_distance:

                pairs.append(
                    (
                        e1.text,
                        e2.text
                    )
                )

    return pairs


def extract_triples_from_text(text):

    doc = nlp(text)

    triples = []

    for sentence in doc.sents:

        entities = list(sentence.ents)

        if len(entities) < 2:
            continue

        pairs = generate_entity_pairs(entities)

        for e1, e2 in pairs:

            result = predict_relation(
                sentence.text,
                e1,
                e2
            )

            triples.append(
                {
                    "entity1": e1,
                    "relation": result["relation"],
                    "entity2": e2
                }
            )

    return triples


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
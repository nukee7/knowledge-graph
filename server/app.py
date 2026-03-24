import torch
import nltk
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from src.datasetloader import RelationDataset
from src.model import RelationModel

nltk.download("punkt")

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
    description="Predict relations between entities using trained RNN + Attention model",
    version="1.0"
)


# =========================
# REQUEST SCHEMAS
# =========================

class PredictionRequest(BaseModel):
    sentence: str
    entity1: str
    entity2: str


class BatchPredictionRequest(BaseModel):
    items: List[PredictionRequest]


# =========================
# GLOBALS (loaded once)
# =========================

dataset = None
model = None
device = None
id_to_label = None


# =========================
# STARTUP: LOAD MODEL
# =========================

@app.on_event("startup")
def load_model():

    global dataset, model, device, id_to_label

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

    device_instance = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    model_instance.to(device_instance)
    model_instance.eval()

    dataset_instance = dataset

    id_to_label_map = {
        v: k for k, v in dataset_instance.label_map.items()
    }

    dataset = dataset_instance
    model = model_instance
    device = device_instance
    id_to_label = id_to_label_map

    print("Model loaded successfully")


# =========================
# HELPER FUNCTIONS
# =========================

def encode(sentence, e1, e2):

    sentence = dataset.mark_entities(sentence, e1, e2)

    tokens = nltk.word_tokenize(sentence.lower())

    word_ids = [
        dataset.vocab.get(t, 1)
        for t in tokens
    ]

    def get_index(marker):

        for i, t in enumerate(tokens):
            if t == marker:
                return i
        return 0

    e1_idx = get_index("<e1>")
    e2_idx = get_index("<e2>")

    pos1 = [i - e1_idx for i in range(len(tokens))]
    pos2 = [i - e2_idx for i in range(len(tokens))]

    return tokens, word_ids, pos1, pos2


def predict_relation(sentence, e1, e2):

    tokens, word_ids, pos1, pos2 = encode(
        sentence,
        e1,
        e2
    )

    word_ids = torch.tensor(
        [word_ids],
        dtype=torch.long
    ).to(device)

    pos1 = torch.tensor(
        [pos1],
        dtype=torch.long
    ).to(device)

    pos2 = torch.tensor(
        [pos2],
        dtype=torch.long
    ).to(device)

    with torch.no_grad():

        outputs = model(
            word_ids,
            pos1,
            pos2
        )

        pred = torch.argmax(
            outputs,
            dim=1
        ).item()

    relation = id_to_label[pred]

    return {
        "entity1": e1,
        "relation": relation,
        "entity2": e2
    }


# =========================
# ROUTES
# =========================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


@app.post("/predict")
def predict(request: PredictionRequest):

    result = predict_relation(
        request.sentence,
        request.entity1,
        request.entity2
    )

    return {
        "input": request,
        "prediction": result
    }


@app.post("/batch_predict")
def batch_predict(request: BatchPredictionRequest):

    results = []

    for item in request.items:

        result = predict_relation(
            item.sentence,
            item.entity1,
            item.entity2
        )

        results.append(result)

    return {
        "predictions": results
    }
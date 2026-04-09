import torch
import torch.nn.functional as F
import nltk

from src.model import RelationModel
from src.datasetloader import RelationDataset

import ssl
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context
nltk.download("punkt_tab", quiet=True)

MODEL_PATH = "./models/model.pth"
DATA_PATH = "./data/processed/processed_data.json"

CONFIDENCE_THRESHOLD = 0.6


# -------- LOAD DATASET --------
dataset = RelationDataset(DATA_PATH)

vocab = dataset.vocab
label_map = dataset.label_map
id_to_label = {v: k for k, v in label_map.items()}


# -------- LOAD MODEL --------
model = RelationModel(
    vocab_size=len(vocab),
    embedding_dim=100,
    pos_embedding_dim=10,
    hidden_dim=128,
    num_classes=len(label_map)
)

model.load_state_dict(
    torch.load(MODEL_PATH, map_location="cpu")
)

model.eval()


# -------- HELPER FUNCTIONS --------
def mark_entities(sentence, e1, e2):
    """Add entity markers to match training format."""
    sentence = sentence.replace(e1, f" <e1> {e1} </e1> ")
    sentence = sentence.replace(e2, f" <e2> {e2} </e2> ")
    return sentence


def encode_sentence(sentence, entity1, entity2):

    marked = mark_entities(sentence, entity1, entity2)

    tokens = nltk.word_tokenize(
        marked.lower()
    )

    word_ids = [
        vocab.get(t, 1)
        for t in tokens
    ]

    return tokens, word_ids


def get_entity_index(tokens, marker):

    for i, t in enumerate(tokens):
        if t == marker:
            return i

    return 0


def get_positions(tokens, marker):

    idx = get_entity_index(
        tokens,
        marker
    )

    return [
        i - idx
        for i in range(len(tokens))
    ]


# -------- SINGLE PAIR PREDICTION WITH CONFIDENCE --------
def predict_with_confidence(
    sentence,
    entity1,
    entity2
):

    tokens, word_ids = encode_sentence(
        sentence,
        entity1,
        entity2
    )

    pos1 = get_positions(
        tokens,
        "<e1>"
    )

    pos2 = get_positions(
        tokens,
        "<e2>"
    )

    word_ids = torch.tensor(
        [word_ids],
        dtype=torch.long
    )

    pos1 = torch.tensor(
        [pos1],
        dtype=torch.long
    )

    pos2 = torch.tensor(
        [pos2],
        dtype=torch.long
    )

    with torch.no_grad():

        outputs = model(
            word_ids,
            pos1,
            pos2
        )

        probabilities = F.softmax(
            outputs,
            dim=1
        )

        confidence, pred = torch.max(
            probabilities,
            dim=1
        )

    relation = id_to_label[
        pred.item()
    ]

    return {

        "entity1": entity1,
        "relation": relation,
        "entity2": entity2,
        "confidence": confidence.item()

    }


# -------- BEST RELATION PER SENTENCE --------
def predict_best_relation(
    sentence,
    entity_pairs
):

    best_result = None

    best_confidence = 0

    for e1, e2 in entity_pairs:

        result = predict_with_confidence(
            sentence,
            e1,
            e2
        )

        if result["confidence"] > best_confidence:

            best_confidence = result[
                "confidence"
            ]

            best_result = result

    if best_result is None:

        return None

    if best_confidence < CONFIDENCE_THRESHOLD:

        return None

    return best_result


# -------- TEST --------
if __name__ == "__main__":

    sentence = (
        "The system has a configuration "
        "of antenna elements"
    )

    entity_pairs = [

        ("configuration", "elements"),
        ("system", "elements"),
        ("system", "configuration")

    ]

    result = predict_best_relation(
        sentence,
        entity_pairs
    )

    print("Best Relation:")
    print(result)
import torch
import torch.nn.functional as F
import nltk

from src.model import RelationModel
from src.datasetloader import RelationDataset

nltk.download("punkt")

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
    embedding_dim=50,
    pos_embedding_dim=10,
    hidden_dim=64,
    num_classes=len(label_map)
)

model.load_state_dict(
    torch.load(MODEL_PATH, map_location="cpu")
)

model.eval()


# -------- HELPER FUNCTIONS --------
def encode_sentence(sentence):

    tokens = nltk.word_tokenize(
        sentence.lower()
    )

    word_ids = [
        vocab.get(t, 1)
        for t in tokens
    ]

    return tokens, word_ids


def get_entity_index(tokens, entity):

    entity_tokens = entity.lower().split()

    for i in range(len(tokens)):

        if tokens[i:i + len(entity_tokens)] == entity_tokens:

            return i

    return 0


def get_positions(tokens, entity):

    idx = get_entity_index(
        tokens,
        entity
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
        sentence
    )

    pos1 = get_positions(
        tokens,
        entity1
    )

    pos2 = get_positions(
        tokens,
        entity2
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
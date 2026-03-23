import torch
import nltk
from src.model import RelationModel
from src.datasetloader import RelationDataset

nltk.download("punkt")

MODEL_PATH = "./models/model.pth"
DATA_PATH = "./data/processed/processed_data.json"


# -------- LOAD DATASET (for vocab + label map) --------
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

model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
model.eval()


# -------- HELPER FUNCTIONS --------
def encode_sentence(sentence):
    tokens = nltk.word_tokenize(sentence.lower())
    return tokens, [vocab.get(t, 1) for t in tokens]


def get_entity_index(tokens, entity):
    entity_tokens = entity.lower().split()
    for i in range(len(tokens)):
        if tokens[i:i+len(entity_tokens)] == entity_tokens:
            return i
    return 0


def get_positions(tokens, entity):
    idx = get_entity_index(tokens, entity)
    return [i - idx for i in range(len(tokens))]


# -------- MAIN INFERENCE FUNCTION --------
def predict(sentence, entity1, entity2):

    tokens, word_ids = encode_sentence(sentence)

    pos1 = get_positions(tokens, entity1)
    pos2 = get_positions(tokens, entity2)

    # Convert to tensor
    word_ids = torch.tensor([word_ids], dtype=torch.long)
    pos1 = torch.tensor([pos1], dtype=torch.long)
    pos2 = torch.tensor([pos2], dtype=torch.long)

    with torch.no_grad():
        outputs = model(word_ids, pos1, pos2)
        pred = torch.argmax(outputs, dim=1).item()

    relation = id_to_label[pred]

    return (entity1, relation, entity2)


# -------- TEST --------
if __name__ == "__main__":

    sentence = "The system has a configuration of antenna elements"
    e1 = "configuration"
    e2 = "elements"

    result = predict(sentence, e1, e2)

    print("Predicted Triple:")
    print(result)
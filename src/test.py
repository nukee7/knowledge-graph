import torch
from torch.utils.data import DataLoader, Subset
from sklearn.metrics import classification_report, accuracy_score

from src.datasetloader import RelationDataset
from src.model import RelationModel


# -------- CONFIG --------
DATA_PATH = "./data/processed/processed_data.json"
MODEL_PATH = "./models/model.pth"
TEST_INDICES_PATH = "./data/test_indices.pt"

BATCH_SIZE = 32

EMBEDDING_DIM = 50
POS_EMBEDDING_DIM = 10
HIDDEN_DIM = 64


# -------- COLLATE FUNCTION --------
def collate_fn(batch):

    word_ids, pos1, pos2, labels = zip(*batch)

    max_len = max(len(x) for x in word_ids)

    def pad(seq):
        return torch.cat([seq, torch.zeros(max_len - len(seq), dtype=torch.long)])

    word_ids = torch.stack([pad(x) for x in word_ids])
    pos1 = torch.stack([pad(x) for x in pos1])
    pos2 = torch.stack([pad(x) for x in pos2])
    labels = torch.tensor(labels)

    return word_ids, pos1, pos2, labels


# -------- EVALUATION FUNCTION --------
def evaluate(model, loader, device, id_to_label):

    model.eval()

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for word_ids, pos1, pos2, labels in loader:

            word_ids = word_ids.to(device)
            pos1 = pos1.to(device)
            pos2 = pos2.to(device)

            outputs = model(word_ids, pos1, pos2)

            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            labels = labels.numpy()

            all_preds.extend(preds)
            all_labels.extend(labels)

    print("\n--- TEST RESULTS ---")
    print("Accuracy:", accuracy_score(all_labels, all_preds))
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=list(id_to_label.values())))


# -------- MAIN --------
def main():

    print("Loading dataset...")
    dataset = RelationDataset(DATA_PATH)

    # Load saved test indices
    test_indices = torch.load(TEST_INDICES_PATH)

    test_dataset = Subset(dataset, test_indices)

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        collate_fn=collate_fn
    )

    # Load model
    model = RelationModel(
        vocab_size=len(dataset.vocab),
        embedding_dim=EMBEDDING_DIM,
        pos_embedding_dim=POS_EMBEDDING_DIM,
        hidden_dim=HIDDEN_DIM,
        num_classes=len(dataset.label_map)
    )

    model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    id_to_label = {v: k for k, v in dataset.label_map.items()}

    evaluate(model, test_loader, device, id_to_label)


if __name__ == "__main__":
    main()
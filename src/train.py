import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split

from src.datasetloader import RelationDataset
from src.model import RelationModel


# -------- CONFIG --------
DATA_PATH = "./data/processed/processed_data.json"
MODEL_PATH = "./models/model.pth"
TEST_INDICES_PATH = "./data/test_indices.pt"

BATCH_SIZE = 32
EPOCHS = 40
LR = 1.0
WEIGHT_DECAY = 1e-5

EMBEDDING_DIM = 100
POS_EMBEDDING_DIM = 10
HIDDEN_DIM = 128

GLOVE_PATH = "./data/embeddings/glove.6B.100d.txt"


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


# -------- MAIN --------
def main():

    print("Loading dataset...")
    dataset = RelationDataset(DATA_PATH)

    # -------- SPLIT DATASET --------
    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size

    train_dataset, test_dataset = random_split(dataset, [train_size, test_size])

    # Save test indices (IMPORTANT for test.py)
    torch.save(test_dataset.indices, TEST_INDICES_PATH)

    # -------- DATALOADER --------
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        collate_fn=collate_fn
    )

    vocab_size = len(dataset.vocab)
    num_classes = len(dataset.label_map)

    print("Vocab size:", vocab_size)
    print("Number of classes:", num_classes)

    # -------- LOAD GLOVE --------
    glove_weights = dataset.load_glove(GLOVE_PATH, EMBEDDING_DIM)

    # -------- MODEL --------
    model = RelationModel(
        vocab_size,
        EMBEDDING_DIM,
        POS_EMBEDDING_DIM,
        HIDDEN_DIM,
        num_classes,
        pretrained_weights=glove_weights
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    # -------- LOSS + OPTIMIZER --------
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adadelta(
        model.parameters(),
        lr=LR,
        weight_decay=WEIGHT_DECAY,
    )

    # -------- TRAINING LOOP --------
    for epoch in range(EPOCHS):

        model.train()
        total_loss = 0

        for word_ids, pos1, pos2, labels in train_loader:

            word_ids = word_ids.to(device)
            pos1 = pos1.to(device)
            pos2 = pos2.to(device)
            labels = labels.to(device)

            outputs = model(word_ids, pos1, pos2)

            loss = criterion(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {avg_loss:.4f}")

    # -------- SAVE MODEL --------
    torch.save(model.state_dict(), MODEL_PATH)
    print("Model saved to:", MODEL_PATH)
    print("Test indices saved to:", TEST_INDICES_PATH)


if __name__ == "__main__":
    main()

"""Train Our model (BiLSTM + Attention + PosEmb, h=128) on ORIGINAL 8K dataset."""
import sys
sys.path.insert(0, ".")

import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Subset
from sklearn.metrics import classification_report, accuracy_score, f1_score

from src.datasetloader import RelationDataset
from src.model import RelationModel

ORIGINAL_PROCESSED = "./data/processed/processed_data_original.json"
GLOVE_PATH = "./data/embeddings/glove.6B.100d.txt"
BATCH_SIZE = 32
EPOCHS = 40
LR = 1.0
WEIGHT_DECAY = 1e-5


def collate_fn(batch):
    word_ids, pos1, pos2, labels = zip(*batch)
    max_len = max(len(x) for x in word_ids)
    def pad(seq):
        return torch.cat([seq, torch.zeros(max_len - len(seq), dtype=torch.long)])
    return (torch.stack([pad(x) for x in word_ids]),
            torch.stack([pad(x) for x in pos1]),
            torch.stack([pad(x) for x in pos2]),
            torch.tensor(labels))


print("Loading original 8K dataset...")
dataset = RelationDataset(ORIGINAL_PROCESSED)

# Use SAME test split as Zhou script
test_indices = torch.load("./data/test_indices_original.pt", weights_only=True)
all_indices = set(range(len(dataset)))
train_indices = list(all_indices - set(test_indices if isinstance(test_indices, list) else test_indices.tolist()))

train_dataset = Subset(dataset, train_indices)
test_dataset = Subset(dataset, test_indices)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, collate_fn=collate_fn)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Loading GloVe...")
glove_weights = dataset.load_glove(GLOVE_PATH, 100)

model = RelationModel(
    vocab_size=len(dataset.vocab),
    embedding_dim=100,
    pos_embedding_dim=10,
    hidden_dim=128,
    num_classes=len(dataset.label_map),
    pretrained_weights=glove_weights
).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adadelta(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)

print(f"\nTraining Our model on ORIGINAL 8K data ({len(train_dataset)} train, {len(test_dataset)} test)...")
loss_history = []
for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    for word_ids, pos1, pos2, labels in train_loader:
        word_ids, pos1, pos2, labels = word_ids.to(device), pos1.to(device), pos2.to(device), labels.to(device)
        outputs = model(word_ids, pos1, pos2)
        loss = criterion(outputs, labels)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    avg_loss = total_loss / len(train_loader)
    loss_history.append(avg_loss)
    print(f"  Epoch {epoch+1}/{EPOCHS}, Loss: {avg_loss:.4f}", flush=True)

# Evaluate
print("\nEvaluating...")
model.eval()
id_to_label = {v: k for k, v in dataset.label_map.items()}
all_preds, all_labels = [], []
with torch.no_grad():
    for word_ids, pos1, pos2, labels in test_loader:
        word_ids, pos1, pos2 = word_ids.to(device), pos1.to(device), pos2.to(device)
        outputs = model(word_ids, pos1, pos2)
        preds = torch.argmax(outputs, dim=1).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(labels.numpy())

acc = accuracy_score(all_labels, all_preds)
macro_f1 = f1_score(all_labels, all_preds, average='macro')
report = classification_report(all_labels, all_preds, target_names=list(id_to_label.values()), output_dict=True)

print(f"\nOur Model (Original 8K) — Accuracy: {acc:.4f}, Macro F1: {macro_f1:.4f}")
print(classification_report(all_labels, all_preds, target_names=list(id_to_label.values())))

results = {
    "accuracy": acc, "macro_f1": macro_f1, "loss_history": loss_history,
    "per_class": {k: v for k, v in report.items() if k in id_to_label.values()}
}
with open("./report/ours_original_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Saved to ./report/ours_original_results.json")

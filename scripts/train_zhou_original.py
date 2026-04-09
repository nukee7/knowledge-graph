"""Train Zhou's model (BiLSTM + Attention, no pos emb, h=100) on ORIGINAL 8K dataset."""
import sys
sys.path.insert(0, ".")

import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, random_split
from sklearn.metrics import classification_report, accuracy_score, f1_score

from src.datasetloader import RelationDataset
from data.preprocess import preprocess_dataset, save_processed_data


class ZhouModel(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, num_classes, pretrained_weights=None):
        super().__init__()
        self.word_embedding = nn.Embedding(vocab_size, embedding_dim)
        if pretrained_weights is not None:
            self.word_embedding.weight = nn.Parameter(pretrained_weights)
            self.word_embedding.weight.requires_grad = True
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.attention = nn.Linear(hidden_dim * 2, 1)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.dropout = nn.Dropout(0.5)

    def forward(self, word_ids, pos1=None, pos2=None):
        word_emb = self.word_embedding(word_ids)
        lstm_out, _ = self.lstm(word_emb)
        attn_scores = self.attention(lstm_out)
        attn_weights = F.softmax(attn_scores, dim=1)
        context = torch.sum(attn_weights * lstm_out, dim=1)
        context = self.dropout(context)
        return self.fc(context)


GLOVE_PATH = "./data/embeddings/glove.6B.100d.txt"
ORIGINAL_RAW = "./data/raw/dataset_original.txt"
ORIGINAL_PROCESSED = "./data/processed/processed_data_original.json"
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


# Step 1: Process original dataset
print("Processing original 8K dataset...")
data = preprocess_dataset(ORIGINAL_RAW)
save_processed_data(data, ORIGINAL_PROCESSED)

# Step 2: Load
print("Loading dataset...")
dataset = RelationDataset(ORIGINAL_PROCESSED)

train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = random_split(dataset, [train_size, test_size])

# Save test indices for the other script to use same split
torch.save(test_dataset.indices, "./data/test_indices_original.pt")

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, collate_fn=collate_fn)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Loading GloVe...")
glove_weights = dataset.load_glove(GLOVE_PATH, 100)

model = ZhouModel(
    vocab_size=len(dataset.vocab),
    embedding_dim=100,
    hidden_dim=100,
    num_classes=len(dataset.label_map),
    pretrained_weights=glove_weights
).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adadelta(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)

print(f"\nTraining Zhou's model on ORIGINAL 8K data ({len(train_dataset)} train, {len(test_dataset)} test)...")
loss_history = []
for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    for word_ids, pos1, pos2, labels in train_loader:
        word_ids, labels = word_ids.to(device), labels.to(device)
        outputs = model(word_ids)
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
        word_ids = word_ids.to(device)
        preds = torch.argmax(model(word_ids), dim=1).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(labels.numpy())

acc = accuracy_score(all_labels, all_preds)
macro_f1 = f1_score(all_labels, all_preds, average='macro')
report = classification_report(all_labels, all_preds, target_names=list(id_to_label.values()), output_dict=True)

print(f"\nZhou Model (Original 8K) — Accuracy: {acc:.4f}, Macro F1: {macro_f1:.4f}")
print(classification_report(all_labels, all_preds, target_names=list(id_to_label.values())))

results = {
    "accuracy": acc, "macro_f1": macro_f1, "loss_history": loss_history,
    "per_class": {k: v for k, v in report.items() if k in id_to_label.values()}
}
with open("./report/zhou_original_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("Saved to ./report/zhou_original_results.json")

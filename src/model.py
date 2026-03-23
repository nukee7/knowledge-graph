import torch
import torch.nn as nn
import torch.nn.functional as F


class RelationModel(nn.Module):

    def __init__(self, vocab_size, embedding_dim, pos_embedding_dim, hidden_dim, num_classes):
        super().__init__()

        self.word_embedding = nn.Embedding(vocab_size, embedding_dim)

        self.pos1_embedding = nn.Embedding(500, pos_embedding_dim)
        self.pos2_embedding = nn.Embedding(500, pos_embedding_dim)

        self.lstm = nn.LSTM(
            embedding_dim + 2 * pos_embedding_dim,
            hidden_dim,
            batch_first=True,
            bidirectional=True
        )

        # Attention layer
        self.attention = nn.Linear(hidden_dim * 2, 1)

        self.fc = nn.Linear(hidden_dim * 2, num_classes)

        self.dropout = nn.Dropout(0.5)

    def forward(self, word_ids, pos1, pos2):

        # Fix positions
        pos1 = torch.clamp(pos1 + 250, 0, 499)
        pos2 = torch.clamp(pos2 + 250, 0, 499)

        word_emb = self.word_embedding(word_ids)
        pos1_emb = self.pos1_embedding(pos1)
        pos2_emb = self.pos2_embedding(pos2)

        x = torch.cat([word_emb, pos1_emb, pos2_emb], dim=2)

        lstm_out, _ = self.lstm(x)  
        # shape: [batch, seq_len, hidden2]

        # -------- ATTENTION --------
        attn_scores = self.attention(lstm_out)  # [batch, seq_len, 1]
        attn_weights = F.softmax(attn_scores, dim=1)

        # Weighted sum
        context = torch.sum(attn_weights * lstm_out, dim=1)
        # shape: [batch, hidden2]

        context = self.dropout(context)

        logits = self.fc(context)

        return logits
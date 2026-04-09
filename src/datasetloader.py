import json
import numpy as np
import torch
from torch.utils.data import Dataset
import nltk

import ssl
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context
nltk.download("punkt_tab", quiet=True)


class RelationDataset(Dataset):

    def __init__(self, json_path):

        with open(json_path, "r") as f:
            self.data = json.load(f)

        self.build_vocab()
        self.build_label_map()

    # -------- ADD ENTITY MARKING --------
    def mark_entities(self, sentence, e1, e2):

        # safer replacement (avoid partial matches)
        sentence = sentence.replace(e1, f" <e1> {e1} </e1> ")
        sentence = sentence.replace(e2, f" <e2> {e2} </e2> ")

        return sentence

    # -------- BUILD VOCAB WITH MARKERS --------
    def build_vocab(self):

        vocab = {"<PAD>": 0, "<UNK>": 1}

        for sample in self.data:

            sentence = self.mark_entities(
                sample["sentence"],
                sample["entity1"],
                sample["entity2"]
            )

            tokens = nltk.word_tokenize(sentence.lower())

            for token in tokens:
                if token not in vocab:
                    vocab[token] = len(vocab)

        self.vocab = vocab

    def load_glove(self, glove_path, embedding_dim):
        """Load GloVe vectors and build a weight matrix for the vocab."""

        print(f"Loading GloVe from {glove_path}...")

        glove = {}
        with open(glove_path, "r", encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split()
                word = parts[0]
                vector = np.array(parts[1:], dtype=np.float32)
                glove[word] = vector

        vocab_size = len(self.vocab)
        weight_matrix = np.random.uniform(-0.25, 0.25, (vocab_size, embedding_dim))

        # PAD should be zeros
        weight_matrix[0] = np.zeros(embedding_dim)

        found = 0
        for word, idx in self.vocab.items():
            if word in glove:
                weight_matrix[idx] = glove[word]
                found += 1

        print(f"GloVe coverage: {found}/{vocab_size} ({100*found/vocab_size:.1f}%)")

        return torch.tensor(weight_matrix, dtype=torch.float32)

    def build_label_map(self):

        relations = sorted(set(sample["relation"] for sample in self.data))
        self.label_map = {r: i for i, r in enumerate(relations)}

    def encode_sentence(self, sentence, e1, e2):

        sentence = self.mark_entities(sentence, e1, e2)

        tokens = nltk.word_tokenize(sentence.lower())

        return tokens, [self.vocab.get(t, 1) for t in tokens]

    def get_entity_index(self, tokens, marker):

        # find <e1> or <e2>
        for i, t in enumerate(tokens):
            if t == marker:
                return i
        return 0

    def get_positions(self, tokens, marker):

        idx = self.get_entity_index(tokens, marker)
        return [i - idx for i in range(len(tokens))]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):

        sample = self.data[idx]

        tokens, word_ids = self.encode_sentence(
            sample["sentence"],
            sample["entity1"],
            sample["entity2"]
        )

        # Use markers instead of raw entity text
        pos1 = self.get_positions(tokens, "<e1>")
        pos2 = self.get_positions(tokens, "<e2>")

        label = self.label_map[sample["relation"]]

        return (
            torch.tensor(word_ids, dtype=torch.long),
            torch.tensor(pos1, dtype=torch.long),
            torch.tensor(pos2, dtype=torch.long),
            torch.tensor(label, dtype=torch.long)
        )
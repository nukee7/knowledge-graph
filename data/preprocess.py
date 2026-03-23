import re
import json
import os

# source and destination files
SOURCE_FILE = "./data/raw/dataset.txt"
DEST_FILE = "./data/processed/processed_data.json"


def preprocess_dataset(file_path):

    data = []

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for i in range(0, len(lines), 4):

        sentence_line = lines[i].strip()
        relation_line = lines[i+1].strip()

        # Extract sentence between quotes
        sentence_match = re.search(r'"(.*)"', sentence_line)
        if not sentence_match:
            continue

        sentence = sentence_match.group(1)

        # Extract entities
        e1_match = re.search(r"<e1>(.*?)</e1>", sentence)
        e2_match = re.search(r"<e2>(.*?)</e2>", sentence)

        if not e1_match or not e2_match:
            continue

        entity1 = e1_match.group(1)
        entity2 = e2_match.group(1)

        # Remove entity tags from sentence
        sentence_clean = re.sub(r"</?e[12]>", "", sentence)

        # Extract relation
        relation = relation_line.split("(")[0]

        # Extract relation direction
        direction_match = re.search(r"\((.*?)\)", relation_line)
        direction = direction_match.group(1) if direction_match else None

        data.append({
            "sentence": sentence_clean,
            "entity1": entity1,
            "entity2": entity2,
            "relation": relation,
            "direction": direction
        })

    return data


def save_processed_data(data, dest_path):

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)

    with open(dest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Processed dataset saved to:", dest_path)
    print("Total samples:", len(data))


def main():

    print("Loading dataset...")
    processed_data = preprocess_dataset(SOURCE_FILE)

    print("Saving processed dataset...")
    save_processed_data(processed_data, DEST_FILE)


if __name__ == "__main__":
    main()
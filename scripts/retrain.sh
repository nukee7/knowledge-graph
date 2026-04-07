#!/bin/bash

set -e

echo "=================================="
echo "Starting Model Retraining"
echo "=================================="

# ----------------------------------
# Activate virtual environment
# ----------------------------------

if [ -d "kg_env" ]; then
    echo "Activating virtual environment..."
    source kg_env/bin/activate
else
    echo "Virtual environment not found"
    exit 1
fi

# ----------------------------------
# Create directories if missing
# ----------------------------------

mkdir -p data/processed
mkdir -p models
mkdir -p logs

# ----------------------------------
# Step 1 — Preprocess data
# ----------------------------------

echo ""
echo "Running preprocessing..."

PYTHONPATH="$(pwd)" python data/preprocess.py

echo "Preprocessing completed"

# ----------------------------------
# Step 2 — Remove old model + indices
# ----------------------------------

echo ""

if [ -f "models/model.pth" ]; then
    echo "Removing old model..."
    rm models/model.pth
fi

if [ -f "data/test_indices.pt" ]; then
    rm data/test_indices.pt
fi

# ----------------------------------
# Step 3 — Train model
# ----------------------------------

echo "Training model..."

PYTHONPATH="$(pwd)" python src/train.py

echo "Training completed"

# ----------------------------------
# Step 4 — Test model
# ----------------------------------

echo ""
echo "Evaluating model..."

PYTHONPATH="$(pwd)" python src/test.py

echo ""
echo "=================================="
echo "Retraining pipeline finished"
echo "=================================="
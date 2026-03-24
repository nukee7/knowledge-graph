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

python src/preprocess.py

echo "Preprocessing completed"

# ----------------------------------
# Step 2 — Train model
# ----------------------------------

echo ""
echo "Training model..."

python src/train.py

echo "Training completed"

# ----------------------------------
# Step 3 — Test model
# ----------------------------------

echo ""
echo "Evaluating model..."

python src/test.py

echo "Retraining pipeline finished"
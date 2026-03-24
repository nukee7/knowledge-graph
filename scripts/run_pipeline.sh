#!/bin/bash

set -e

echo "=================================="
echo "Starting MLOps Pipeline"
echo "=================================="

# Create required directories
mkdir -p data/processed
mkdir -p models
mkdir -p logs

# -----------------------------------
# Step 1 — Preprocessing (conditional)
# -----------------------------------

if [ ! -f "data/processed/processed_data.json" ]; then

    echo "Processed data not found"
    echo "Running preprocessing..."

    python data/preprocess.py

else

    echo "Processed data already exists"
    echo "Skipping preprocessing"

fi


# -----------------------------------
# Step 2 — Training (conditional)
# -----------------------------------

if [ ! -f "models/model.pth" ]; then

    echo "Model not found"
    echo "Starting training..."

    python src/train.py

else

    echo "Model already exists"
    echo "Skipping training"

fi


# -----------------------------------
# Step 3 — Testing (always run)
# -----------------------------------

echo "Running testing..."

python src/test.py


# -----------------------------------
# Step 4 — Start API server
# -----------------------------------

echo "Starting FastAPI server..."

exec uvicorn server.app:app --host 0.0.0.0 --port 8000

echo "Pipeline finished"

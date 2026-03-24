#!/bin/bash

# ==========================================
# MLOps Pipeline Script
# ==========================================

set -e   # stop on first error

echo "=========================================="
echo "Starting MLOps Pipeline"
echo "=========================================="

# ------------------------------------------
# Activate virtual environment
# ------------------------------------------

if [ -d "kg_env" ]; then
    echo "Activating virtual environment..."
    source kg_env/bin/activate
else
    echo "Virtual environment not found"
    exit 1
fi

# ------------------------------------------
# Create required directories
# ------------------------------------------

echo "Creating directories..."

mkdir -p data/processed
mkdir -p models
mkdir -p logs

# ------------------------------------------
# Step 1 — Data Preprocessing
# ------------------------------------------

echo ""
echo "Running preprocessing..."

python src/preprocess.py

echo "Preprocessing completed"

# ------------------------------------------
# Step 2 — Model Training
# ------------------------------------------

echo ""
echo "Running training..."

python src/train.py

echo "Training completed"

# ------------------------------------------
# Step 3 — Model Testing
# ------------------------------------------

echo ""
echo "Running testing..."

python src/test.py

echo "Testing completed"

# ------------------------------------------
# Step 4 — Start FastAPI Server
# ------------------------------------------

echo ""
echo "Starting FastAPI server..."

uvicorn api:app 
    --host 0.0.0.0 
    --port 8000 
    --reload

echo ""
echo "Pipeline finished"
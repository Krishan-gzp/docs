#!/bin/bash

echo "Starting Crack Detection Backend Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploads results reports

# Start the server
echo "Starting FastAPI server on http://localhost:8000"
python main.py
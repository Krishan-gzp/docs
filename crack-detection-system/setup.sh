#!/bin/bash

echo "==================================="
echo "Crack Detection System Setup"
echo "==================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm."
    exit 1
fi

echo "✓ Prerequisites check passed"
echo ""

# Setup Backend
echo "Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploads results reports

echo "✓ Backend setup completed"
echo ""

# Setup Frontend
echo "Setting up Frontend..."
cd ../frontend

# Install Angular CLI globally if not installed
if ! command -v ng &> /dev/null; then
    echo "Installing Angular CLI globally..."
    npm install -g @angular/cli
fi

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

echo "✓ Frontend setup completed"
echo ""

# Back to project root
cd ..

echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "To start the system:"
echo "1. Start Backend:  cd backend && ./start.sh"
echo "2. Start Frontend: cd frontend && ./start.sh"
echo ""
echo "Then open: http://localhost:4200"
echo ""
echo "Note: Make sure your YOLOv11 model is available at:"
echo "/content/drive/MyDrive/yolo-new/bridge_crack_yolov11_best.pt"
echo ""
echo "Or update the MODEL_PATH in backend/main.py"
echo "==================================="
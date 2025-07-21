#!/bin/bash

echo "Starting Crack Detection Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the Angular development server
echo "Starting Angular development server on http://localhost:4200"
ng serve --host 0.0.0.0 --port 4200
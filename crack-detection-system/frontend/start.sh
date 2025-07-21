#!/bin/bash

echo "Starting Crack Detection Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the Angular development server
echo "Starting Angular development server on http://localhost:4200"
echo ""
echo "Browser Compatibility:"
echo "✓ Chrome 58+ (Recommended)"
echo "✓ Firefox 57+ (Recommended)" 
echo "✓ Edge 14+ (Clear cache if blank page)"
echo "✓ Safari 10+"
echo ""
echo "If you see a blank page in Edge:"
echo "1. Clear browser cache and cookies"
echo "2. Try InPrivate/Incognito mode"
echo "3. Disable browser extensions"
echo "4. Or use Chrome/Firefox as alternative"
echo ""

ng serve --host 0.0.0.0 --port 4200
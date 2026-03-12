#!/bin/bash

echo "=== ATP Predictor Quick Setup ==="
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18 or higher required. You have: $(node -v)"
  exit 1
fi
echo "✓ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Installation failed"
  exit 1
fi
echo "✓ Dependencies installed"

# Build packages
echo ""
echo "Building packages..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✓ Build successful"

# Download data
echo ""
echo "Downloading ATP data (this may take several minutes)..."
npm run ingest
if [ $? -ne 0 ]; then
  echo "⚠️  Data download had some issues, but continuing..."
fi

# Process data
echo ""
echo "Processing data (this may take a few minutes)..."
npm run process
if [ $? -ne 0 ]; then
  echo "⚠️  Data processing had some issues, but continuing..."
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then visit http://localhost:3000"
echo ""

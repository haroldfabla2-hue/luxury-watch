#!/bin/bash
set -e

echo "Starting build process..."
cd /workspace/luxurywatch

echo "Installing dependencies..."
pnpm install --prefer-offline

echo "Building project..."
pnpm build

echo "Build complete! Checking dist folder..."
ls -lah dist/

echo "Done!"

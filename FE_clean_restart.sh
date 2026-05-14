#!/bin/bash

echo "Cleaning Vite cache..."
rm -rf node_modules/.vite

echo "Starting Vite dev server..."
npm run dev
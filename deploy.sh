#!/bin/bash

# Build the application
npm run build

# If you're deploying to GitHub Pages and have gh-pages installed
# npm install -g gh-pages # Uncomment if gh-pages is not installed
# gh-pages -d dist

echo "Build completed. To deploy to GitHub Pages:"
echo "1. Install gh-pages: npm install -g gh-pages"
echo "2. Run: gh-pages -d dist"
echo ""
echo "For other deployment options, see the README.md file"
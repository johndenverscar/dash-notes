#!/bin/bash

# Release script for Rolodex
set -e

echo "🚀 Starting Rolodex release process..."

# Check if we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Please switch to main branch before releasing"
  exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working directory is not clean. Please commit or stash changes."
  exit 1
fi

# Bump version (patch by default, or pass 'minor' or 'major')
VERSION_TYPE=${1:-patch}
echo "📈 Bumping $VERSION_TYPE version..."
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "📦 New version: $NEW_VERSION"

# Build the app
echo "🔨 Building app..."
npm run build:mac

# Update HomeBrew cask
echo "🍺 Updating HomeBrew cask..."
npm run homebrew:update

# Commit changes
echo "💾 Committing changes..."
git add .
git commit -m "Release v$NEW_VERSION"

# Create and push tag
echo "🏷️  Creating tag..."
git tag "v$NEW_VERSION"

echo "✅ Release v$NEW_VERSION prepared!"
echo ""
echo "Next steps:"
echo "1. git push origin main --tags"
echo "2. Upload dist/Rolodex-$NEW_VERSION.dmg to GitHub releases"
echo "3. Push homebrew-tap repository changes"
echo ""
echo "Commands to run:"
echo "git push origin main --tags"
echo "# Then upload the DMG to: https://github.com/YOUR_USERNAME/rolodex/releases/new"
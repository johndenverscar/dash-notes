# HomeBrew Distribution Setup

This guide explains how to distribute Rolodex via HomeBrew.

## Overview

Rolodex can be distributed via HomeBrew Cask, which is the standard way to distribute GUI applications on macOS.

## Setup Steps

### 1. Initial Setup (One-time)

1. **Create GitHub repository for your main app:**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"

   # Create repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/rolodex.git
   git push -u origin main
   ```

2. **Create HomeBrew Tap repository:**
   ```bash
   # Copy the homebrew-tap directory to a new repository
   cp -r homebrew-tap ../homebrew-rolodex
   cd ../homebrew-rolodex
   git init
   git add .
   git commit -m "Initial HomeBrew tap"

   # Create repository on GitHub named "homebrew-rolodex", then:
   git remote add origin https://github.com/YOUR_USERNAME/homebrew-rolodex.git
   git push -u origin main
   ```

3. **Update placeholders:**
   - Replace `YOUR_USERNAME` in all files with your actual GitHub username
   - Update the cask formula URLs and paths

### 2. Release Process

For each new release:

1. **Automated release (recommended):**
   ```bash
   # This will bump version, build, update cask, and prepare release
   ./scripts/release.sh [patch|minor|major]
   ```

2. **Manual steps after automated release:**
   ```bash
   # Push to GitHub
   git push origin main --tags

   # Upload DMG to GitHub releases
   # Go to: https://github.com/YOUR_USERNAME/rolodex/releases/new
   # Upload: dist/Rolodex-X.X.X.dmg

   # Update tap repository
   cd ../homebrew-rolodex
   cp ../rolodex/homebrew-tap/Casks/rolodex.rb Casks/
   git add .
   git commit -m "Update to v$(node -p "require('../rolodex/package.json').version")"
   git push origin main
   ```

### 3. User Installation

Once set up, users can install Rolodex with:

```bash
# Add your tap
brew tap YOUR_USERNAME/rolodex

# Install the app
brew install --cask rolodex
```

Or in one line:
```bash
brew install --cask YOUR_USERNAME/rolodex/rolodex
```

## File Structure

```
rolodex/
├── rolodex.rb                 # Cask formula (for testing)
├── homebrew-tap/             # Directory to copy to tap repository
│   ├── Casks/
│   │   └── rolodex.rb        # Main cask formula
│   └── README.md             # Tap documentation
├── scripts/
│   ├── update-homebrew.js    # Updates cask with new version/SHA
│   └── release.sh           # Complete release automation
└── HOMEBREW.md              # This documentation
```

## Scripts

- `npm run homebrew:update` - Updates cask formula with current version and SHA256
- `./scripts/release.sh` - Complete release process (version bump, build, update cask)

## Troubleshooting

### Cask Validation
Test your cask locally:
```bash
brew install --cask ./rolodex.rb
```

### SHA256 Mismatch
If users report SHA256 mismatches:
1. Download the DMG from your GitHub release
2. Run: `shasum -a 256 Rolodex-X.X.X.dmg`
3. Update the cask formula with the correct hash

### URL Issues
Ensure your GitHub release URLs follow this pattern:
`https://github.com/YOUR_USERNAME/rolodex/releases/download/vX.X.X/Rolodex-X.X.X.dmg`

## Advanced: Submit to Official HomeBrew

To get Rolodex into the official HomeBrew Cask repository:

1. Fork `homebrew/homebrew-cask`
2. Add your cask to `Casks/rolodex.rb`
3. Submit a pull request
4. Follow HomeBrew's contribution guidelines

This allows users to install with just: `brew install --cask rolodex`
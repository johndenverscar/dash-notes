# Building Rolodex for Distribution

## Quick Build Commands

### For Local Testing
```bash
# Test build (creates app in dist/ folder)
npm run pack

# Full build with DMG installer
npm run build:mac
```

### For Release
```bash
# Create release build
npm run release
```

## Distribution Options

### Option 1: Simple DMG Distribution (Recommended for personal use)

1. **Build the app:**
   ```bash
   npm run build:mac
   ```

2. **Find your files in `dist/` folder:**
   - `Rolodex-1.0.0.dmg` - Drag-and-drop installer
   - `Rolodex-1.0.0-mac.zip` - Portable app bundle

3. **Share the DMG:**
   - Upload to Google Drive, Dropbox, or any file sharing service
   - Send to friends/colleagues
   - Users can double-click DMG and drag to Applications

### Option 2: GitHub Releases (Best for updates)

1. **Create GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/rolodex.git
   git push -u origin main
   ```

2. **Update package.json:**
   - Change `"your-username"` to your GitHub username
   - Change `"repo": "rolodex"` to match your repo name

3. **Build and create release:**
   ```bash
   npm run release
   # Then upload dist/*.dmg to GitHub Releases manually
   ```

4. **For automatic releases (advanced):**
   - Set up GitHub Actions
   - Add release token
   - Automatic builds on version tags

### Option 3: Mac App Store (Most Complex)

Requires:
- Apple Developer Account ($99/year)
- Code signing certificates
- App Store review process
- Additional entitlements and configurations

## File Structure After Build

```
dist/
├── Rolodex-1.0.0.dmg          # Installer for users
├── Rolodex-1.0.0-mac.zip      # Portable version
├── mac/
│   └── Rolodex.app            # The actual app bundle
└── latest-mac.yml             # Auto-updater manifest
```

## Icon Requirements

For a professional build, you'll need:
- `assets/icon.icns` - Mac icon bundle (512x512, 256x256, 128x128, etc.)

To create from SVG:
```bash
# Install iconutil (comes with Xcode)
# Convert SVG to iconset, then to icns
```

## Troubleshooting

### "App can't be opened" error
- Users need to right-click → Open on first launch
- Or go to System Preferences → Security & Privacy → Allow

### Build fails
- Make sure you have latest Xcode command line tools
- Run `npm install` to ensure all dependencies
- Check Node.js version (recommended: 18+)

### Notarization (for distribution)
- Requires Apple Developer account
- Prevents "unknown developer" warnings
- Add notarization config to package.json

## Version Updates

1. Update version in `package.json`
2. Run `npm run release`
3. Upload new DMG to your distribution method
4. Users download and install new version

## Auto-Updates (Future Enhancement)

To add auto-updates:
1. Add `electron-updater` dependency
2. Configure update server (GitHub releases work)
3. Add update check to main process
4. Users get in-app update notifications
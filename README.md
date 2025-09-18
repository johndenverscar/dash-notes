# Dash Notes

A quick, ad-hoc note-taking Mac desktop app that opens with a global hotkey.

## Features

- **Global Hotkey**: Press `Ctrl+Space` to open the quick note input window
- **Floating Input**: Minimal, always-on-top input window that appears instantly
- **Configurable Behavior**:
  - `Return` - Save note and close input (configurable)
  - `Cmd+Return` - Save note and open main app window
  - `Esc` - Cancel and close input
- **Note Management**: View, search, copy, and delete notes in the main app
- **Menu Bar Integration**: Access app through system tray/menu bar
- **Persistent Storage**: Notes are automatically saved locally

## Installation

### For Mac Users (DMG Installation)

1. Download the latest `Dash Notes-X.X.X.dmg` file from the releases
2. Double-click the DMG file to open it
3. Drag "Dash Notes.app" to your Applications folder
4. Launch Dash Notes from Applications or Spotlight
5. On first launch, you may need to right-click the app and select "Open" to bypass macOS security warnings

### For Developers

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

### Development Build
```bash
npm run build
```

### Production Release
```bash
npm run build:mac
```

This creates:
- `dist/Dash Notes-0.1.0.dmg` - Installer for distribution
- `dist/Dash Notes-0.1.0-mac.zip` - Portable app bundle

## Creating a Release

1. **Update version** in `package.json`
2. **Build the app**:
   ```bash
   npm run build:mac
   ```
3. **Find build artifacts** in the `dist/` folder:
   - DMG file for easy installation
   - ZIP file for portable use
4. **Distribute** the DMG file to users

## Usage

1. Launch the app
2. Press `Ctrl+Space` anywhere on your Mac to open the quick note input
3. Type your note and press `Return` to save
4. Use `Cmd+Return` to save and view the note in the main app
5. Access the main app through the menu bar icon or by following a note

## Configuration

In the main app, go to Settings to configure:
- **Return Key Behavior**: Choose whether pressing Return opens the main app or just saves the note

## Architecture

Built with Electron for cross-platform compatibility with native Mac features:
- Global shortcuts via Electron's `globalShortcut` API
- Persistent storage via `electron-store`
- Native system tray integration
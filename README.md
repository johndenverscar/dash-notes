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

The app uses Vite for fast development with hot module replacement:

```bash
npm run dev
```

This will:
- Start the Vite development server on `http://localhost:3000`
- Launch Electron with hot reload capabilities
- Automatically reload when you make changes to CSS or JavaScript files

## Building

### Development Build
Build the project for testing (creates optimized bundles):
```bash
npm run build
```

### Creating Distribution Packages

For local testing/packaging:
```bash
npm run electron:pack
```

For production release (creates DMG and ZIP files):
```bash
npm run electron:dist
```

This creates files in the `dist/` folder:
- `Dash Notes-0.1.0.dmg` - Installer for distribution
- `Dash Notes-0.1.0-mac.zip` - Portable app bundle

## Creating a Release

1. **Update version** in `package.json`
2. **Build the production app**:
   ```bash
   npm run electron:dist
   ```
3. **Find build artifacts** in the `dist/` folder:
   - DMG file for easy installation
   - ZIP file for portable use
4. **Test the DMG** by installing and running it
5. **Distribute** the DMG file to users

## Project Structure

The project uses a modern Vite-based architecture:

```
src/
├── main/           # Main Electron process
│   └── index.js    # App initialization, window management, IPC
└── renderer/       # Renderer processes (UI)
    ├── main.html   # Main app window
    ├── main.js     # Main window logic
    ├── input.html  # Quick note input window
    ├── input.js    # Input window logic
    └── styles.css  # Tailwind CSS styles
```

## Build System

- **Vite**: Modern build tool with fast hot reload
- **Tailwind CSS**: Utility-first CSS framework
- **Electron Builder**: Creates platform-specific installers
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

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
- **Global shortcuts** via Electron's `globalShortcut` API
- **Persistent storage** via `electron-store`
- **Native system tray integration** with menu bar icon
- **Modern development stack** with Vite, Tailwind CSS, and hot reload
- **Optimized builds** with tree shaking and minification
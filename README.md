# Rolodex

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

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

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
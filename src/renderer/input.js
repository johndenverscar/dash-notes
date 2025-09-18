import './styles.css'
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const noteInput = document.getElementById('noteInput');

  // Focus input when window shows
  ipcRenderer.on('focus-input', () => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      noteInput.focus();
      // Also select any existing content for easy replacement
      noteInput.select();
    });
  });


  // Handle theme changes
  ipcRenderer.on('set-theme', (event, theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  });

  // Load initial theme
  ipcRenderer.invoke('get-config').then(config => {
    const theme = config.darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  });

  noteInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Escape') {
      window.close();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const noteText = noteInput.value.trim();
      if (!noteText) {
        window.close();
        return;
      }

      // Get current config
      const config = await ipcRenderer.invoke('get-config');

      // Determine behavior based on key combination and config
      let followToApp = false;

      if (e.metaKey) {
        // Cmd+Return always follows to app
        followToApp = true;
      } else {
        // Plain Return behavior depends on config
        followToApp = config.followNoteToApp;
      }

      // Save the note
      await ipcRenderer.invoke('save-note', noteText);

      // Notify main process
      ipcRenderer.send('note-submitted', { followToApp });
    }
  });

  // Set initial height and auto-resize textarea
  const setTextareaHeight = () => {
    noteInput.style.height = 'auto';
    const newHeight = Math.max(noteInput.scrollHeight, 24); // Minimum height
    noteInput.style.height = Math.min(newHeight, 200) + 'px';
  };

  // Set initial height
  setTextareaHeight();

  // Auto-resize on input
  noteInput.addEventListener('input', setTextareaHeight);

  // Also focus when window gets focus (backup method)
  window.addEventListener('focus', () => {
    requestAnimationFrame(() => {
      noteInput.focus();
    });
  });

  // Reset height when clearing
  ipcRenderer.on('clear-input', () => {
    noteInput.value = '';
    setTextareaHeight();
  });
});
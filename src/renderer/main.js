import './styles.css'
const { ipcRenderer } = require('electron');

let allNotes = [];
let filteredNotes = [];
let settingsVisible = false;

async function loadNotes() {
  allNotes = await ipcRenderer.invoke('get-notes');
  filteredNotes = [...allNotes];
  renderNotes();
  updateStats();
}

async function loadConfig() {
  const config = await ipcRenderer.invoke('get-config');

  // Load follow note setting
  const followSwitch = document.getElementById('followNoteSwitch');
  if (config.followNoteToApp) {
    followSwitch.classList.add('active');
  } else {
    followSwitch.classList.remove('active');
  }

  // Load dark mode setting
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  if (config.darkMode) {
    darkModeSwitch.classList.add('active');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    darkModeSwitch.classList.remove('active');
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

function renderNotes() {
  const container = document.getElementById('notesContainer');

  if (filteredNotes.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 px-5 text-text-secondary-light dark:text-text-secondary-dark">
        <h3 class="m-0 mb-3 font-semibold text-xl text-text-primary-light dark:text-text-primary-dark">${allNotes.length === 0 ? 'No notes yet' : 'No matching notes'}</h3>
        <p class="m-0 text-sm text-text-tertiary-light dark:text-text-tertiary-dark">${allNotes.length === 0 ? 'Press Ctrl+Space to create your first note' : 'Try a different search term'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredNotes.map(note => `
    <div class="note-item" id="note-${note.id}">
      <div class="text-base leading-relaxed mb-3 whitespace-pre-wrap break-words text-text-primary-light dark:text-text-primary-dark" id="text-${note.id}">${escapeHtml(note.text)}</div>
      <div class="mb-3 hidden" id="edit-${note.id}">
        <textarea class="w-full min-h-15 p-3 border border-border-secondary-light dark:border-border-secondary-dark rounded-lg text-base font-system leading-relaxed bg-bg-primary-light dark:bg-bg-primary-dark text-text-primary-light dark:text-text-primary-dark resize-y transition-all duration-150 box-border focus:outline-none focus:border-accent-primary focus:shadow-accent-primary/30 focus:shadow-sm" id="textarea-${note.id}" oninput="autoResize(this)" onkeydown="handleEditKeydown(event, '${note.id}')">${escapeHtml(note.text)}</textarea>
        <div class="flex gap-2 mt-3">
          <button class="px-3 py-1.5 text-xs border border-border-secondary-light dark:border-border-secondary-dark rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark text-text-primary-light dark:text-text-primary-dark cursor-pointer font-medium transition-all duration-150 hover:bg-bg-primary-light hover:dark:bg-bg-primary-dark hover:border-text-tertiary-light hover:dark:border-text-tertiary-dark" onclick="saveEdit('${note.id}')">Save (Ctrl+Enter)</button>
          <button class="px-3 py-1.5 text-xs border border-border-secondary-light dark:border-border-secondary-dark rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark text-text-primary-light dark:text-text-primary-dark cursor-pointer font-medium transition-all duration-150 hover:bg-bg-primary-light hover:dark:bg-bg-primary-dark hover:border-text-tertiary-light hover:dark:border-text-tertiary-dark" onclick="cancelEdit('${note.id}')">Cancel (Esc)</button>
        </div>
      </div>
      <div class="text-xs text-text-secondary-light dark:text-text-secondary-dark flex justify-between items-center font-medium">
        <span>${formatDate(note.createdAt)}</span>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 text-xs border-0 bg-transparent text-text-secondary-light dark:text-text-secondary-dark cursor-pointer rounded-md font-medium transition-all duration-150 hover:text-text-primary-light hover:dark:text-text-primary-dark hover:bg-bg-primary-light hover:dark:bg-bg-primary-dark" onclick="editNote('${note.id}')">Edit</button>
          <button class="px-3 py-1.5 text-xs border-0 bg-transparent text-text-secondary-light dark:text-text-secondary-dark cursor-pointer rounded-md font-medium transition-all duration-150 hover:text-text-primary-light hover:dark:text-text-primary-dark hover:bg-bg-primary-light hover:dark:bg-bg-primary-dark" onclick="copyNote('${note.id}')">Copy</button>
          <button class="px-3 py-1.5 text-xs border-0 bg-transparent text-text-secondary-light dark:text-text-secondary-dark cursor-pointer rounded-md font-medium transition-all duration-150 hover:text-red-400 hover:bg-red-100 hover:dark:bg-red-900/20" onclick="deleteNote('${note.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  const count = allNotes.length;
  document.getElementById('noteCount').textContent = `${count} note${count !== 1 ? 's' : ''}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function deleteNote(noteId) {
  if (confirm('Delete this note?')) {
    allNotes = await ipcRenderer.invoke('delete-note', parseInt(noteId));
    applySearch();
    updateStats();
  }
}

async function copyNote(noteId) {
  const note = allNotes.find(n => n.id === parseInt(noteId));
  if (!note) {
    showCopyFeedback(`copy-btn-${noteId}`, 'Note not found', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(note.text);
    showCopyFeedback(`copy-btn-${noteId}`, 'Copied!', 'success');
  } catch (error) {
    console.error('Failed to copy note:', error);
    // Fallback for older browsers or permission issues
    try {
      fallbackCopy(note.text);
      showCopyFeedback(`copy-btn-${noteId}`, 'Copied!', 'success');
    } catch (fallbackError) {
      showCopyFeedback(`copy-btn-${noteId}`, 'Copy failed', 'error');
    }
  }
}

function fallbackCopy(text) {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  if (!document.execCommand('copy')) {
    throw new Error('Fallback copy failed');
  }

  document.body.removeChild(textarea);
}

function showCopyFeedback(buttonId, message, type) {
  const button = document.querySelector(`[onclick*="${buttonId.replace('copy-btn-', '')}"][onclick*="copyNote"]`);
  if (!button) return;

  const originalText = button.textContent;
  const originalClasses = button.className;

  // Update button appearance based on type
  if (type === 'success') {
    button.textContent = message;
    button.className = originalClasses + ' !text-green-600 dark:!text-green-400';
  } else {
    button.textContent = message;
    button.className = originalClasses + ' !text-red-600 dark:!text-red-400';
  }

  // Reset after delay
  setTimeout(() => {
    button.textContent = originalText;
    button.className = originalClasses;
  }, 2000);
}

function showQuickNote() {
  // This will trigger the same behavior as Ctrl+Space
  ipcRenderer.send('show-quick-note');
}

function toggleSettings() {
  settingsVisible = !settingsVisible;
  const panel = document.getElementById('settingsPanel');
  if (settingsVisible) {
    panel.classList.remove('hidden');
    panel.classList.add('visible');
  } else {
    panel.classList.add('hidden');
    panel.classList.remove('visible');
  }
}

async function toggleDarkMode() {
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  const isActive = darkModeSwitch.classList.contains('active');

  darkModeSwitch.classList.toggle('active', !isActive);

  // Apply theme immediately
  const newTheme = !isActive ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);

  // Also update input window if it exists
  ipcRenderer.send('set-theme', newTheme);

  await ipcRenderer.invoke('set-config', {
    darkMode: !isActive
  });
}

async function toggleFollowNote() {
  const followSwitch = document.getElementById('followNoteSwitch');
  const isActive = followSwitch.classList.contains('active');

  followSwitch.classList.toggle('active', !isActive);

  await ipcRenderer.invoke('set-config', {
    followNoteToApp: !isActive
  });
}

function applySearch() {
  const searchTerm = document.getElementById('searchBox').value.toLowerCase();
  if (!searchTerm) {
    filteredNotes = [...allNotes];
  } else {
    filteredNotes = allNotes.filter(note =>
      note.text.toLowerCase().includes(searchTerm)
    );
  }
  renderNotes();
}

function clearSearch() {
  document.getElementById('searchBox').value = '';
  applySearch();
}

function editNote(noteId) {
  const textDiv = document.getElementById(`text-${noteId}`);
  const editDiv = document.getElementById(`edit-${noteId}`);
  const textarea = document.getElementById(`textarea-${noteId}`);

  textDiv.style.display = 'none';
  editDiv.classList.remove('hidden');

  // Auto-resize textarea and focus
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function cancelEdit(noteId) {
  const textDiv = document.getElementById(`text-${noteId}`);
  const editDiv = document.getElementById(`edit-${noteId}`);
  const textarea = document.getElementById(`textarea-${noteId}`);

  // Reset textarea to original value
  const note = allNotes.find(n => n.id === parseInt(noteId));
  if (note) {
    textarea.value = note.text;
  }

  editDiv.classList.add('hidden');
  textDiv.style.display = 'block';
}

async function saveEdit(noteId) {
  const textarea = document.getElementById(`textarea-${noteId}`);
  const newText = textarea.value.trim();

  if (!newText) {
    alert('Note cannot be empty');
    return;
  }

  try {
    await ipcRenderer.invoke('update-note', parseInt(noteId), newText);
    allNotes = await ipcRenderer.invoke('get-notes');
    applySearch();
    updateStats();
  } catch (error) {
    alert('Failed to save note: ' + error.message);
  }
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function handleEditKeydown(event, noteId) {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault();
    saveEdit(noteId);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelEdit(noteId);
  }
}

// Make functions global for HTML onclick handlers
window.showQuickNote = showQuickNote;
window.toggleSettings = toggleSettings;
window.clearSearch = clearSearch;
window.toggleDarkMode = toggleDarkMode;
window.toggleFollowNote = toggleFollowNote;
window.editNote = editNote;
window.cancelEdit = cancelEdit;
window.saveEdit = saveEdit;
window.deleteNote = deleteNote;
window.copyNote = copyNote;
window.autoResize = autoResize;
window.handleEditKeydown = handleEditKeydown;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Event listeners
  document.getElementById('searchBox').addEventListener('input', applySearch);

  // IPC listeners
  ipcRenderer.on('refresh-notes', loadNotes);

  // Initial load
  loadNotes();
  loadConfig();
});
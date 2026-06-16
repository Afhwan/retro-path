const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const https = require('https');

let mainWindow;

// ─── Check for updates from GitHub Releases ─────────────────
const GITHUB_REPO = 'Afhwan/retro-path';
const CURRENT_VERSION = '1.0.0';

function checkForUpdate() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

  https.get(url, { headers: { 'User-Agent': 'retro-path' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const release = JSON.parse(data);
        const latestVersion = release.tag_name.replace(/^v/, '');

        if (latestVersion !== CURRENT_VERSION) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Tersedia!',
            message: `Versi ${latestVersion} sudah tersedia!`,
            detail: `Kamu pakai versi ${CURRENT_VERSION}. Download versi terbaru dari GitHub?`,
            buttons: ['Download', 'Nanti'],
            defaultId: 0
          }).then(result => {
            if (result.response === 0) {
              const asset = release.assets.find(a =>
                a.name.endsWith('.AppImage') || a.name.endsWith('.exe')
              );
              if (asset) {
                const win = require('electron').shell;
                win.openExternal(asset.browser_download_url);
              } else {
                win.openExternal(release.html_url);
              }
            }
          });
        }
      } catch (e) {
        console.warn('Gagal cek update:', e.message);
      }
    });
  }).on('error', () => {
    // No internet or offline — skip
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 540,
    resizable: true,
    fullscreenable: true,
    title: 'Retro Path',
    backgroundColor: '#0f0f1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Fullscreen shortcut F11
  mainWindow.webContents.on('before-input-event', (e, input) => {
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  // Cek update setelah window siap
  mainWindow.webContents.on('did-finish-load', () => {
    checkForUpdate();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

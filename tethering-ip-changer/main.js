const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 550,
    minWidth: 900,   // 최소 너비 고정
    minHeight: 550,  // 최소 높이 고정
    resizable: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
  
  // 콘텐츠 로드 후 창 크기를 콘텐츠에 맞게 조절
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      const body = document.body;
      const html = document.documentElement;
      const width = Math.max(body.scrollWidth, html.scrollWidth);
      const height = Math.max(body.scrollHeight, html.scrollHeight);
      [width + 40, height + 40];
    `).then(([width, height]) => {
      win.setSize(Math.max(width, 900), Math.max(height, 550));
    });
  });
}

app.whenReady().then(async () => {
  // 관리자 권한 확인 (is-elevated 없이 직접 체크)
  let isAdmin = false;
  try {
    const { execSync } = require('child_process');
    execSync('net session', { stdio: 'ignore' });
    isAdmin = true;
  } catch (e) {
    isAdmin = false;
  }

  if (!isAdmin) {
    dialog.showMessageBoxSync({
      type: 'warning',
      title: '관리자 권한 필요',
      message: '이 프로그램은 관리자 권한으로 실행해야 합니다.\n프로그램을 우클릭하고 "관리자 권한으로 실행"을 선택해주세요.',
      buttons: ['확인']
    });
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
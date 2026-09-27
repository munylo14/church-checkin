import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Temporary Phase 0 simulator. No physical printing occurs here.
  ipcMain.handle('printers:list', async (event) => {
    const printers = await event.sender.getPrintersAsync()

    return printers.map((printer) => ({
      name: printer.name,
      displayName: printer.displayName
    }))
  })

  ipcMain.handle('label:simulate-student', (_event, studentId: unknown): string => {
  if (studentId !== 'student-1' && studentId !== 'student-2') {
    throw new Error('Unknown sample student')
  }

  return `Simulation complete for ${studentId}. No printer was used.`
})

ipcMain.handle('label:print-test', async (event, printerName: unknown): Promise<string> => {
  if (typeof printerName !== 'string' || printerName.length === 0) {
    throw new Error('Select a printer first.')
  }

  const installedPrinters = await event.sender.getPrintersAsync()
  if (!installedPrinters.some((printer) => printer.name === printerName)) {
    throw new Error('The selected printer is no longer installed. Refresh the printer list.')
  }

  // This window contains only fixed sample data. No real person information is used.
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const labelHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: 2.3125in 4in; margin: 0; }
    html, body {
      width: 2.3125in;
      height: 4in;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: Arial, sans-serif;
      color: black;
      background: white;
    }
    .label {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding: 0.18in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.24in;
      text-align: center;
    }
    .name { font-size: 19pt; font-weight: bold; }
    .grade { font-size: 16pt; }
    .code { font-size: 24pt; font-weight: bold; letter-spacing: 0.08em; }
  </style>
</head>
<body>
  <div class="label">
    <div class="name">TEST STUDENT</div>
    <div class="grade">Grade 7</div>
    <div class="code">ABC123</div>
  </div>
</body>
</html>`

  try {
    await printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(labelHtml)}`
    )

    return await new Promise<string>((resolve, reject) => {
      printWindow.webContents.print(
        {
          silent: true,
          deviceName: printerName,
          copies: 1,
          margins: { marginType: 'none' },
          pageSize: {
            width: 58738,  // 2-5/16 inches, in microns
            height: 101600  // 4 inches, in microns
          }
        },
        (success, failureReason) => {
          if (success) {
            resolve(`Test label submitted to ${printerName}. Inspect the physical label.`)
          } else {
            reject(new Error(failureReason || 'The print job failed.'))
          }
        }
      )
    })
  } finally {
    if (!printWindow.isDestroyed()) printWindow.close()
  }
})

createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

import { app, BrowserWindow, dialog, Menu } from 'electron'
import { join, resolve } from 'path'
import { registerIpcHandlers } from './ipc-handlers'
import { processManager } from './process-manager'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '应用管家',
    icon: app.isPackaged
      ? join(process.resourcesPath, 'resources/icon.ico')
      : resolve(__dirname, '../../resources/icon.ico'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#f8fafc',
      symbolColor: '#64748b',
      height: 40
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Load the renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (e) => {
    if (processManager.hasRunningProcesses()) {
      e.preventDefault()
      dialog
        .showMessageBox(mainWindow!, {
          type: 'warning',
          buttons: ['强制退出', '取消'],
          defaultId: 1,
          title: '确认退出',
          message: '有工具正在运行中，确定要退出吗？\n退出将终止所有运行中的工具进程。'
        })
        .then((result) => {
          if (result.response === 0) {
            processManager.killAll()
            mainWindow?.destroy()
          }
        })
    }
  })
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  processManager.killAll()
})

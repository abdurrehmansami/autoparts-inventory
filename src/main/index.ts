import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, shell } from 'electron'
import { openDatabase, type Database } from './db/client'
import { registerIpc } from './ipc'
import { seedDefaults } from './services/seed'

let database: Database | null = null

function migrationsFolder(): string {
  return app.isPackaged ? join(process.resourcesPath, 'drizzle') : join(app.getAppPath(), 'drizzle')
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    title: 'AutoParts Inventory',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.on('ready-to-show', () => win.maximize())
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  void app.whenReady().then(() => {
    electronApp.setAppUserModelId('pk.autoparts.inventory')
    app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

    const dataPath = join(app.getPath('userData'), 'data', 'inventory.db')
    try {
      database = openDatabase(dataPath, migrationsFolder())
      seedDefaults(database.db)
    } catch (err) {
      dialog.showErrorBox('Database error', `Could not open ${dataPath}\n\n${String(err)}`)
      app.quit()
      return
    }
    registerIpc(database.db, dataPath)
    createWindow()
  })
}

app.on('window-all-closed', () => app.quit())
app.on('will-quit', () => database?.client.close())

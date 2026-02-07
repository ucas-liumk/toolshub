import { ipcMain, dialog, shell } from 'electron'
import { readFileSync } from 'fs'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import {
  getAllTools,
  addTool,
  updateTool,
  removeTool,
  getAllCategories,
  addCategory,
  removeCategory,
  ToolConfig,
  Category
} from './tool-store'
import { processManager } from './process-manager'

export function registerIpcHandlers(): void {
  // Tool CRUD
  ipcMain.handle('tools:getAll', () => {
    return getAllTools()
  })

  ipcMain.handle('tools:add', (_event, tool: Omit<ToolConfig, 'id'>) => {
    const newTool: ToolConfig = { ...tool, id: uuidv4() }
    addTool(newTool)
    return newTool
  })

  ipcMain.handle('tools:update', (_event, id: string, updates: Partial<ToolConfig>) => {
    updateTool(id, updates)
    return true
  })

  ipcMain.handle('tools:remove', (_event, id: string) => {
    // Stop process if running
    processManager.stop(id)
    removeTool(id)
    return true
  })

  // Category CRUD
  ipcMain.handle('categories:getAll', () => {
    return getAllCategories()
  })

  ipcMain.handle('categories:add', (_event, name: string) => {
    const category: Category = { id: uuidv4(), name }
    addCategory(category)
    return category
  })

  ipcMain.handle('categories:remove', (_event, id: string) => {
    removeCategory(id)
    return true
  })

  // Process control
  ipcMain.handle('process:launch', (_event, toolId: string, command: string, cwd: string) => {
    return processManager.launch(toolId, command, cwd)
  })

  ipcMain.handle('process:stop', (_event, toolId: string) => {
    return processManager.stop(toolId)
  })

  ipcMain.handle('process:getStatuses', () => {
    return processManager.getAllStatuses()
  })

  // System operations
  ipcMain.handle('system:openFolder', (_event, path: string) => {
    shell.openPath(path)
  })

  ipcMain.handle('system:openExternal', (_event, url: string) => {
    shell.openExternal(url)
  })

  // Dialog
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:selectImage', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'svg'] }]
    })
    if (result.canceled) return null
    const filePath = result.filePaths[0]
    const ext = extname(filePath).slice(1).toLowerCase()
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      ico: 'image/x-icon',
      webp: 'image/webp',
      svg: 'image/svg+xml'
    }
    const mime = mimeMap[ext] || 'image/png'
    const data = readFileSync(filePath)
    return `data:${mime};base64,${data.toString('base64')}`
  })
}

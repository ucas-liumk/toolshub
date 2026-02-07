import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  // Tool CRUD
  getTools: () => Promise<unknown[]>
  addTool: (tool: unknown) => Promise<unknown>
  updateTool: (id: string, updates: unknown) => Promise<boolean>
  removeTool: (id: string) => Promise<boolean>
  // Category CRUD
  getCategories: () => Promise<unknown[]>
  addCategory: (name: string) => Promise<unknown>
  removeCategory: (id: string) => Promise<boolean>
  // Process control
  launchProcess: (toolId: string, command: string, cwd: string) => Promise<boolean>
  stopProcess: (toolId: string) => Promise<boolean>
  getProcessStatuses: () => Promise<Record<string, string>>
  // Events
  onStatusChanged: (callback: (toolId: string, status: string) => void) => () => void
  onProcessOutput: (callback: (toolId: string, data: string) => void) => () => void
  // System
  openFolder: (path: string) => Promise<void>
  openExternal: (url: string) => Promise<void>
  selectDirectory: () => Promise<string | null>
  selectImage: () => Promise<string | null>
}

const electronAPI: ElectronAPI = {
  getTools: () => ipcRenderer.invoke('tools:getAll'),
  addTool: (tool) => ipcRenderer.invoke('tools:add', tool),
  updateTool: (id, updates) => ipcRenderer.invoke('tools:update', id, updates),
  removeTool: (id) => ipcRenderer.invoke('tools:remove', id),

  getCategories: () => ipcRenderer.invoke('categories:getAll'),
  addCategory: (name) => ipcRenderer.invoke('categories:add', name),
  removeCategory: (id) => ipcRenderer.invoke('categories:remove', id),

  launchProcess: (toolId, command, cwd) =>
    ipcRenderer.invoke('process:launch', toolId, command, cwd),
  stopProcess: (toolId) => ipcRenderer.invoke('process:stop', toolId),
  getProcessStatuses: () => ipcRenderer.invoke('process:getStatuses'),

  onStatusChanged: (callback) => {
    const handler = (_event: unknown, toolId: string, status: string) => callback(toolId, status)
    ipcRenderer.on('process:status-changed', handler)
    return () => ipcRenderer.removeListener('process:status-changed', handler)
  },
  onProcessOutput: (callback) => {
    const handler = (_event: unknown, toolId: string, data: string) => callback(toolId, data)
    ipcRenderer.on('process:output', handler)
    return () => ipcRenderer.removeListener('process:output', handler)
  },

  openFolder: (path) => ipcRenderer.invoke('system:openFolder', path),
  openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  selectImage: () => ipcRenderer.invoke('dialog:selectImage')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

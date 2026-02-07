import { create } from 'zustand'
import { ToolConfig, ToolStatus, ToolRuntime, Category } from '../types/tool'

interface ToolStore {
  tools: ToolConfig[]
  runtimes: Record<string, ToolRuntime>
  searchQuery: string
  selectedCategory: string | null
  categories: Category[]

  // Actions
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  loadTools: () => Promise<void>
  addTool: (tool: Omit<ToolConfig, 'id'>) => Promise<ToolConfig>
  updateTool: (id: string, updates: Partial<ToolConfig>) => Promise<void>
  removeTool: (id: string) => Promise<void>
  launchTool: (tool: ToolConfig) => Promise<void>
  stopTool: (id: string) => Promise<void>
  getToolStatus: (id: string) => ToolStatus
  getToolOutput: (id: string) => string[]
  setupListeners: () => () => void
  loadCategories: () => Promise<void>
  addCategory: (name: string) => Promise<Category>
  removeCategory: (id: string) => Promise<void>
}

export const useToolStore = create<ToolStore>((set, get) => ({
  tools: [],
  runtimes: {},
  searchQuery: '',
  selectedCategory: null,
  categories: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  loadTools: async () => {
    const tools = (await window.electronAPI.getTools()) as ToolConfig[]
    const statuses = (await window.electronAPI.getProcessStatuses()) as Record<string, ToolStatus>
    const runtimes: Record<string, ToolRuntime> = {}
    for (const tool of tools) {
      runtimes[tool.id] = {
        id: tool.id,
        status: statuses[tool.id] || 'stopped',
        output: []
      }
    }
    set({ tools, runtimes })
  },

  addTool: async (toolData) => {
    const newTool = (await window.electronAPI.addTool(toolData)) as ToolConfig
    set((state) => ({
      tools: [...state.tools, newTool],
      runtimes: {
        ...state.runtimes,
        [newTool.id]: { id: newTool.id, status: 'stopped', output: [] }
      }
    }))
    return newTool
  },

  updateTool: async (id, updates) => {
    await window.electronAPI.updateTool(id, updates)
    set((state) => ({
      tools: state.tools.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }))
  },

  removeTool: async (id) => {
    await window.electronAPI.removeTool(id)
    set((state) => {
      const newRuntimes = { ...state.runtimes }
      delete newRuntimes[id]
      return {
        tools: state.tools.filter((t) => t.id !== id),
        runtimes: newRuntimes
      }
    })
  },

  launchTool: async (tool) => {
    set((state) => ({
      runtimes: {
        ...state.runtimes,
        [tool.id]: { ...state.runtimes[tool.id], status: 'starting', output: [] }
      }
    }))
    await window.electronAPI.launchProcess(tool.id, tool.command, tool.workingDirectory)
  },

  stopTool: async (id) => {
    await window.electronAPI.stopProcess(id)
  },

  getToolStatus: (id) => {
    return get().runtimes[id]?.status ?? 'stopped'
  },

  getToolOutput: (id) => {
    return get().runtimes[id]?.output ?? []
  },

  setupListeners: () => {
    const unsubStatus = window.electronAPI.onStatusChanged((toolId, status) => {
      set((state) => {
        const runtime = state.runtimes[toolId] || { id: toolId, status: 'stopped', output: [] }
        return {
          runtimes: {
            ...state.runtimes,
            [toolId]: { ...runtime, status: status as ToolStatus }
          }
        }
      })
    })

    const unsubOutput = window.electronAPI.onProcessOutput((toolId, data) => {
      set((state) => {
        const runtime = state.runtimes[toolId] || { id: toolId, status: 'stopped', output: [] }
        const newOutput = [...runtime.output, data]
        // Keep last 500 lines
        if (newOutput.length > 500) {
          newOutput.splice(0, newOutput.length - 500)
        }
        return {
          runtimes: {
            ...state.runtimes,
            [toolId]: { ...runtime, output: newOutput }
          }
        }
      })
    })

    return () => {
      unsubStatus()
      unsubOutput()
    }
  },

  loadCategories: async () => {
    const categories = (await window.electronAPI.getCategories()) as Category[]
    set({ categories })
  },

  addCategory: async (name) => {
    const category = (await window.electronAPI.addCategory(name)) as Category
    set((state) => ({ categories: [...state.categories, category] }))
    return category
  },

  removeCategory: async (id) => {
    await window.electronAPI.removeCategory(id)
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      selectedCategory: state.selectedCategory === id ? null : state.selectedCategory
    }))
  }
}))

import Store from 'electron-store'

export interface ToolConfig {
  id: string
  name: string
  description: string
  category: string
  workingDirectory: string
  command: string
  webUrl?: string
  tags?: string[]
  icon?: string
}

export interface Category {
  id: string
  name: string
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ai-video', name: 'AI 视频' },
  { id: 'ai-audio', name: 'AI 音频' },
  { id: 'ai-image', name: 'AI 图像' },
  { id: 'dev-tools', name: '开发工具' },
  { id: 'other', name: '其他' }
]

interface StoreSchema {
  tools: ToolConfig[]
  categories: Category[]
}

const store = new Store<StoreSchema>({
  name: 'toolshub-config',
  defaults: {
    tools: [],
    categories: DEFAULT_CATEGORIES
  }
})

export function getAllTools(): ToolConfig[] {
  return store.get('tools')
}

export function addTool(tool: ToolConfig): void {
  const tools = store.get('tools')
  tools.push(tool)
  store.set('tools', tools)
}

export function updateTool(id: string, updates: Partial<ToolConfig>): void {
  const tools = store.get('tools')
  const index = tools.findIndex((t) => t.id === id)
  if (index !== -1) {
    tools[index] = { ...tools[index], ...updates }
    store.set('tools', tools)
  }
}

export function removeTool(id: string): void {
  const tools = store.get('tools').filter((t) => t.id !== id)
  store.set('tools', tools)
}

export function getAllCategories(): Category[] {
  return store.get('categories')
}

export function addCategory(category: Category): void {
  const categories = store.get('categories')
  categories.push(category)
  store.set('categories', categories)
}

export function removeCategory(id: string): void {
  const categories = store.get('categories').filter((c) => c.id !== id)
  store.set('categories', categories)
}

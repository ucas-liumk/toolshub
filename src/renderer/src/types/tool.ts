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

export type ToolStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

export interface ToolRuntime {
  id: string
  status: ToolStatus
  output: string[]
}

export interface Category {
  id: string
  name: string
}

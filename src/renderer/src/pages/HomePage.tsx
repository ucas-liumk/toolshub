import { Plus } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'
import { ToolGrid } from '../components/ToolGrid'
import { ToolConfig } from '../types/tool'

interface HomePageProps {
  onEdit: (tool: ToolConfig) => void
  onAdd: () => void
}

export function HomePage({ onEdit, onAdd }: HomePageProps) {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-5 flex items-center gap-3 drag-region">
        <div className="flex-1 max-w-md no-drag">
          <SearchBar />
        </div>
        <div className="flex-1" />
        <button
          onClick={onAdd}
          className="no-drag flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus size={18} />
          添加应用
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <ToolGrid onEdit={onEdit} onAdd={onAdd} />
      </div>
    </div>
  )
}

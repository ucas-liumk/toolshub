import { ToolConfig } from '../types/tool'
import { useToolStore } from '../stores/tool-store'
import { ToolCard } from './ToolCard'
import { PackageOpen } from 'lucide-react'

interface ToolGridProps {
  onEdit: (tool: ToolConfig) => void
  onAdd: () => void
}

export function ToolGrid({ onEdit, onAdd }: ToolGridProps) {
  const { tools, searchQuery, selectedCategory, categories } = useToolStore()

  // Filter tools
  let filtered = tools
  if (selectedCategory) {
    const cat = categories.find((c) => c.id === selectedCategory)
    if (cat) {
      filtered = filtered.filter((t) => t.category === cat.name)
    }
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <PackageOpen size={64} strokeWidth={1} className="mb-4" />
        {tools.length === 0 ? (
          <>
            <p className="text-lg font-medium text-slate-500">还没有添加任何应用</p>
            <p className="text-sm mt-1 mb-4">点击右上角按钮添加你的第一个应用</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-slate-500">没有找到匹配的应用</p>
            <p className="text-sm mt-1">试试其他搜索词或分类</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
      {filtered.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onEdit={onEdit} />
      ))}
    </div>
  )
}

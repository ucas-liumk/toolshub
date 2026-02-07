import { useState } from 'react'
import { Plus, LayoutGrid, X, Tag } from 'lucide-react'
import { useToolStore } from '../stores/tool-store'
import { ConfirmDialog } from './ConfirmDialog'
import iconPng from '../../../../resources/icon.png'

export function Sidebar() {
  const { selectedCategory, setSelectedCategory, tools, categories, addCategory, removeCategory } =
    useToolStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(
    null
  )

  const getCategoryCount = (categoryId: string | null): number => {
    if (categoryId === null) return tools.length
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat) return 0
    return tools.filter((t) => t.category === cat.name).length
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    await addCategory(name)
    setNewCategoryName('')
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddCategory()
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewCategoryName('')
    }
  }

  const handleRemoveClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    setDeletingCategory({ id, name })
  }

  const handleConfirmDelete = async () => {
    if (deletingCategory) {
      await removeCategory(deletingCategory.id)
      setDeletingCategory(null)
    }
  }

  return (
    <>
      <aside className="w-[220px] bg-slate-100 border-r border-slate-200 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 drag-region">
          <h1 className="text-[17px] font-bold text-indigo-600 flex items-center gap-2">
            <img src={iconPng} alt="应用管家" className="w-7 h-7" />
            应用管家
          </h1>
        </div>

        <nav className="flex-1 overflow-auto py-2">
          {/* All tools */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] transition-colors ${
              selectedCategory === null
                ? 'bg-indigo-50 text-indigo-700 font-medium border-r-2 border-indigo-500'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="flex-1 text-left">全部应用</span>
            {tools.length > 0 && (
              <span
                className={`text-[12px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === null
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {tools.length}
              </span>
            )}
          </button>

          {/* Dynamic categories */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id
            const count = getCategoryCount(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium border-r-2 border-indigo-500'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Tag size={18} />
                <span className="flex-1 text-left truncate">{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[12px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
                <span
                  onClick={(e) => handleRemoveClick(e, cat.id, cat.name)}
                  className="hidden group-hover:inline-flex items-center justify-center w-4 h-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </span>
              </button>
            )
          })}
        </nav>

        {/* Add category */}
        <div className="p-3 border-t border-slate-200">
          {isAdding ? (
            <div className="flex gap-1">
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newCategoryName.trim()) {
                    setIsAdding(false)
                  }
                }}
                placeholder="分类名称"
                className="flex-1 min-w-0 px-2 py-1.5 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                onClick={handleAddCategory}
                className="px-2 py-1.5 text-[13px] text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors"
              >
                添加
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-md transition-colors"
            >
              <Plus size={14} />
              新建分类
            </button>
          )}
        </div>
      </aside>

      {deletingCategory && (
        <ConfirmDialog
          title="删除分类"
          message={`确定要删除分类「${deletingCategory.name}」吗？已归属该分类的应用不会被删除。`}
          confirmText="删除"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import {
  X,
  FolderOpen,
  ImagePlus,
  Trash2,
  Video,
  Music,
  Image,
  Wrench,
  Globe,
  Cpu,
  Database,
  Terminal,
  Bot,
  Palette,
  FileText,
  MessageSquare,
  Camera,
  Mic,
  Clapperboard,
  Sparkles
} from 'lucide-react'
import { ToolConfig } from '../types/tool'
import { useToolStore } from '../stores/tool-store'

interface ToolFormProps {
  tool?: ToolConfig | null
  onSubmit: (data: Omit<ToolConfig, 'id'>) => void
  onClose: () => void
}

const PRESET_ICONS = [
  { name: 'video', icon: Video, color: '#6366f1' },
  { name: 'music', icon: Music, color: '#8b5cf6' },
  { name: 'image', icon: Image, color: '#ec4899' },
  { name: 'camera', icon: Camera, color: '#f43f5e' },
  { name: 'mic', icon: Mic, color: '#f97316' },
  { name: 'clapperboard', icon: Clapperboard, color: '#14b8a6' },
  { name: 'bot', icon: Bot, color: '#3b82f6' },
  { name: 'sparkles', icon: Sparkles, color: '#a855f7' },
  { name: 'palette', icon: Palette, color: '#f59e0b' },
  { name: 'terminal', icon: Terminal, color: '#22c55e' },
  { name: 'wrench', icon: Wrench, color: '#64748b' },
  { name: 'globe', icon: Globe, color: '#0ea5e9' },
  { name: 'cpu', icon: Cpu, color: '#6366f1' },
  { name: 'database', icon: Database, color: '#ef4444' },
  { name: 'file-text', icon: FileText, color: '#78716c' },
  { name: 'message', icon: MessageSquare, color: '#10b981' }
]

function renderPresetIconSvg(name: string, color: string): string {
  const preset = PRESET_ICONS.find((p) => p.name === name)
  if (!preset) return ''
  // We encode preset as "preset:<name>" so we can identify it
  return `preset:${name}:${color}`
}

function isPresetIcon(icon: string | undefined): boolean {
  return !!icon && icon.startsWith('preset:')
}

function parsePresetIcon(icon: string): { name: string; color: string } | null {
  if (!icon.startsWith('preset:')) return null
  const parts = icon.split(':')
  return { name: parts[1], color: parts[2] }
}

const defaultFormData: Omit<ToolConfig, 'id'> = {
  name: '',
  description: '',
  category: '',
  workingDirectory: '',
  command: '',
  webUrl: '',
  tags: []
}

export function ToolForm({ tool, onSubmit, onClose }: ToolFormProps) {
  const { categories } = useToolStore()
  const [formData, setFormData] = useState<Omit<ToolConfig, 'id'>>({
    ...defaultFormData,
    category: categories[0]?.name ?? ''
  })
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description,
        category: tool.category,
        workingDirectory: tool.workingDirectory,
        command: tool.command,
        webUrl: tool.webUrl || '',
        tags: tool.tags || [],
        icon: tool.icon
      })
      setTagsInput((tool.tags || []).join(', '))
    }
  }, [tool])

  const handleSelectIcon = async () => {
    const dataUrl = await window.electronAPI.selectImage()
    if (dataUrl) {
      setFormData((prev) => ({ ...prev, icon: dataUrl }))
    }
  }

  const handleSelectPreset = (name: string, color: string) => {
    const value = renderPresetIconSvg(name, color)
    setFormData((prev) => ({ ...prev, icon: prev.icon === value ? undefined : value }))
  }

  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon: undefined }))
  }

  const handleSelectDirectory = async () => {
    const dir = await window.electronAPI.selectDirectory()
    if (dir) {
      setFormData((prev) => ({ ...prev, workingDirectory: dir }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSubmit({ ...formData, tags: tags.length > 0 ? tags : undefined })
  }

  const currentPreset = formData.icon ? parsePresetIcon(formData.icon) : null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 no-drag">
      <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] flex flex-col">
        {/* Header - fixed */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {tool ? '编辑应用' : '添加应用'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-auto p-5 space-y-4">
            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">图标</label>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.icon && !isPresetIcon(formData.icon) ? (
                    <img src={formData.icon} alt="icon" className="w-full h-full object-cover" />
                  ) : currentPreset ? (
                    (() => {
                      const p = PRESET_ICONS.find((i) => i.name === currentPreset.name)
                      if (!p) return <ImagePlus size={22} className="text-slate-300" />
                      const Icon = p.icon
                      return <Icon size={26} style={{ color: currentPreset.color }} />
                    })()
                  ) : (
                    <ImagePlus size={22} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.map((p) => {
                      const Icon = p.icon
                      const isSelected = currentPreset?.name === p.name
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleSelectPreset(p.name, p.color)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-indigo-100 ring-2 ring-indigo-400'
                              : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                          title={p.name}
                        >
                          <Icon size={16} style={{ color: p.color }} />
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectIcon}
                      className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                    >
                      自定义图片
                    </button>
                    {formData.icon && (
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        移除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例如：GPT-SoVITS"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                描述 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="一句话描述应用用途"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                分类 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value
                  }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Working Directory */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                工作目录 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.workingDirectory}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, workingDirectory: e.target.value }))
                  }
                  placeholder="应用所在目录的绝对路径"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={handleSelectDirectory}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                  title="选择目录"
                >
                  <FolderOpen size={18} />
                </button>
              </div>
            </div>

            {/* Command */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                启动命令 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.command}
                onChange={(e) => setFormData((prev) => ({ ...prev, command: e.target.value }))}
                placeholder='例如：python app.py 或 go-web.bat'
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>

            {/* Web URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Web 地址</label>
              <input
                type="text"
                value={formData.webUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, webUrl: e.target.value }))}
                placeholder="例如：http://localhost:7860"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">标签</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="用逗号分隔，例如：TTS, 语音合成"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Footer - fixed */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              {tool ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { PRESET_ICONS, isPresetIcon, parsePresetIcon }

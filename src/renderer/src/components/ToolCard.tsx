import { useState } from 'react'
import {
  Play,
  Square,
  FolderOpen,
  Globe,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Terminal,
  MoreHorizontal
} from 'lucide-react'
import { ToolConfig } from '../types/tool'
import { useToolStore } from '../stores/tool-store'
import { ConsoleOutput } from './ConsoleOutput'
import { PRESET_ICONS, isPresetIcon, parsePresetIcon } from './ToolForm'
import { ConfirmDialog } from './ConfirmDialog'

const STATUS_COLORS = {
  stopped: 'bg-gray-400',
  starting: 'bg-yellow-400 animate-pulse',
  running: 'bg-green-500',
  stopping: 'bg-yellow-400 animate-pulse',
  error: 'bg-red-500'
}

const STATUS_LABELS = {
  stopped: '已停止',
  starting: '启动中',
  running: '运行中',
  stopping: '停止中',
  error: '错误'
}

function ToolIcon({ icon }: { icon?: string }) {
  if (icon && isPresetIcon(icon)) {
    const parsed = parsePresetIcon(icon)
    if (parsed) {
      const preset = PRESET_ICONS.find((p) => p.name === parsed.name)
      if (preset) {
        const Icon = preset.icon
        return <Icon size={22} style={{ color: parsed.color }} />
      }
    }
  }
  if (icon && !isPresetIcon(icon)) {
    return <img src={icon} alt="" className="w-full h-full object-cover" />
  }
  return <MoreHorizontal size={22} className="text-indigo-500" />
}

interface ToolCardProps {
  tool: ToolConfig
  onEdit: (tool: ToolConfig) => void
}

export function ToolCard({ tool, onEdit }: ToolCardProps) {
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { launchTool, stopTool, getToolStatus, getToolOutput, removeTool } = useToolStore()

  const status = getToolStatus(tool.id)
  const output = getToolOutput(tool.id)
  const isRunning = status === 'running' || status === 'starting'

  const handleLaunch = async () => {
    await launchTool(tool)
    setConsoleOpen(true)
  }

  const handleStop = async () => {
    await stopTool(tool.id)
  }

  const handleDelete = async () => {
    await removeTool(tool.id)
    setShowDeleteConfirm(false)
  }

  const handleOpenFolder = () => {
    window.electronAPI.openFolder(tool.workingDirectory)
  }

  const handleOpenWeb = () => {
    if (tool.webUrl) {
      window.electronAPI.openExternal(tool.webUrl)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
              <ToolIcon icon={tool.icon} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[15px] text-slate-800">{tool.name}</h3>
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
                <span className="text-xs text-slate-400">{STATUS_LABELS[status]}</span>
              </div>
              <p className="text-[13px] text-slate-500 mt-0.5">{tool.description}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <FolderOpen size={13} />
            <span className="truncate" title={tool.workingDirectory}>
              {tool.workingDirectory}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <Terminal size={13} />
            <code className="bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">
              {tool.command}
            </code>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[13px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
            {tool.category}
          </span>
          {tool.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[13px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-1">
        {isRunning ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Square size={15} />
            停止
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            disabled={status === 'stopping'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
          >
            <Play size={15} />
            启动
          </button>
        )}
        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          title="打开目录"
        >
          <FolderOpen size={15} />
        </button>
        {tool.webUrl && (
          <button
            onClick={handleOpenWeb}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
            title="打开 Web 界面"
            disabled={!isRunning}
          >
            <Globe size={15} />
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onEdit(tool)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          title="编辑"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-red-400 hover:bg-red-50 rounded-md transition-colors"
          title="删除"
        >
          <Trash2 size={15} />
        </button>
        <button
          onClick={() => setConsoleOpen(!consoleOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-md transition-colors ${
            consoleOpen
              ? 'bg-slate-100 text-slate-700'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="控制台"
        >
          <Terminal size={15} />
          {consoleOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Console */}
      {consoleOpen && (
        <div className="px-4 pb-4">
          <ConsoleOutput output={output} />
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="删除应用"
          message={`确定要删除应用「${tool.name}」吗？此操作不可恢复。`}
          confirmText="删除"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

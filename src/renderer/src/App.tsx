import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { ToolForm } from './components/ToolForm'
import { HomePage } from './pages/HomePage'
import { useToolStore } from './stores/tool-store'
import { ToolConfig } from './types/tool'

function App() {
  const { loadTools, loadCategories, setupListeners, addTool, updateTool } = useToolStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTool, setEditingTool] = useState<ToolConfig | null>(null)

  useEffect(() => {
    loadTools()
    loadCategories()
    const cleanup = setupListeners()
    return cleanup
  }, [])

  const handleAdd = () => {
    setEditingTool(null)
    setShowForm(true)
  }

  const handleEdit = (tool: ToolConfig) => {
    setEditingTool(tool)
    setShowForm(true)
  }

  const handleFormSubmit = async (data: Omit<ToolConfig, 'id'>) => {
    if (editingTool) {
      await updateTool(editingTool.id, data)
    } else {
      await addTool(data)
    }
    setShowForm(false)
    setEditingTool(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTool(null)
  }

  return (
    <>
      <Layout>
        <HomePage onEdit={handleEdit} onAdd={handleAdd} />
      </Layout>
      {showForm && (
        <ToolForm tool={editingTool} onSubmit={handleFormSubmit} onClose={handleFormClose} />
      )}
    </>
  )
}

export default App

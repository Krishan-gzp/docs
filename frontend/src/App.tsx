import React, { useState, useCallback } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Viewer3D from './components/Viewer3D'
import FileUpload from './components/FileUpload'
import ModelList from './components/ModelList'
import MetadataPanel from './components/MetadataPanel'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

export interface ModelFile {
  id: string
  originalName: string
  fileName: string
  filePath: string
  size: number
  mimetype: string
  extension: string
  uploadedAt: string
  url: string
}

export interface LoadedModel {
  file: ModelFile
  object?: any
  metadata?: any
  isVisible: boolean
  isExploded: boolean
  explodeAmount: number
}

function App() {
  const [models, setModels] = useState<ModelFile[]>([])
  const [loadedModels, setLoadedModels] = useState<LoadedModel[]>([])
  const [selectedModel, setSelectedModel] = useState<LoadedModel | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePanel, setActivePanel] = useState<'upload' | 'models' | 'metadata'>('upload')
  const [loading, setLoading] = useState(false)
  const [viewerKey, setViewerKey] = useState(0) // Force viewer re-render

  // Fetch models from backend
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      if (data.success) {
        setModels(data.models)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }, [])

  // Handle file upload success
  const handleUploadSuccess = useCallback((uploadedFiles: ModelFile[]) => {
    setModels(prev => [...uploadedFiles, ...prev])
    setActivePanel('models')
  }, [])

  // Handle model loading
  const handleModelLoad = useCallback((modelFile: ModelFile, object: any, metadata?: any) => {
    const newModel: LoadedModel = {
      file: modelFile,
      object,
      metadata,
      isVisible: true,
      isExploded: false,
      explodeAmount: 0
    }
    
    setLoadedModels(prev => {
      // Remove existing model with same ID if it exists
      const filtered = prev.filter(m => m.file.id !== modelFile.id)
      return [...filtered, newModel]
    })
    
    setSelectedModel(newModel)
    setActivePanel('metadata')
  }, [])

  // Handle model selection
  const handleModelSelect = useCallback((model: LoadedModel) => {
    setSelectedModel(model)
    setActivePanel('metadata')
  }, [])

  // Handle model visibility toggle
  const handleVisibilityToggle = useCallback((modelId: string) => {
    setLoadedModels(prev =>
      prev.map(model =>
        model.file.id === modelId
          ? { ...model, isVisible: !model.isVisible }
          : model
      )
    )
  }, [])

  // Handle model removal
  const handleModelRemove = useCallback((modelId: string) => {
    setLoadedModels(prev => prev.filter(model => model.file.id !== modelId))
    if (selectedModel && selectedModel.file.id === modelId) {
      setSelectedModel(null)
    }
  }, [selectedModel])

  // Handle explode/assemble
  const handleExplodeToggle = useCallback((modelId: string, explodeAmount: number = 1) => {
    setLoadedModels(prev =>
      prev.map(model =>
        model.file.id === modelId
          ? { 
              ...model, 
              isExploded: !model.isExploded,
              explodeAmount: model.isExploded ? 0 : explodeAmount
            }
          : model
      )
    )
  }, [])

  // Update explode amount
  const handleExplodeAmountChange = useCallback((modelId: string, amount: number) => {
    setLoadedModels(prev =>
      prev.map(model =>
        model.file.id === modelId
          ? { ...model, explodeAmount: amount, isExploded: amount > 0 }
          : model
      )
    )
  }, [])

  React.useEffect(() => {
    fetchModels()
  }, [fetchModels])

  const renderSidebarContent = () => {
    switch (activePanel) {
      case 'upload':
        return (
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onLoadingChange={setLoading}
          />
        )
      case 'models':
        return (
          <ModelList
            models={models}
            loadedModels={loadedModels}
            onModelLoad={handleModelLoad}
            onModelSelect={handleModelSelect}
            onVisibilityToggle={handleVisibilityToggle}
            onModelRemove={handleModelRemove}
            onRefresh={fetchModels}
            selectedModel={selectedModel}
          />
        )
      case 'metadata':
        return (
          <MetadataPanel
            model={selectedModel}
            onExplodeToggle={handleExplodeToggle}
            onExplodeAmountChange={handleExplodeAmountChange}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return <LoadingScreen message="Processing your model..." />
  }

  return (
    <div className="app">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        modelCount={loadedModels.length}
      />
      
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen}>
          {renderSidebarContent()}
        </Sidebar>
        
        <div className="viewer-container">
          <Viewer3D
            key={viewerKey}
            models={loadedModels}
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
          />
        </div>
      </div>
    </div>
  )
}

export default App
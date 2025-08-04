import React, { useState } from 'react'
import { ModelFile, LoadedModel } from '../App'

interface ModelListProps {
  models: ModelFile[]
  loadedModels: LoadedModel[]
  onModelLoad: (model: ModelFile, object: any, metadata?: any) => void
  onModelSelect: (model: LoadedModel) => void
  onVisibilityToggle: (modelId: string) => void
  onModelRemove: (modelId: string) => void
  onRefresh: () => void
  selectedModel: LoadedModel | null
}

const ModelList: React.FC<ModelListProps> = ({
  models,
  loadedModels,
  onModelLoad,
  onModelSelect,
  onVisibilityToggle,
  onModelRemove,
  onRefresh,
  selectedModel
}) => {
  const [loadingModels, setLoadingModels] = useState<Set<string>>(new Set())

  const isModelLoaded = (modelId: string): LoadedModel | undefined => {
    return loadedModels.find(m => m.file.id === modelId)
  }

  const isModelLoading = (modelId: string): boolean => {
    return loadingModels.has(modelId)
  }

  const handleLoadModel = async (model: ModelFile) => {
    if (isModelLoaded(model.id) || isModelLoading(model.id)) return

    setLoadingModels(prev => new Set(prev).add(model.id))

    try {
      // The actual loading happens in Viewer3D component
      // This just triggers the loading process
      onModelLoad(model, null)
    } catch (error) {
      console.error('Failed to load model:', error)
    } finally {
      setLoadingModels(prev => {
        const newSet = new Set(prev)
        newSet.delete(model.id)
        return newSet
      })
    }
  }

  const handleDeleteModel = async (model: ModelFile) => {
    if (window.confirm(`Are you sure you want to delete "${model.originalName}"?`)) {
      try {
        const response = await fetch(`/api/models/${model.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          onModelRemove(model.id)
          onRefresh()
        } else {
          const error = await response.json()
          alert(`Failed to delete model: ${error.message}`)
        }
      } catch (error) {
        console.error('Failed to delete model:', error)
        alert('Failed to delete model')
      }
    }
  }

  const getFileIcon = (extension: string): string => {
    switch (extension) {
      case '.ifc': return '🏗️'
      case '.glb': return '📦'
      case '.gltf': return '📦'
      default: return '📄'
    }
  }

  const getFileTypeDescription = (extension: string): string => {
    switch (extension) {
      case '.ifc': return 'BIM Model'
      case '.glb': return '3D Model (Binary)'
      case '.gltf': return '3D Model'
      default: return 'Unknown'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="model-list-container">
      <div className="model-list-header">
        <h3>📦 Uploaded Models</h3>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      {models.length === 0 ? (
        <div className="info-message">
          No models uploaded yet. Use the Upload tab to add 3D models.
        </div>
      ) : (
        <div className="model-list">
          {models.map(model => {
            const loadedModel = isModelLoaded(model.id)
            const isLoading = isModelLoading(model.id)
            const isSelected = selectedModel?.file.id === model.id

            return (
              <div
                key={model.id}
                className={`model-item ${loadedModel ? 'loaded' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => loadedModel && onModelSelect(loadedModel)}
              >
                <div className="model-header">
                  <div className="model-name">
                    {getFileIcon(model.extension)} {model.originalName}
                  </div>
                  <div className="model-actions">
                    {!loadedModel && !isLoading && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLoadModel(model)
                        }}
                        title="Load model in 3D viewer"
                      >
                        🚀
                      </button>
                    )}
                    {loadedModel && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onVisibilityToggle(model.id)
                        }}
                        title={loadedModel.isVisible ? 'Hide model' : 'Show model'}
                      >
                        {loadedModel.isVisible ? '👁️' : '🙈'}
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteModel(model)
                      }}
                      title="Delete model"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="model-info">
                  <div>
                    <strong>Type:</strong> {getFileTypeDescription(model.extension)}
                  </div>
                  <div>
                    <strong>Size:</strong> {formatFileSize(model.size)}
                  </div>
                  <div>
                    <strong>Uploaded:</strong> {formatDate(model.uploadedAt)}
                  </div>
                  <div>
                    <strong>Format:</strong> {model.extension.toUpperCase()}
                  </div>
                </div>

                <div className="model-status">
                  <div 
                    className={`status-indicator ${
                      loadedModel ? 'loaded' : isLoading ? 'loading' : ''
                    }`}
                  />
                  <span>
                    {loadedModel 
                      ? `Loaded ${loadedModel.isVisible ? '(Visible)' : '(Hidden)'}`
                      : isLoading 
                        ? 'Loading...'
                        : 'Not loaded'
                    }
                  </span>
                  {loadedModel?.isExploded && (
                    <span style={{ color: 'var(--warning-color)', marginLeft: '0.5rem' }}>
                      • Exploded
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {loadedModels.length > 0 && (
        <div className="model-list-summary">
          <div className="info-message">
            📊 {loadedModels.length} model{loadedModels.length !== 1 ? 's' : ''} loaded in viewer
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelList
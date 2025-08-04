import React, { useState } from 'react'
import { LoadedModel } from '../App'

interface MetadataPanelProps {
  model: LoadedModel | null
  onExplodeToggle: (modelId: string, explodeAmount?: number) => void
  onExplodeAmountChange: (modelId: string, amount: number) => void
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({
  model,
  onExplodeToggle,
  onExplodeAmountChange
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['file', 'explode']))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMetadataValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') return value.toLocaleString()
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  const renderIFCMetadata = (metadata: any) => {
    if (!metadata || typeof metadata !== 'object') return null

    return (
      <div className="metadata-section">
        <h4 
          onClick={() => toggleSection('ifc')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {expandedSections.has('ifc') ? '▼' : '▶'} BIM Properties
        </h4>
        {expandedSections.has('ifc') && (
          <div className="metadata-grid">
            {Object.entries(metadata).slice(0, 20).map(([key, value]) => (
              <div key={key} className="metadata-item">
                <span className="metadata-label">{key}:</span>
                <span className="metadata-value">{renderMetadataValue(value)}</span>
              </div>
            ))}
            {Object.entries(metadata).length > 20 && (
              <div className="metadata-item">
                <span className="metadata-label">Total Properties:</span>
                <span className="metadata-value">{Object.entries(metadata).length}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderGLTFMetadata = (metadata: any) => {
    if (!metadata || typeof metadata !== 'object') return null

    return (
      <div className="metadata-section">
        <h4 
          onClick={() => toggleSection('gltf')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {expandedSections.has('gltf') ? '▼' : '▶'} 3D Model Properties
        </h4>
        {expandedSections.has('gltf') && (
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Animations:</span>
              <span className="metadata-value">{metadata.animations || 0}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Scenes:</span>
              <span className="metadata-value">{metadata.scenes || 0}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Cameras:</span>
              <span className="metadata-value">{metadata.cameras || 0}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Materials:</span>
              <span className="metadata-value">{metadata.materials || 0}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Textures:</span>
              <span className="metadata-value">{metadata.textures || 0}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!model) {
    return (
      <div className="metadata-panel">
        <div className="info-message">
          Select a loaded model to view its properties and controls.
        </div>
        <div className="metadata-section">
          <h4>💡 Available Features</h4>
          <div className="upload-tips">
            <ul>
              <li><strong>Explode/Assemble:</strong> Separate components to examine internal structure</li>
              <li><strong>Visibility Control:</strong> Show/hide models in the 3D viewer</li>
              <li><strong>Properties:</strong> View detailed metadata and BIM information</li>
              <li><strong>Multi-Model:</strong> Load and compare multiple models simultaneously</li>
              <li><strong>Interactive Selection:</strong> Click on model parts for detailed information</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="metadata-panel">
      <h3>📊 Model Properties</h3>

      {/* File Information */}
      <div className="metadata-section">
        <h4 
          onClick={() => toggleSection('file')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {expandedSections.has('file') ? '▼' : '▶'} File Information
        </h4>
        {expandedSections.has('file') && (
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Name:</span>
              <span className="metadata-value">{model.file.originalName}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Format:</span>
              <span className="metadata-value">{model.file.extension.toUpperCase()}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Size:</span>
              <span className="metadata-value">{formatFileSize(model.file.size)}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Uploaded:</span>
              <span className="metadata-value">{formatDate(model.file.uploadedAt)}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">MIME Type:</span>
              <span className="metadata-value">{model.file.mimetype}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Status:</span>
              <span className="metadata-value">
                {model.isVisible ? '✅ Visible' : '🙈 Hidden'}
                {model.isExploded && ' • 💥 Exploded'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Explode/Assemble Controls */}
      <div className="metadata-section">
        <h4 
          onClick={() => toggleSection('explode')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {expandedSections.has('explode') ? '▼' : '▶'} Explode/Assemble Controls
        </h4>
        {expandedSections.has('explode') && (
          <div className="explode-controls">
            <button
              className={`btn ${model.isExploded ? 'btn-warning' : 'btn-primary'} w-full`}
              onClick={() => onExplodeToggle(model.file.id, model.isExploded ? 0 : 1)}
            >
              {model.isExploded ? '🔧 Assemble' : '💥 Explode'} Model
            </button>
            
            <div className="explode-slider">
              <label htmlFor="explode-amount">
                Explosion Amount: <span className="explode-value">{Math.round(model.explodeAmount * 100)}%</span>
              </label>
              <input
                id="explode-amount"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={model.explodeAmount}
                onChange={(e) => onExplodeAmountChange(model.file.id, parseFloat(e.target.value))}
              />
            </div>
            
            <div className="info-message">
              💡 Use explode view to examine internal components and understand the model structure.
            </div>
          </div>
        )}
      </div>

      {/* Model-specific metadata */}
      {model.file.extension === '.ifc' && renderIFCMetadata(model.metadata)}
      {(model.file.extension === '.glb' || model.file.extension === '.gltf') && renderGLTFMetadata(model.metadata)}

      {/* Component Simulation */}
      <div className="metadata-section">
        <h4 
          onClick={() => toggleSection('simulation')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {expandedSections.has('simulation') ? '▼' : '▶'} Component Simulation
        </h4>
        {expandedSections.has('simulation') && (
          <div className="metadata-grid">
            <div className="info-message">
              🚧 Advanced component simulation features will be available in future updates:
            </div>
            <div className="upload-tips">
              <ul>
                <li>Material stress analysis</li>
                <li>Thermal behavior simulation</li>
                <li>Construction sequence animation</li>
                <li>Load path visualization</li>
                <li>Assembly instruction generation</li>
              </ul>
            </div>
            <button className="btn btn-secondary w-full" disabled>
              🔬 Run Simulation (Coming Soon)
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="metadata-section">
        <h4>⚡ Quick Actions</h4>
        <div className="explode-controls">
          <button
            className="btn btn-secondary w-full"
            onClick={() => onExplodeToggle(model.file.id, 0)}
            disabled={!model.isExploded}
          >
            🔧 Reset Position
          </button>
          <button className="btn btn-outline w-full" disabled>
            📸 Take Screenshot (Coming Soon)
          </button>
          <button className="btn btn-outline w-full" disabled>
            📋 Export Properties (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  )
}

export default MetadataPanel
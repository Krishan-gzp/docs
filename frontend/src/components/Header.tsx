import React from 'react'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  activePanel: 'upload' | 'models' | 'metadata'
  onPanelChange: (panel: 'upload' | 'models' | 'metadata') => void
  modelCount: number
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  sidebarOpen,
  activePanel,
  onPanelChange,
  modelCount
}) => {
  return (
    <div className="header">
      <div className="header-left">
        <button 
          className="sidebar-toggle" 
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        <h1 className="header-title">
          3D BIM Viewer
          <span className="header-subtitle">
            Powered by ThatOpen & Three.js
          </span>
        </h1>
      </div>
      
      <div className="header-center">
        <button
          className={`tab-button ${activePanel === 'upload' ? 'active' : ''}`}
          onClick={() => onPanelChange('upload')}
        >
          📁 Upload
        </button>
        <button
          className={`tab-button ${activePanel === 'models' ? 'active' : ''}`}
          onClick={() => onPanelChange('models')}
        >
          📦 Models
        </button>
        <button
          className={`tab-button ${activePanel === 'metadata' ? 'active' : ''}`}
          onClick={() => onPanelChange('metadata')}
        >
          📊 Properties
        </button>
      </div>
      
      <div className="header-right">
        {modelCount > 0 && (
          <span className="model-count" title={`${modelCount} models loaded`}>
            {modelCount}
          </span>
        )}
        <div className="viewer-info">
          IFC • GLB • GLTF
        </div>
      </div>
    </div>
  )
}

export default Header
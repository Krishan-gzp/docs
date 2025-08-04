import React, { useState, useRef, useCallback } from 'react'
import { ModelFile } from '../App'

interface FileUploadProps {
  onUploadSuccess: (files: ModelFile[]) => void
  onLoadingChange: (loading: boolean) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onLoadingChange }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedFormats = ['.ifc', '.glb', '.gltf']

  const validateFile = (file: File): boolean => {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!supportedFormats.includes(extension)) {
      setError(`Unsupported file format: ${extension}. Supported formats: ${supportedFormats.join(', ')}`)
      return false
    }
    
    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is 100MB.`)
      return false
    }
    
    return true
  }

  const uploadFiles = useCallback(async (files: FileList) => {
    setError(null)
    setUploading(true)
    setUploadProgress(0)
    onLoadingChange(true)

    try {
      const validFiles = Array.from(files).filter(validateFile)
      
      if (validFiles.length === 0) {
        throw new Error('No valid files to upload')
      }

      const formData = new FormData()
      validFiles.forEach(file => {
        formData.append('models', file)
      })

      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        onUploadSuccess(result.files)
        setUploadProgress(100)
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      onLoadingChange(false)
    }
  }, [onUploadSuccess, onLoadingChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [uploadFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }, [uploadFiles])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="file-upload-container">
      <h3>📁 Upload 3D Models</h3>
      
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={supportedFormats.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Uploading files...</p>
            {uploadProgress > 0 && (
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              {dragActive ? '📂' : '📁'}
            </div>
            <p className="upload-text">
              {dragActive 
                ? 'Drop files here to upload' 
                : 'Drag & drop files here or click to browse'
              }
            </p>
            <p className="upload-subtext">
              Supports: {supportedFormats.join(', ')} • Max size: 100MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="upload-info">
        <h4>📋 Supported Formats</h4>
        <div className="format-list">
          <div className="format-item">
            <strong>.ifc</strong> - Industry Foundation Classes (BIM models)
          </div>
          <div className="format-item">
            <strong>.glb</strong> - Binary glTF (3D models)
          </div>
          <div className="format-item">
            <strong>.gltf</strong> - glTF with separate assets
          </div>
        </div>
        
        <div className="upload-tips">
          <h4>💡 Tips</h4>
          <ul>
            <li>IFC files will display BIM properties and metadata</li>
            <li>GLB/GLTF files support advanced materials and animations</li>
            <li>Multiple files can be uploaded simultaneously</li>
            <li>Use explode/assemble features to examine components</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
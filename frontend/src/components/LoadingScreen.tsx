import React from 'react'

interface LoadingScreenProps {
  message?: string
  submessage?: string
  progress?: number
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  submessage,
  progress 
}) => {
  return (
    <div className="loading-screen fade-in">
      <div className="spinner"></div>
      <div className="loading-message">{message}</div>
      {submessage && (
        <div className="loading-submessage">{submessage}</div>
      )}
      {progress !== undefined && (
        <div className="progress mt-2" style={{ width: '200px' }}>
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default LoadingScreen
import React from 'react'

interface SidebarProps {
  isOpen: boolean
  children: React.ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, children }) => {
  return (
    <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="sidebar-content">
        {children}
      </div>
    </div>
  )
}

export default Sidebar
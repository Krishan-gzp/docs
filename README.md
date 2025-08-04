# 3D BIM Viewer 🏗️

An advanced 3D model viewer supporting IFC, GLB, and GLTF files with powerful explode/assemble functionality and comprehensive metadata visualization. Built with modern web technologies including ThatOpen ecosystem, Three.js, React, and Express.

![3D BIM Viewer](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Node](https://img.shields.io/badge/Node.js-18+-brightgreen) ![React](https://img.shields.io/badge/React-18-61dafb)

## ✨ Features

### 🎯 Core Functionality
- **Multi-Format Support**: IFC, GLB, GLTF file formats
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **Real-time 3D Visualization**: High-performance rendering with Three.js
- **Explode/Assemble Views**: Interactive component separation and assembly
- **Metadata Visualization**: Comprehensive property display for BIM models
- **Multi-Model Loading**: Compare and analyze multiple models simultaneously

### 🔧 Advanced Features
- **Interactive Object Selection**: Click on model parts for detailed information
- **Visibility Controls**: Show/hide individual models
- **Camera Controls**: Orbit, pan, zoom with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Material & Lighting**: Realistic rendering with shadows and reflections
- **Component Simulation**: Framework for future simulation features

### 🏗️ BIM-Specific Features
- **IFC Property Extraction**: Detailed building information metadata
- **Hierarchical Structure**: Navigate through building components
- **Construction Sequence**: Visual assembly/disassembly animations
- **Performance Optimization**: Efficient handling of large BIM models

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with WebGL support

### ⚠️ Windows Users - Path Length Issue
If you get "path too long" errors when extracting:
1. **Extract to short path:** `C:\bim\3d-bim-viewer`
2. **Use 7-Zip:** Download from https://www.7-zip.org/
3. **Run PowerShell script:** `enable-long-paths.ps1` (as Administrator)
4. **See:** `EXTRACT_SOLUTION.md` for detailed help

### Installation

#### Method 1: Automated Setup (Windows)
```bash
# After extracting to C:\bim\3d-bim-viewer
double-click quick-setup.bat
```

#### Method 2: Manual Setup
```bash
# Navigate to project
cd C:\bim\3d-bim-viewer
# or your extraction path

# Install all dependencies
npm install

# Start the application
npm run dev
```

#### Method 3: Git Clone (Recommended)
```bash
git clone https://github.com/your-username/3d-bim-viewer.git C:\bim\viewer
cd C:\bim\viewer
npm install
npm run dev
```

### Access the Application
```
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```

## 📁 Project Structure (Optimized for Windows)

```
3d-bim-viewer/              # ← Extract here: C:\bim\3d-bim-viewer
├── backend/               # Express.js server
│   ├── routes/           # API routes
│   └── server.js         # Main server file
├── frontend/             # React application (source only)
│   ├── src/             # React components
│   │   ├── components/  # UI components
│   │   ├── App.tsx      # Main app
│   │   └── main.tsx     # Entry point
│   └── vite.config.ts   # Build configuration
├── public/              # File storage
│   ├── uploads/         # Uploaded models
│   └── metadata/        # Model metadata
├── node_modules/        # Single dependency folder (short paths)
├── package.json         # All dependencies here
├── quick-setup.bat      # Windows setup script
├── enable-long-paths.ps1 # PowerShell script
└── EXTRACT_SOLUTION.md  # Path length fix guide
```

**Key Optimizations:**
- ✅ Single `node_modules` (no nested paths)
- ✅ Unified `package.json` (all deps in root)
- ✅ Short folder names
- ✅ Windows-specific helper scripts

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI framework with hooks
- **TypeScript**: Type-safe development
- **Three.js**: 3D graphics and rendering
- **ThatOpen Components**: BIM-specific 3D tools
- **ThatOpen Fragments**: Efficient 3D model format
- **web-ifc**: IFC file processing
- **Vite**: Fast development and build tool

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web application framework
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development server
- **Concurrently**: Parallel script execution

## 📖 Usage Guide

### 1. Upload Models
- Navigate to the **Upload** tab
- Drag and drop files or click to browse
- Supported formats: `.ifc`, `.glb`, `.gltf`
- Maximum file size: 100MB per file

### 2. Load and View Models
- Switch to the **Models** tab
- Click the 🚀 button to load a model in the 3D viewer
- Use mouse/touch to navigate:
  - **Left click + drag**: Rotate view
  - **Right click + drag**: Pan view
  - **Scroll wheel**: Zoom in/out

### 3. Explode/Assemble
- Select a loaded model
- Go to the **Properties** tab
- Use the "Explode Model" button
- Adjust explosion amount with the slider
- Use "Assemble" to restore original positions

### 4. Explore Metadata
- Click on model parts in the 3D viewer
- View comprehensive properties in the Properties panel
- Expand/collapse different metadata sections
- Access file information, BIM properties, and model statistics

## 🎨 Customization

### Adding New File Formats
1. Extend the file validation in `backend/routes/upload.js`
2. Add loader logic in `frontend/src/components/Viewer3D.tsx`
3. Update UI components to display format-specific information

### Styling and Themes
- Modify CSS variables in `frontend/src/index.css`
- Create custom themes by updating the `:root` color variables
- Add new components in `frontend/src/components/`

### API Extensions
- Add new routes in `backend/routes/`
- Extend the model metadata structure
- Implement additional file processing features

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
UPLOAD_MAX_SIZE=100
```

### Frontend Configuration
Modify `frontend/vite.config.ts` for:
- Build optimization
- Proxy settings
- Bundle analysis

## 🧪 Testing

### Run Tests
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# All tests
npm test
```

### Manual Testing
1. Upload various file formats
2. Test explode/assemble functionality
3. Verify metadata display
4. Check responsive design on different devices

## 📦 Deployment

### Development Build
```bash
npm run build
npm start
```

### Production Deployment
1. **Build the frontend**
```bash
cd frontend && npm run build
```

2. **Configure production server**
```bash
# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start server
npm start
```

3. **Docker Deployment** (optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cd frontend && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent indentation (2 spaces)

## 🔍 Troubleshooting

### Common Issues

**Q: Models not loading**
- Check file format is supported (.ifc, .glb, .gltf)
- Verify file size is under 100MB
- Check browser console for errors

**Q: 3D viewer not initializing**
- Ensure WebGL is supported in your browser
- Check for JavaScript errors in browser console
- Verify all dependencies are installed

**Q: Upload failing**
- Check server is running on port 5000
- Verify file permissions in uploads directory
- Check network connectivity

**Q: Performance issues with large models**
- Use GLB format for better performance
- Consider model optimization
- Increase browser memory limits if needed

## 📚 API Reference

### Upload Endpoints
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/progress/:id` - Get upload progress

### Model Endpoints
- `GET /api/models` - List all models
- `GET /api/models/:id` - Get specific model
- `DELETE /api/models/:id` - Delete model
- `GET /api/models/:id/stats` - Get model statistics

### Health Check
- `GET /api/health` - Server health status

## 🙏 Acknowledgments

This project leverages the excellent work of:

- **[ThatOpen Company](https://github.com/ThatOpen)** - Advanced BIM tools and web-ifc
- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[OpenSource BIM](https://github.com/opensourceBIM)** - BIM server and tools
- **[React](https://reactjs.org/)** - UI framework
- **[Node.js](https://nodejs.org/)** - Server runtime

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🚀 Future Roadmap

- [ ] Advanced simulation features
- [ ] Multi-user collaboration
- [ ] Cloud storage integration
- [ ] Mobile app development
- [ ] AR/VR support
- [ ] Advanced analytics
- [ ] Plugin system
- [ ] Real-time updates

## 📞 Support

For support, questions, or feature requests:

- Create an issue on GitHub
- Join our community discussions
- Check the documentation wiki
- Contact the development team

---

**Made with ❤️ for the BIM and 3D visualization community**

# 3D BIM Viewer - Demo Guide 🚀

## Overview
This comprehensive 3D BIM viewer supports IFC, GLB, and GLTF files with advanced explode/assemble functionality. Built using ThatOpen's cutting-edge ecosystem and modern web technologies.

## Quick Start Demo

### 1. Starting the Application
```bash
# In the root directory
npm run dev
```

This starts both the backend (port 5000) and frontend (port 3000) simultaneously.

### 2. Accessing the Interface
Open your browser to: `http://localhost:3000`

You'll see a professional interface with:
- **Header**: Navigation tabs and model counter
- **Sidebar**: File upload, model list, and properties panels
- **3D Viewer**: Interactive visualization area

### 3. Uploading Your First Model

#### Step 1: Navigate to Upload Tab
- Click the "📁 Upload" tab in the header
- Or use the sidebar toggle to open the upload panel

#### Step 2: Upload a File
**Supported Formats:**
- `.ifc` - Building Information Models (BIM)
- `.glb` - Binary glTF (3D models)
- `.gltf` - glTF with separate assets

**Upload Methods:**
- Drag and drop files onto the upload area
- Click the upload area to browse and select files
- Multiple files can be uploaded simultaneously

**File Constraints:**
- Maximum size: 100MB per file
- Formats automatically validated

### 4. Loading Models in 3D Viewer

#### Step 1: Switch to Models Tab
- Click "📦 Models" in the header
- View all uploaded models with status indicators

#### Step 2: Load Model
- Find your uploaded model in the list
- Click the 🚀 (Load) button
- Watch as the model appears in the 3D viewer

#### Model Status Indicators:
- 🟢 **Green border**: Model is loaded and visible
- 🔴 **Red indicator**: Error loading model
- 🟡 **Yellow indicator**: Model is loading
- **No indicator**: Model not yet loaded

### 5. Exploring 3D Features

#### Navigation Controls
- **Left Mouse + Drag**: Rotate the view
- **Right Mouse + Drag**: Pan the view
- **Mouse Wheel**: Zoom in/out
- **Touch Support**: Full touch navigation on mobile

#### Object Interaction
- **Click on model parts**: Select components for detailed information
- **Hover effects**: Visual feedback on interactive elements
- **Multi-model support**: Load multiple models simultaneously

### 6. Explode/Assemble Functionality

#### Step 1: Select a Loaded Model
- Click on any loaded model in the Models list
- Or click directly on the model in the 3D viewer
- Switch to the "📊 Properties" tab

#### Step 2: Access Explode Controls
- Locate the "Explode/Assemble Controls" section
- Click to expand if collapsed

#### Step 3: Explode the Model
- Click "💥 Explode Model" button
- Components will separate from the center
- Use the explosion slider to control the separation amount

#### Step 4: Fine-tune Explosion
- Drag the "Explosion Amount" slider (0-200%)
- Watch real-time changes in the 3D viewer
- Components move outward based on their center positions

#### Step 5: Reassemble
- Click "🔧 Assemble Model" to restore original positions
- Or set explosion amount to 0%

### 7. Metadata and Properties

#### File Information
Every loaded model displays:
- Original filename and format
- File size and upload timestamp
- MIME type and current status
- Visibility state and explosion status

#### BIM Properties (IFC Files)
- Building information metadata
- Component hierarchies
- Material specifications
- Geometric properties
- Construction details

#### 3D Model Properties (GLB/GLTF Files)
- Animation count
- Scene information
- Camera configurations
- Material and texture counts
- Mesh statistics

### 8. Advanced Features

#### Model Management
- **Visibility Toggle**: 👁️/🙈 buttons to show/hide models
- **Model Deletion**: 🗑️ button to remove models
- **Model Refresh**: 🔄 button to reload model list

#### Multi-Model Scenarios
- Load multiple models simultaneously
- Compare different design versions
- Overlay various building systems
- Independent explode controls per model

#### Performance Monitoring
- Real-time vertex and triangle counts
- Object count display
- Memory usage optimization
- Automatic level-of-detail adjustments

## Demo Scenarios

### Scenario 1: Architectural Review
1. Upload an IFC building model
2. Load it in the 3D viewer
3. Explode to examine structural components
4. Review BIM properties for each element
5. Take screenshots for documentation

### Scenario 2: Design Comparison
1. Upload multiple versions of the same design
2. Load them with different visibility states
3. Toggle between versions to see changes
4. Use explode view to compare internal structures

### Scenario 3: Construction Planning
1. Upload construction sequence models
2. Load them in chronological order
3. Use explode view to understand assembly
4. Review component metadata for specifications

## Sample Files for Testing

### IFC Files (BIM Models)
- Small residential buildings
- Office building samples
- Infrastructure models
- MEP (Mechanical, Electrical, Plumbing) systems

### GLB/GLTF Files (3D Models)
- Architectural visualizations
- Product designs
- Furniture and fixtures
- Landscape elements

## Troubleshooting Demo Issues

### Model Not Loading
- Check file format is supported
- Verify file isn't corrupted
- Check browser console for errors
- Ensure file size is under 100MB

### Poor Performance
- Close other browser tabs
- Use GLB format for better performance
- Reduce explosion amount for complex models
- Check available system memory

### Upload Failures
- Verify backend server is running (port 5000)
- Check file permissions
- Ensure stable internet connection
- Try smaller file sizes first

## Browser Compatibility

### Recommended Browsers
- **Chrome 90+**: Best performance and compatibility
- **Firefox 88+**: Full feature support
- **Safari 14+**: Good compatibility (some limitations)
- **Edge 90+**: Full feature support

### Required Features
- WebGL 2.0 support
- ES2020 JavaScript features
- File API support
- Modern CSS support

## Performance Expectations

### File Size vs Performance
- **< 10MB**: Instant loading, smooth interactions
- **10-50MB**: Fast loading, good performance
- **50-100MB**: Moderate loading time, acceptable performance
- **> 100MB**: Upload rejected, optimization required

### Model Complexity
- **< 10k vertices**: Real-time explode/assemble
- **10k-100k vertices**: Smooth interactions
- **100k-1M vertices**: Good performance with optimizations
- **> 1M vertices**: May require performance adjustments

## Next Steps

After exploring the demo:

1. **Customize the Interface**: Modify CSS variables for theming
2. **Add New Features**: Extend components for specific needs
3. **Integrate with Systems**: Connect to existing BIM workflows
4. **Deploy**: Set up production environment
5. **Scale**: Implement cloud storage and collaboration

## Support and Resources

- **Documentation**: Check README.md for detailed setup
- **Issues**: Report bugs via GitHub issues
- **Community**: Join discussions and share feedback
- **Updates**: Follow releases for new features

---

**Enjoy exploring your 3D BIM models! 🏗️✨**
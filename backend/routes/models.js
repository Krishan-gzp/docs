import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all uploaded models
router.get('/', async (req, res) => {
  try {
    const metadataDir = path.join(__dirname, '../../public/metadata');
    
    try {
      const files = await fs.readdir(metadataDir);
      const modelFiles = files.filter(file => file.endsWith('.json'));
      
      const models = await Promise.all(
        modelFiles.map(async (file) => {
          const filePath = path.join(metadataDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(data);
        })
      );

      // Sort by upload date (newest first)
      models.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      res.json({
        success: true,
        count: models.length,
        models
      });
    } catch (error) {
      // If metadata directory doesn't exist, return empty array
      res.json({
        success: true,
        count: 0,
        models: []
      });
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      message: error.message 
    });
  }
});

// Get specific model by ID
router.get('/:id', async (req, res) => {
  try {
    const modelId = req.params.id;
    const metadataFile = path.join(__dirname, '../../public/metadata', `${modelId}.json`);
    
    const data = await fs.readFile(metadataFile, 'utf-8');
    const model = JSON.parse(data);
    
    res.json({
      success: true,
      model
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ 
        error: 'Model not found',
        message: `Model with ID ${req.params.id} does not exist`
      });
    } else {
      console.error('Error fetching model:', error);
      res.status(500).json({ 
        error: 'Failed to fetch model',
        message: error.message 
      });
    }
  }
});

// Delete model
router.delete('/:id', async (req, res) => {
  try {
    const modelId = req.params.id;
    const metadataFile = path.join(__dirname, '../../public/metadata', `${modelId}.json`);
    
    // Read metadata to get file path
    const data = await fs.readFile(metadataFile, 'utf-8');
    const model = JSON.parse(data);
    
    // Delete the actual file
    const filePath = path.join(__dirname, '../../public/uploads', model.fileName);
    await fs.unlink(filePath);
    
    // Delete metadata
    await fs.unlink(metadataFile);
    
    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ 
        error: 'Model not found',
        message: `Model with ID ${req.params.id} does not exist`
      });
    } else {
      console.error('Error deleting model:', error);
      res.status(500).json({ 
        error: 'Failed to delete model',
        message: error.message 
      });
    }
  }
});

// Get model statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const modelId = req.params.id;
    const metadataFile = path.join(__dirname, '../../public/metadata', `${modelId}.json`);
    
    const data = await fs.readFile(metadataFile, 'utf-8');
    const model = JSON.parse(data);
    
    // Basic file statistics
    const stats = {
      id: model.id,
      fileName: model.originalName,
      fileSize: model.size,
      fileSizeFormatted: formatFileSize(model.size),
      fileType: model.extension,
      uploadDate: model.uploadedAt,
      lastAccessed: new Date().toISOString()
    };
    
    // For IFC files, we could extract more detailed statistics
    if (model.extension === '.ifc') {
      stats.type = 'IFC';
      stats.description = 'Industry Foundation Classes - Building Information Model';
    } else if (model.extension === '.glb') {
      stats.type = 'GLB';
      stats.description = 'Binary glTF - 3D Model';
    } else if (model.extension === '.gltf') {
      stats.type = 'GLTF';
      stats.description = 'glTF - 3D Model with separate assets';
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ 
        error: 'Model not found',
        message: `Model with ID ${req.params.id} does not exist`
      });
    } else {
      console.error('Error fetching model stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch model statistics',
        message: error.message 
      });
    }
  }
});

// Utility function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;
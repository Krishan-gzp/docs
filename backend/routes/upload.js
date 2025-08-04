import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.ifc', '.glb', '.gltf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${fileExtension}. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Upload single file
router.post('/single', upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      id: path.parse(req.file.filename).name,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      extension: path.extname(req.file.originalname).toLowerCase(),
      uploadedAt: new Date().toISOString(),
      url: `/uploads/${req.file.filename}`
    };

    // Store file metadata (in production, you'd use a database)
    const metadataDir = path.join(__dirname, '../../public/metadata');
    await fs.mkdir(metadataDir, { recursive: true });
    
    const metadataFile = path.join(metadataDir, `${fileInfo.id}.json`);
    await fs.writeFile(metadataFile, JSON.stringify(fileInfo, null, 2));

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

// Upload multiple files
router.post('/multiple', upload.array('models', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const filesInfo = await Promise.all(
      req.files.map(async (file) => {
        const fileInfo = {
          id: path.parse(file.filename).name,
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          size: file.size,
          mimetype: file.mimetype,
          extension: path.extname(file.originalname).toLowerCase(),
          uploadedAt: new Date().toISOString(),
          url: `/uploads/${file.filename}`
        };

        // Store file metadata
        const metadataDir = path.join(__dirname, '../../public/metadata');
        await fs.mkdir(metadataDir, { recursive: true });
        
        const metadataFile = path.join(metadataDir, `${fileInfo.id}.json`);
        await fs.writeFile(metadataFile, JSON.stringify(fileInfo, null, 2));

        return fileInfo;
      })
    );

    res.json({
      success: true,
      message: `${filesInfo.length} files uploaded successfully`,
      files: filesInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

// Get upload progress (for future implementation)
router.get('/progress/:uploadId', (req, res) => {
  // This would be implemented with a more sophisticated upload system
  res.json({ 
    uploadId: req.params.uploadId,
    progress: 100,
    status: 'completed'
  });
});

export default router;
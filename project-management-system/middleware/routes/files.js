const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload file endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      id: uuidv4(),
      filename: req.file.originalname,
      stored_filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploaded_at: new Date().toISOString()
    };

    // Process image files
    if (req.file.mimetype.startsWith('image/')) {
      try {
        const thumbnailPath = path.join(path.dirname(req.file.path), `thumb_${req.file.filename}`);
        await sharp(req.file.path)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        fileInfo.thumbnail = `thumb_${req.file.filename}`;
      } catch (error) {
        console.error('Thumbnail generation failed:', error);
      }
    }

    // Extract text content for searchable documents
    if (req.file.mimetype === 'application/pdf') {
      try {
        const dataBuffer = await fs.readFile(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        fileInfo.text_content = pdfData.text.substring(0, 5000); // Limit to first 5000 chars
      } catch (error) {
        console.error('PDF text extraction failed:', error);
      }
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const result = await mammoth.extractRawText({ path: req.file.path });
        fileInfo.text_content = result.value.substring(0, 5000);
      } catch (error) {
        console.error('DOCX text extraction failed:', error);
      }
    }

    res.json({
      message: 'File uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileInfo = {
        id: uuidv4(),
        filename: file.originalname,
        stored_filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploaded_at: new Date().toISOString()
      };

      // Generate thumbnail for images
      if (file.mimetype.startsWith('image/')) {
        try {
          const thumbnailPath = path.join(path.dirname(file.path), `thumb_${file.filename}`);
          await sharp(file.path)
            .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
          
          fileInfo.thumbnail = `thumb_${file.filename}`;
        } catch (error) {
          console.error('Thumbnail generation failed:', error);
        }
      }

      uploadedFiles.push(fileInfo);
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Get file
router.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

// Delete file
router.delete('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    const thumbnailPath = path.join(__dirname, '../uploads', `thumb_${filename}`);

    // Delete main file
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Main file deletion failed:', error);
    }

    // Delete thumbnail if exists
    try {
      await fs.unlink(thumbnailPath);
    } catch (error) {
      // Thumbnail might not exist, ignore error
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file info
router.get('/info/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    try {
      const stats = await fs.stat(filePath);
      const fileInfo = {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      };
      
      res.json(fileInfo);
    } catch (error) {
      res.status(404).json({ error: 'File not found', exists: false });
    }
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// Image processing endpoint
router.post('/process-image/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const { width, height, quality = 80, format = 'jpeg' } = req.body;
    
    const inputPath = path.join(__dirname, '../uploads', filename);
    const outputFilename = `processed_${Date.now()}_${filename}`;
    const outputPath = path.join(__dirname, '../uploads', outputFilename);

    let processor = sharp(inputPath);

    if (width || height) {
      processor = processor.resize(parseInt(width), parseInt(height), {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (format === 'jpeg') {
      processor = processor.jpeg({ quality: parseInt(quality) });
    } else if (format === 'png') {
      processor = processor.png({ quality: parseInt(quality) });
    } else if (format === 'webp') {
      processor = processor.webp({ quality: parseInt(quality) });
    }

    await processor.toFile(outputPath);

    res.json({
      message: 'Image processed successfully',
      processed_filename: outputFilename,
      original_filename: filename
    });

  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: 'Image processing failed', details: error.message });
  }
});

module.exports = router;
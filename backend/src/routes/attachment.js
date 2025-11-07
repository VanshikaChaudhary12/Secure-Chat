const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    cb(null, `${fileId}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept all file types since they're encrypted
    cb(null, true);
  }
});

// Upload encrypted attachment
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      fileId: path.parse(req.file.filename).name,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download encrypted attachment
router.get('/download/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Find file with matching ID
    const files = fs.readdirSync(uploadDir);
    const file = files.find(f => f.startsWith(id));
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadDir, file);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
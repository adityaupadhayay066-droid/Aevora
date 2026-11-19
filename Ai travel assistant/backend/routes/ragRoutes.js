const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { adminProtect, optionalProtect } = require('../middleware/authMiddleware');
const {
    getRAGStats,
    getRAGDocuments,
    uploadDocument,
    queryRAGEngine,
    deleteDocument,
    rebuildRAGIndex
} = require('../controllers/ragController');

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/rag';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const sanitizedOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${sanitizedOriginal}`);
    }
});

const ALLOWED_RAG_EXTENSIONS = new Set(['.txt', '.json', '.csv', '.pdf', '.md']);

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_RAG_EXTENSIONS.has(ext)) {
            return cb(new Error('Invalid file type for RAG knowledge base. Only TXT, JSON, CSV, MD, and PDF files are allowed.'), false);
        }
        cb(null, true);
    }
});

// Admin endpoints
router.get('/stats', adminProtect, getRAGStats);
router.get('/documents', adminProtect, getRAGDocuments);
router.post('/upload', adminProtect, upload.single('file'), uploadDocument);
router.delete('/documents/:id', adminProtect, deleteDocument);
router.post('/rebuild', adminProtect, rebuildRAGIndex);

// User/Anonymous Q&A endpoint
router.post('/query', optionalProtect, queryRAGEngine);

module.exports = router;

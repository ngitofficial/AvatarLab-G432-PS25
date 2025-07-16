import express from 'express';
import multer from 'multer';
import path from 'path';
import { cloneVoice, animateAvatar, getHistory } from '../controllers/avatarController';
import { authMiddleware } from '../middleware/authMiddleware';
import { ensureUploadDir } from '../utils/fileUtils'; // Ensure the upload directory exists

const router = express.Router();

// Ensure the upload directory exists before any uploads
ensureUploadDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // Save to the 'uploads' folder in the root
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'voice') {
      // Accept audio files
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for voice'));
      }
    } else if (file.fieldname === 'image') {
      // Accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for avatar'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  },
});

// @route   POST /api/avatar/clone
// @desc    Clone voice and generate TTS
// @access  Private
router.post('/clone', authMiddleware, upload.single('voice'), cloneVoice);

// @route   POST /api/avatar/animate
// @desc    Animate avatar with audio
// @access  Private
router.post('/animate', authMiddleware, upload.single('image'), animateAvatar);

// @route   GET /api/avatar/history
// @desc    Get user's avatar generation history
// @access  Private
router.get('/history', authMiddleware, getHistory);

export default router;
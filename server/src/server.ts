import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import avatarRoutes from './routes/avatarRoutes';
import heygenRoutes from './routes/heygenRoutes'; // ✅ make sure this is here!
import { ensureUploadDir } from './utils/fileUtils';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
ensureUploadDir();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NEW: Import the AI Avatar routes
import aiAvatarRoutes from './routes/aiAvatarRoutes';



// --- Directory Setup (Crucial for correct paths across services) ---
// Get the base directory of the entire project, assuming server.ts is in src/
const BASE_PROJECT_DIR = path.join(__dirname, '..', '..');

// Ensure necessary directories exist.
// This example assumes 'uploads', 'final_videos', 'temp_audio_outputs' are at the project root level.
// Your `ensureUploadDir` function should be able to create these if they don't exist.
ensureUploadDir(path.join(BASE_PROJECT_DIR, 'uploads'));           // For Express-handled uploads
ensureUploadDir(path.join(BASE_PROJECT_DIR, 'final_videos'));      // For FastAPI's final video outputs
ensureUploadDir(path.join(BASE_PROJECT_DIR, 'temp_audio_outputs'));// For FastAPI's temporary audio outputs

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies

// --- Static File Serving ---
// These routes allow the frontend to access generated files (audio, video) via the Express server.
// The `video_url` and `audio_path` returned from FastAPI might still point to FastAPI's own static server
// (e.g., http://localhost:8000/videos/...). You can choose to either:
// 1. Let the frontend access them directly from FastAPI (current FastAPI `main.py` behavior).
// 2. Modify `aiAvatarController.ts` to transform FastAPI's URLs to point to Express's static routes.
//    For simplicity, we are keeping FastAPI's original URLs, but providing Express static routes as an option.
app.use('/uploads', express.static(path.join(BASE_PROJECT_DIR, 'uploads')));
app.use('/final_videos', express.static(path.join(BASE_PROJECT_DIR, 'final_videos')));
app.use('/temp_audio_outputs', express.static(path.join(BASE_PROJECT_DIR, 'temp_audio_outputs')));


// --- API Routes ---
app.use('/api/heygen', heygenRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/avatar', avatarRoutes); // Existing avatar routes

// NEW: Mount the AI Avatar generation routes
app.use('/api/ai-avatar', aiAvatarRoutes);





// Static files (for serving generated audio/video and uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ Add your HeyGen proxy routes
app.use('/api/heygen', heygenRoutes);

// ✅ Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/avatar', avatarRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-avatar-lab');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};
console.log("HEYGEN_API_KEY:", process.env.HEYGEN_API_KEY);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

startServer();

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  flaskApiUrl: string;
  serverUrl: string;
  jwtSecret: string;
  nodeEnv: string;
  upload: {
    maxFileSize: number;
    allowedImageTypes: string[];
    allowedAudioTypes: string[];
  };
  cors: {
    origin: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/avatar_lab',
  flaskApiUrl: process.env.FLASK_API_URL || 'http://localhost:5001',
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development',
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    allowedAudioTypes: (process.env.ALLOWED_AUDIO_TYPES || 'audio/wav,audio/mp3,audio/mpeg').split(','),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};

// Validate required configuration
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'FLASK_API_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;

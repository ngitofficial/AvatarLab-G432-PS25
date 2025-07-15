import fs from 'fs';
import path from 'path';

export const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, '../../uploads'); // Path to the 'uploads' directory at project root
  if (!fs.existsSync(uploadDir)) {
    console.log(`Creating upload directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

export const cleanupFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export const getFileSize = (filePath: string): number => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};
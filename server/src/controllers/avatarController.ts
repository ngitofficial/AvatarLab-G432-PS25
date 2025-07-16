import { Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../middleware/authMiddleware';
import History from '../models/History';
import { cleanupFile } from '../utils/fileUtils'; // Import cleanup utility

export const cloneVoice = async (req: AuthRequest, res: Response): Promise<void> => {
  let voiceFilePath: string | undefined;
  try {
    const { text } = req.body;
    const voiceFile = req.file;

    if (!text || !voiceFile) {
      res.status(400).json({ message: 'Text and voice file are required' });
      return;
    }

    voiceFilePath = voiceFile.path; // Store path for potential cleanup

    // Create form data for Flask API
    const formData = new FormData();
    formData.append('text', text);
    formData.append('voice', fs.createReadStream(voiceFile.path), {
      filename: voiceFile.originalname,
      contentType: voiceFile.mimetype,
    });

    const flaskApiUrl = process.env.FLASK_API_URL;
    if (!flaskApiUrl) {
      throw new Error('FLASK_API_URL is not defined in environment variables.');
    }

    // Send to Flask model server
    const flaskResponse = await axios.post(
      `${flaskApiUrl}/tts`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync() // Important for some APIs with FormData
        },
        responseType: 'arraybuffer', // Get raw binary data
      }
    );

    // Save generated audio
    const audioFileName = `audio_${Date.now()}.wav`;
    const audioPath = path.join(__dirname, '../../uploads', audioFileName);
    fs.writeFileSync(audioPath, Buffer.from(flaskResponse.data)); // Write Buffer to file

    // Save to history
    const history = new History({
      userId: req.user!._id,
      text,
      voiceFile: voiceFile.filename,
      imageFile: '', // Will be updated later, empty string is fine for now
      audioOutput: audioFileName,
      status: 'processing',
    });
    await history.save();

    res.json({
      success: true,
      audioUrl: `/uploads/${audioFileName}`,
      historyId: history._id,
    });
  } catch (error) {
    console.error('Voice cloning error:', error);
    res.status(500).json({ message: 'Voice cloning failed', error: error.message || 'Unknown error' });
  } finally {
    // Clean up the uploaded voice file after processing
    if (voiceFilePath) {
      cleanupFile(voiceFilePath);
    }
  }
};

export const animateAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  let imageFilePath: string | undefined;
  let audioOutputPath: string | undefined;

  try {
    const { historyId } = req.body;
    const imageFile = req.file;

    if (!historyId || !imageFile) {
      res.status(400).json({ message: 'History ID and image file are required' });
      return;
    }

    imageFilePath = imageFile.path; // Store path for potential cleanup

    // Find history record
    const history = await History.findById(historyId);
    if (!history || history.userId.toString() !== req.user!._id.toString()) {
      res.status(404).json({ message: 'History not found or unauthorized' });
      return;
    }

    if (!history.audioOutput) {
      res.status(400).json({ message: 'Audio output not found for this history entry.' });
      return;
    }

    audioOutputPath = path.join(__dirname, '../../uploads', history.audioOutput);

    // Update history with image file
    history.imageFile = imageFile.filename;
    await history.save();

    // Create form data for Flask API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imageFile.path), {
      filename: imageFile.originalname,
      contentType: imageFile.mimetype,
    });
    formData.append('audio', fs.createReadStream(audioOutputPath), {
      filename: history.audioOutput,
      contentType: 'audio/wav', // Assuming it's a WAV file
    });

    const flaskApiUrl = process.env.FLASK_API_URL;
    if (!flaskApiUrl) {
      throw new Error('FLASK_API_URL is not defined in environment variables.');
    }

    // Send to Flask model server
    const flaskResponse = await axios.post(
      `${flaskApiUrl}/animate`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        },
        responseType: 'arraybuffer', // Get raw binary data
      }
    );

    // Save generated video
    const videoFileName = `video_${Date.now()}.mp4`;
    const videoPath = path.join(__dirname, '../../uploads', videoFileName);
    fs.writeFileSync(videoPath, Buffer.from(flaskResponse.data));

    // Update history
    history.videoOutput = videoFileName;
    history.status = 'completed';
    await history.save();

    res.json({
      success: true,
      videoUrl: `/uploads/${videoFileName}`,
      historyId: history._id,
    });
  } catch (error) {
    console.error('Avatar animation error:', error);
    res.status(500).json({ message: 'Avatar animation failed', error: error.message || 'Unknown error' });
  } finally {
    // Clean up uploaded image file and generated audio file after processing
    if (imageFilePath) {
      cleanupFile(imageFilePath);
    }
    // Decide whether to keep audio file or delete. For history, often kept.
    // If you want to delete the audio file after animation, uncomment:
    // if (audioOutputPath) {
    //   cleanupFile(audioOutputPath);
    // }
  }
};

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10); // Limit to last 10 entries for example

    // Format output paths for client
    const formattedHistory = history.map(item => ({
      ...item.toObject(), // Convert mongoose document to plain object
      voiceFile: item.voiceFile ? `/uploads/${item.voiceFile}` : undefined,
      imageFile: item.imageFile ? `/uploads/${item.imageFile}` : undefined,
      audioOutput: item.audioOutput ? `/uploads/${item.audioOutput}` : undefined,
      videoOutput: item.videoOutput ? `/uploads/${item.videoOutput}` : undefined,
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to get history', error: error.message || 'Unknown error' });
  }
};
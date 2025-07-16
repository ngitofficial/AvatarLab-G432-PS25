// your_project/src/routes/aiAvatarRoutes.ts
import express from 'express';
import axios from 'axios';
import { synthesizeVoice, generateAvatarVideo, serveTempAudio } from '../controllers/aiAvatarController';
import multer from 'multer';
import FormData from 'form-data';
import { Blob } from 'buffer'; // Keep this import
import { authMiddleware } from '../middleware/authMiddleware'; // Adjust path if needed

const router = express.Router();
const upload = multer();

// Get the base URL for your FastAPI 'main.py' service.
// This should come from your .env or be set correctly.
// Let's assume FASTAPI_MAIN_URL is defined in your environment (e.g., http://127.0.0.1:8000)
const FASTAPI_MAIN_URL = process.env.FASTAPI_MAIN_URL || 'http://127.0.0.1:8000'; // Make sure this is correctly set

router.post(
    '/synthesize-voice',
    authMiddleware,
    upload.fields([
        { name: 'speaker_wav', maxCount: 1 }
    ]),
    synthesizeVoice
);

router.post('/generate-avatar-video', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'synthesized_audio_path', maxCount: 1 } // Keep this, it's the path from StyleTTS2
]), async (req, res) => {
    try {
        const imageFile = req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })['image'] ? (req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0] : null;
        const synthesizedAudioPath = req.body.synthesized_audio_path; // This is the path from FastAPI's StyleTTS2 response

        if (!imageFile) {
            return res.status(400).json({ message: "Image file is required for video generation." });
        }
        if (!synthesizedAudioPath) {
            return res.status(400).json({ message: "Synthesized audio path is required for video generation." });
        }
        console.log('Express: Image file and audio path received. Forwarding to main FastAPI.'); // Updated log

        const mainFastapiFormData = new FormData();

        // 1. **Correct Field Name:** `main.py` expects 'image', not 'image_file'
        mainFastapiFormData.append('image', imageFile.buffer, {
            filename: imageFile.originalname,
            contentType: imageFile.mimetype,
        });

        // 2. **Correct Field Name and Value:** `main.py` expects 'synthesized_audio_path' as a string Form field
        mainFastapiFormData.append('synthesized_audio_path', synthesizedAudioPath);

        // Make the request to your **main FastAPI service**, not SadTalker directly
        const response = await axios.post(`${FASTAPI_MAIN_URL}/generate_avatar_video/`, mainFastapiFormData, {
            headers: {
                ...mainFastapiFormData.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 2400000, // Increased timeout for video generation (e.g., 10 minutes + margin)
        });

        // Forward the response from main FastAPI (which should now contain the video URL) to the frontend
        res.status(response.status).json(response.data);

    } catch (error: any) {
        console.error('Error in generate-avatar-video route:', error);
        let errorMessage = 'Avatar video generation failed: An unknown error occurred.';
        if (axios.isAxiosError(error) && error.response) {
            console.error('FastAPI error response:', error.response.data);
            errorMessage = `FastAPI error during avatar video generation: ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        } else if (error instanceof Error) {
            errorMessage = `Avatar video generation failed: ${error.message}`;
        }
        res.status(500).json({ message: errorMessage });
    }
});

router.get(
    '/temp-audio-playback',
    serveTempAudio
);

export default router;
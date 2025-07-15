// your_project/src/controllers/aiAvatarController.ts
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import fs from 'fs';

// Get the base URL for your FastAPI 'main.py' service from environment variables.
// Ensure this matches where your main.py is actually running (e.g., http://127.0.0.1:8000).
const FASTAPI_MAIN_URL = process.env.FASTAPI_MAIN_URL || 'http://127.0.0.1:8000';
import GeneratedContent from '../models/History'; // Adjust path as needed

// Optional: Import your Mongoose UserHistory model if you have one
// import UserHistory from '../models/userHistoryModel'; // Adjust path if needed

/**
 * Helper function to construct FormData for forwarding files and fields.
 * Multer stores file buffers, so we'll use those.
 */
const createFormDataForFastAPI = (fields: { [key: string]: any }, files?: { [fieldname: string]: Express.Multer.File[] }) => {
    const formData = new FormData();

    // Append standard form fields (like 'text' or 'synthesized_audio_path')
    for (const key in fields) {
        formData.append(key, fields[key]);
    }

    // Append files from Multer's output (buffers)
    if (files) {
        for (const fieldname in files) {
            const fileArray = files[fieldname];
            if (fileArray && fileArray.length > 0) {
                const file = fileArray[0]; // Assuming maxCount is 1 for our use case
                formData.append(fieldname, file.buffer, {
                    filename: file.originalname,
                    contentType: file.mimetype,
                });
            }
        }
    }
    return formData;
};

/**
 * Proxies voice synthesis request to FastAPI's /synthesize_voice endpoint.
 */
export const synthesizeVoice = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Express: Received /api/ai-avatar/synthesize-voice request.");
    try {
        const text: string = req.body.text;
        const speakerWavFile = req.files ? (req.files as { [fieldname: string]: Express.Multer.File[] })['speaker_wav']?.[0] : undefined;

        if (!text || !speakerWavFile) {
            return res.status(400).json({ message: 'Missing text or speaker_wav file.' });
        }

        const formData = createFormDataForFastAPI(
            { text },
            { speaker_wav: [speakerWavFile] }
        );

        console.log(`Express: Forwarding voice synthesis request to FastAPI at ${FASTAPI_MAIN_URL}/synthesize_voice/`);
        const fastapiResponse = await axios.post(`${FASTAPI_MAIN_URL}/synthesize_voice/`, formData, {
            headers: {
                ...formData.getHeaders(),
                // IMPORTANT: Multer handles content-type for files, formData.getHeaders() adds 'Content-Type: multipart/form-data'
                // Axios will automatically set Content-Length from formData stream
            },
            timeout: 300000, // 5 minutes timeout for StyleTTS2 synthesis
            responseType: 'json', // Expecting JSON response ({"audio_path": "..."})
        });

        // The FastAPI /synthesize_voice endpoint returns a JSON with `audio_path`.
        const audioPathFromFastAPI = fastapiResponse.data.audio_path;
    console.log(`Express: Received audio_path from FastAPI: ${audioPathFromFastAPI}`);

    // --- History Saving for Voice Synthesis ---
    // IMPORTANT: Ensure your authentication middleware populates `req.user` with `_id`
    if ((req as any).user && (req as any).user._id) {
        try {
            await GeneratedContent.create({
                userId: (req as any).user._id, // Assign the user's MongoDB ObjectId
                type: 'voice_synthesis',
                details: {
                    textInput: text,
                    generatedAudioPath: audioPathFromFastAPI, // Path on FastAPI server
                    speakerFilename: speakerWavFile.originalname
                }
            });
            console.log("Express: Voice synthesis history saved successfully.");
        } catch (dbError) {
            console.error("Express: Failed to save voice synthesis history:", dbError);
            // Log the DB error but don't prevent the response to the client
        }
    } else {
        console.warn("Express: No user ID found in request for history saving. Is authentication middleware active?");
    }
        return res.json({ audio_path: audioPathFromFastAPI });

    } catch (error: any) {
        console.error('Express: Error proxying synthesize_voice to FastAPI:', error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error('FastAPI response data:', error.response.data);
            console.error('FastAPI response status:', error.response.status);
            // Forward FastAPI's error details to the frontend
            return res.status(error.response.status).json({
                message: `FastAPI error during voice synthesis: ${error.response.data.detail || error.response.statusText || error.message}`,
                fastapi_error_detail: error.response.data.detail || error.response.data // Include more detail if available
            });
        } else if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: `FastAPI main service is unavailable at ${FASTAPI_MAIN_URL}. Please ensure it is running.` });
        } else if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({ message: 'Request to FastAPI main service timed out during voice synthesis.' });
        }
        res.status(500).json({ message: `Internal server error during voice synthesis: ${error.message}` });
    }
};

/**
 * Proxies avatar video generation request to FastAPI's /generate_avatar_video endpoint.
 */
export const generateAvatarVideo = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Express: Received /api/ai-avatar/generate-avatar-video request.");
    try {
        const synthesizedAudioPath: string = req.body.synthesized_audio_path; // This is the path string received from the frontend after voice synthesis
        const imageFile = req.files ? (req.files as { [fieldname: string]: Express.Multer.File[] })['image']?.[0] : undefined;
        const refEyeblinkFile = req.files ? (req.files as { [fieldname: string]: Express.Multer.File[] })['ref_eyeblink']?.[0] : undefined;

        if (!synthesizedAudioPath || !imageFile) {
            return res.status(400).json({ message: 'Missing audio path or image file.' });
        }

        // The FastAPI `generate_avatar_video` endpoint expects `synthesized_audio_path` as a Form field
        // and the audio file itself is then opened from that path on the FastAPI server's side.
        // So, we just forward the *path string* here.
        // This relies on the FastAPI 'main.py' being able to access the same `temp_audio_outputs` directory.
        const formData = createFormDataForFastAPI(
            { synthesized_audio_path: synthesizedAudioPath },
            {
                image: [imageFile],
                ...(refEyeblinkFile && { ref_eyeblink: [refEyeblinkFile] }) // Conditionally add ref_eyeblink file
            }
        );

        console.log(`Express: Forwarding video generation request to FastAPI at ${FASTAPI_MAIN_URL}/generate_avatar_video/`);
        const fastapiResponse = await axios.post(`${FASTAPI_MAIN_URL}/generate_avatar_video/`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 600000, // 10 minutes timeout for video generation (can be long!)
            responseType: 'json', // Expecting JSON response ({"video_url": "..."})
        });

        const videoUrlFromFastAPI = fastapiResponse.data.video_url;
    console.log(`Express: Received video_url from FastAPI: ${videoUrlFromFastAPI}`);

    // --- History Saving for Avatar Video Generation ---
    if ((req as any).user && (req as any).user._id) {
        try {
            await GeneratedContent.create({
                userId: (req as any).user._id,
                type: 'avatar_generation',
                details: {
                    sourceImageFilename: imageFile.originalname,
                    generatedAudioPath: synthesizedAudioPath, // Path on FastAPI server
                    generatedVideoUrl: videoUrlFromFastAPI,
                    refEyeblinkFilename: refEyeblinkFile ? refEyeblinkFile.originalname : 'none'
                }
            });
            console.log("Express: Avatar generation history saved successfully.");
        } catch (dbError) {
            console.error("Express: Failed to save avatar generation history:", dbError);
        }
    } else {
        console.warn("Express: No user ID found in request for history saving. Is authentication middleware active?");
    }
    // ------------------------------------------------------------------------------------

        // ------------------------------------------------------------------------------------

        return res.json({ video_url: videoUrlFromFastAPI });

    } catch (error: any) {
        console.error('Express: Error proxying generate_avatar_video to FastAPI:', error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error('FastAPI response data:', error.response.data);
            console.error('FastAPI response status:', error.response.status);
            return res.status(error.response.status).json({
                message: `FastAPI error during avatar video generation: ${error.response.data.detail || error.response.statusText || error.message}`,
                fastapi_error_detail: error.response.data.detail || error.response.data
            });
        } else if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: `FastAPI main service is unavailable at ${FASTAPI_MAIN_URL}. Please ensure it is running.` });
        } else if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({ message: 'Request to FastAPI main service timed out during avatar video generation.' });
        }
        res.status(500).json({ message: `Internal server error during avatar video generation: ${error.message}` });
    }
};
export const serveTempAudio = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Express: Received /api/ai-avatar/temp-audio-playback request.");
    const audioFilePath = req.query.path as string; // This is 'temp_audio_outputs/...' from frontend

    if (!audioFilePath) {
        return res.status(400).json({ message: 'Missing audio file path parameter.' });
    }

    try {
        // Construct the full URL to FastAPI's temp_audio_playback endpoint
        const fastapiAudioUrl = `${FASTAPI_MAIN_URL}/temp_audio_playback?path=${encodeURIComponent(audioFilePath)}`;
        
        console.log(`Express: Proxying audio playback request to FastAPI at: ${fastapiAudioUrl}`);

        const fastapiResponse = await axios.get(fastapiAudioUrl, {
            responseType: 'stream', // Crucial for handling file streams
            timeout: 60000 // 1 minute timeout for serving the audio file
        });

        // Set appropriate headers for audio playback
        res.set(fastapiResponse.headers); // Forward all headers from FastAPI (especially Content-Type)
        fastapiResponse.data.pipe(res); // Pipe the stream directly to the client response

        console.log(`Express: Successfully proxied audio stream from FastAPI for: ${audioFilePath}`);

    } catch (error: any) {
        console.error('Express: Error proxying temp_audio_playback to FastAPI:', error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error('FastAPI response data:', error.response.data);
            console.error('FastAPI response status:', error.response.status);
            return res.status(error.response.status).json({
                message: `FastAPI error serving audio file: ${error.response.data.detail || error.response.statusText || error.message}`,
                fastapi_error_detail: error.response.data.detail || error.response.data
            });
        } else if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: `FastAPI main service is unavailable at ${FASTAPI_MAIN_URL}. Please ensure it is running.` });
        } else if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({ message: 'Request to FastAPI main service timed out while serving audio file.' });
        }
        res.status(500).json({ message: `Internal server error while serving audio file: ${error.message}` });
    }
};


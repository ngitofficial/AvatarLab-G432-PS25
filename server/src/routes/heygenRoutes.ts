// src/routes/heygenRoutes.ts

import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
// Base URL for V2 endpoints (like video.generate)
const BASE_URL_V2 = "https://api.heygen.com/v2";
// Base URL for V1 video_status.get endpoint
const BASE_URL_V1 = "https://api.heygen.com/v1";


// ✅ Get all Avatars (Assuming these are V2 endpoints, if not, adjust BASE_URL_V2)
router.get("/avatars", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BASE_URL_V2}/avatars`, {
      headers: {
        "X-Api-Key": HEYGEN_API_KEY!,
        Accept: "application/json",
      },
    });
    // This depends on what your /v2/avatars endpoint actually returns.
    // Based on previous discussions, you adjusted the frontend for `data.avatars || []`
    // If your backend for this returns `response.data.data.avatars`, keep it this way.
    return res.json(response.data.data.avatars);
  } catch (error: any) {
    console.error("Failed to fetch avatars:", error?.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ message: "Failed to fetch avatars." });
  }
});

// ✅ Get all Voices (Assuming these are V2 endpoints)
router.get("/voices", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BASE_URL_V2}/voices`, {
      headers: {
        "X-Api-Key": HEYGEN_API_KEY!,
        Accept: "application/json",
      },
    });
    return res.json({ voices: response.data.data.voices });
  } catch (error: any) {
    console.error("Failed to fetch voices:", error?.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ message: "Failed to fetch voices." });
  }
});

// ✅ Generate a Video using selected voice, avatar & script (V2 endpoint)
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { avatar_id, voice_id, script } = req.body;

    if (!avatar_id || !voice_id || !script) {
      return res.status(400).json({ message: "Missing avatar_id, voice_id, or script." });
    }

    const payload = {
      dimension: {
        width: 1280,
        height: 720,
      },
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: avatar_id,
          },
          voice: {
            type: "text",
            voice_id: voice_id,
            input_text: script,
          },
          background: {
            type: "color",
            value: "#F6F6FC"
          }
        },
      ],
      // title: "Generated Video by My App", // Optional title
    };

    const heygenResponse = await axios.post(`${BASE_URL_V2}/video/generate`, payload, {
      headers: {
        "X-Api-Key": HEYGEN_API_KEY!,
        "Content-Type": "application/json",
      },
    });

    const videoId = heygenResponse.data?.data?.video_id;

    console.log("HeyGen API Raw Response Data (Generate):", heygenResponse.data);

    if (!videoId) {
        console.error("HeyGen API did not return a valid video_id in data.data.video_id:", heygenResponse.data);
        return res.status(500).json({ message: "Failed to get video ID from HeyGen API response." });
    }

    return res.json({ video_id: videoId });

  } catch (error: any) {
    console.error("Error during video generation request to HeyGen:", error?.response?.data || error.message);
    if (error.response && error.response.data) {
        return res.status(error.response.status).json(error.response.data);
    } else {
        return res.status(500).json({ message: "Failed to generate video due to an unexpected server error." });
    }
  }
});

// NEW ROUTE: To get video status and URL (CRITICAL FIXES HERE)
router.get("/video-status/:videoId", async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        // --- Use the V1 endpoint and query parameter ---
        const response = await axios.get(`${BASE_URL_V1}/video_status.get`, {
            headers: {
                "X-Api-Key": HEYGEN_API_KEY!,
                Accept: "application/json",
            },
            params: { // Use 'params' for query parameters in Axios
                video_id: videoId,
            }
        });

        // --- Access data directly under response.data (as per V1 doc) ---
        const heygenVideoStatus = response.data.data; // The doc says `data` wraps it.
        // Let's console log the actual response here to be sure:
        if (heygenVideoStatus && heygenVideoStatus.status !== 'completed' && heygenVideoStatus.status !== 'failed') {
             console.log("HeyGen API Raw Response Data (Status):", response.data);
        } else if (heygenVideoStatus && (heygenVideoStatus.status === 'completed' || heygenVideoStatus.status === 'failed')) {
             console.log("HeyGen API Raw Response Data (Final Status):", response.data);
        }



        // HeyGen's successful response for status includes "code: 100", "message: Success"
        // and then the actual video details under `data`
        if (!heygenVideoStatus) {
            console.error("No video status data returned for ID:", videoId, response.data);
            return res.status(404).json({ message: "Video status data not found or invalid response from HeyGen." });
        }

        // Now access the properties directly from heygenVideoStatus
        if (heygenVideoStatus.status === 'completed') {
            return res.json({ video_url: heygenVideoStatus.video_url, status: heygenVideoStatus.status });
        } else {
            return res.json({ status: heygenVideoStatus.status });
        }

    } catch (error: any) {
        console.error("Error fetching video status from HeyGen:", error?.response?.data || error.message);
        if (error.response && error.response.data) {
            // Pass HeyGen's specific error details to the frontend
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ message: "Failed to fetch video status due to an unexpected error." });
        }
    }
});

export default router;
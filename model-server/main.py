# # your_project/main.py
# from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
# from fastapi.responses import FileResponse, JSONResponse
# from fastapi.staticfiles import StaticFiles
# from fastapi.middleware.cors import CORSMiddleware # Import CORS
# import os
# import uuid
# import requests
# from datetime import datetime
# from contextlib import asynccontextmanager
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv()

# # Directories for main application's outputs and temporary files
# TEMP_UPLOAD_DIR = "uploads_main" # For any temp files needed by main.py itself
# FINAL_OUTPUT_DIR = "final_videos" # This will store the final video for static serving
# TEMP_AUDIO_OUTPUT_DIR = "temp_audio_outputs" # To store synthesized audio before sending to SadTalker

# os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
# os.makedirs(FINAL_OUTPUT_DIR, exist_ok=True)
# os.makedirs(TEMP_AUDIO_OUTPUT_DIR, exist_ok=True)


# # Lifespan context manager for startup and shutdown events (if needed for main.py)
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("Main FastAPI application starting up...")
#     yield
#     print("Main FastAPI application shutting down...")

# app = FastAPI(lifespan=lifespan)

# # --- CORS Middleware Configuration ---
# # Add CORS middleware to allow your frontend (e.g., React on localhost:5173) to access your API
# origins = [
#     "http://localhost",
#     "http://localhost:3000", # Common for React dev server
#     "http://localhost:5173", # Common for Vite dev server (as seen in your error)
#     # Add other frontend origins if you deploy it elsewhere
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"], # Allow all HTTP methods (GET, POST, etc.)
#     allow_headers=["*"], # Allow all headers
# )
# # --- End CORS Configuration ---


# # Serve the final_videos folder as static files at /videos URL path
# app.mount("/videos", StaticFiles(directory=FINAL_OUTPUT_DIR), name="final_videos")

# # API URLs for StyleTTS2 and SadTalker services
# STYLETTS_API_URL = os.environ.get("STYLETTS_SERVICE_URL", "http://127.0.0.1:8001/synthesize_styletts/")
# SADTALKER_API_URL = os.environ.get("SADTALKER_SERVICE_URL", "http://127.0.0.1:8002/generate_sadtalker/")


# # Function to clean up temporary files
# def cleanup_temp_file(filepath: str):
#     if os.path.exists(filepath):
#         try:
#             os.remove(filepath)
#             print(f"Cleaned up temporary file: {filepath}")
#         except Exception as e:
#             print(f"Error cleaning up file {filepath}: {e}")

# @app.post("/synthesize_voice/")
# async def synthesize_voice(
#     text: str = Form(...),
#     speaker_wav: UploadFile = File(...),
#     background_tasks: BackgroundTasks = None
# ):
#     print("===> Main: Received request for voice synthesis")
#     timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
#     unique_id = uuid.uuid4().hex[:8]

#     try:
#         # Step 1: Call StyleTTS2 for voice synthesis
#         print("===> Main: Sending input to StyleTTS2 API")

#         speaker_wav_content = await speaker_wav.read()

#         tts_files = {
#             "speaker_wav": (speaker_wav.filename, speaker_wav_content, speaker_wav.content_type)
#         }
#         tts_data = {
#             "text": text
#         }

#         tts_response = requests.post(STYLETTS_API_URL, files=tts_files, data=tts_data)

#         if tts_response.status_code != 200:
#             print(f"!!! Main: StyleTTS2 synthesis failed: {tts_response.text}")
#             raise HTTPException(status_code=500, detail=f"StyleTTS2 synthesis failed: {tts_response.text}")

#         print("===> Main: Received synthesized audio from StyleTTS2")
#         synthesized_audio_filename = f"{timestamp}_{unique_id}_styletts_synthesized.wav"
#         temp_audio_path = os.path.join(TEMP_AUDIO_OUTPUT_DIR, synthesized_audio_filename)
#         with open(temp_audio_path, "wb") as f:
#             f.write(tts_response.content)
#         print(f"===> Main: Synthesized audio saved temporarily to {temp_audio_path}")

#         # Return the path to the temporary audio file
#         return JSONResponse(content={"audio_path": temp_audio_path})

#     except requests.exceptions.ConnectionError as e:
#         print(f"!!! Main: Connection to StyleTTS2 service failed: {e}")
#         raise HTTPException(status_code=503, detail=f"StyleTTS2 service is unavailable. Please ensure it is running at {STYLETTS_API_URL.split('/synthesize_styletts/')[0]}")
#     except Exception as e:
#         print(f"!!! Main: Error during voice synthesis: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {str(e)}")


# @app.post("/generate_avatar_video/")
# async def generate_avatar_video(
#     image: UploadFile = File(...),
#     synthesized_audio_path: str = Form(...), # Path to the temporary audio file
#     ref_eyeblink: UploadFile = File(None), # Optional
#     background_tasks: BackgroundTasks = None
# ):
#     print("===> Main: Received request for avatar video generation")
#     timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
#     unique_id = uuid.uuid4().hex[:8]

#     if not os.path.exists(synthesized_audio_path):
#         raise HTTPException(status_code=400, detail="Synthesized audio file not found. Please synthesize voice first.")

#     try:
#         # Step 2: Call SadTalker for video generation
#         print("===> Main: Sending audio and image to SadTalker")

#         image_content = await image.read()

#         # SadTalker expects 'driven_audio' and 'image' as files, and optional 'ref_eyeblink'
#         sad_files = {
#             "driven_audio": (os.path.basename(synthesized_audio_path), open(synthesized_audio_path, "rb"), "audio/wav"),
#             "image": (image.filename, image_content, image.content_type)
#         }

#         # Add optional reference files if provided
#         if ref_eyeblink:
#             eyeblink_content = await ref_eyeblink.read()
#             sad_files["ref_eyeblink"] = (ref_eyeblink.filename, eyeblink_content, ref_eyeblink.content_type)

#         sad_response = requests.post(SADTALKER_API_URL, files=sad_files)

#         # IMPORTANT: Close the temporary audio file handle after sending the request
#         # This prevents resource leaks and allows the file to be deleted later.
#         sad_files["driven_audio"][1].close()
#         # Schedule cleanup of the temporary audio file
#         background_tasks.add_task(cleanup_temp_file, synthesized_audio_path)


#         if sad_response.status_code != 200:
#             print(f"!!! Main: SADTalker video generation failed: {sad_response.text}")
#             raise HTTPException(status_code=500, detail=f"SADTalker video generation failed: {sad_response.text}")

#         print("===> Main: Received video from SADTalker")
#         final_video_filename = f"{timestamp}_{unique_id}_generated.mp4"
#         final_video_path = os.path.join(FINAL_OUTPUT_DIR, final_video_filename)
#         with open(final_video_path, "wb") as f:
#             f.write(sad_response.content)
#         print(f"===> Main: Generated video saved to {final_video_path}")

#         # Construct URL for the frontend
#         video_url = f"http://localhost:8000/videos/{final_video_filename}"
#         print(f"===> Main: Returning video URL to client: {video_url}")

#         return {"video_url": video_url}

#     except requests.exceptions.ConnectionError as e:
#         print(f"!!! Main: Connection to SadTalker service failed: {e}")
#         # Schedule cleanup for the audio file if SadTalker connection fails
#         background_tasks.add_task(cleanup_temp_file, synthesized_audio_path)
#         raise HTTPException(status_code=503, detail=f"SadTalker service is unavailable. Please ensure it is running at {SADTALKER_API_URL.split('/generate_sadtalker/')[0]}")
#     except Exception as e:
#         print(f"!!! Main: Error during avatar video generation: {str(e)}")
#         # Schedule cleanup for the audio file on general error
#         background_tasks.add_task(cleanup_temp_file, synthesized_audio_path)
#         raise HTTPException(status_code=500, detail=f"Avatar video generation failed: {str(e)}")
    
# your_project/main.py
# your_project/main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import requests
from datetime import datetime
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

TEMP_UPLOAD_DIR = "uploads_main"
FINAL_OUTPUT_DIR = "final_videos"
TEMP_AUDIO_OUTPUT_DIR = "temp_audio_outputs"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

os.makedirs(os.path.join(BASE_DIR, TEMP_UPLOAD_DIR), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, FINAL_OUTPUT_DIR), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, TEMP_AUDIO_OUTPUT_DIR), exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Main FastAPI application starting up...")
    yield
    print("Main FastAPI application shutting down...")

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/videos", StaticFiles(directory=os.path.join(BASE_DIR, FINAL_OUTPUT_DIR)), name="final_videos")

# Serve temporary audio files for playback (used by SadTalker internally)
# This endpoint is correct as is, it serves the files that main.py saved from StyleTTS2
@app.get("/temp_audio_playback")
async def temp_audio_playback(path: str):
    full_local_path = os.path.abspath(os.path.join(BASE_DIR, path))
    
    logger.info(f"Serving temporary audio from: {full_local_path}")

    if not os.path.exists(full_local_path):
        logger.error(f"Audio file not found at {full_local_path}")
        raise HTTPException(status_code=404, detail="Audio file not found.")
    
    if not full_local_path.startswith(os.path.abspath(os.path.join(BASE_DIR, TEMP_AUDIO_OUTPUT_DIR))):
        logger.error(f"Attempted to access file outside temp_audio_outputs: {full_local_path}")
        raise HTTPException(status_code=403, detail="Access denied: File not in designated directory.")

    return FileResponse(full_local_path, media_type="audio/wav", filename=os.path.basename(full_local_path))


STYLETTS_API_URL = os.environ.get("STYLETTS_SERVICE_URL", "http://127.0.0.1:8001/synthesize_styletts/")
SADTALKER_API_URL = os.environ.get("SADTALKER_SERVICE_URL", "http://127.0.0.1:8002/generate_sadtalker/")

def cleanup_temp_file(filepath: str):
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
            logger.info(f"Cleaned up temporary file: {filepath}")
        except Exception as e:
            logger.error(f"Error cleaning up file {filepath}: {e}")

@app.post("/synthesize_voice/")
async def synthesize_voice(
    text: str = Form(...),
    speaker_wav: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    logger.info("Received request for voice synthesis")
    timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
    unique_id = uuid.uuid4().hex[:8]

    try:
        logger.info("Sending input to StyleTTS2 API")
        speaker_wav_content = await speaker_wav.read()

        tts_files = {
            "speaker_wav": (speaker_wav.filename, speaker_wav_content, speaker_wav.content_type)
        }
        tts_data = {
            "text": text
        }

        tts_response = requests.post(STYLETTS_API_URL, files=tts_files, data=tts_data, timeout=300)

        if tts_response.status_code == 200:
            logger.info("Received synthesized audio from StyleTTS2")
            
            synthesized_audio_filename = f"{timestamp}_{unique_id}_styletts_synthesized.wav"
            temp_audio_path = os.path.join(BASE_DIR, TEMP_AUDIO_OUTPUT_DIR, synthesized_audio_filename)
            
            with open(temp_audio_path, "wb") as f:
                f.write(tts_response.content)

            logger.info(f"Synthesized audio saved temporarily to {temp_audio_path}")

            temp_audio_path_for_url = os.path.relpath(temp_audio_path, BASE_DIR).replace(os.sep, "/")
            return JSONResponse(content={"audio_path": temp_audio_path_for_url})
        else:
            error_detail = "Unknown error from StyleTTS2 service."
            try:
                error_data = tts_response.json()
                error_detail = error_data.get("detail", error_detail)
            except ValueError:
                try:
                    error_detail = tts_response.content.decode('latin-1')
                except Exception:
                    error_detail = "Failed to decode StyleTTS2 error response (non-JSON, non-latin-1)."

            logger.error(f"StyleTTS2 synthesis failed with status {tts_response.status_code}: {error_detail}")
            raise HTTPException(status_code=tts_response.status_code, detail=f"StyleTTS2 synthesis failed: {error_detail}")

    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection to StyleTTS2 service failed: {e}")
        raise HTTPException(status_code=503, detail=f"StyleTTS2 service is unavailable. Please ensure it is running at {STYLETTS_API_URL.split('/synthesize_styletts/')[0]}. Error: {str(e)}")
    except requests.exceptions.Timeout:
        logger.error("StyleTTS2 request timed out.")
        raise HTTPException(status_code=504, detail="StyleTTS2 service did not respond in time.")
    except Exception as e:
        logger.error(f"General error during voice synthesis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {str(e)}")

@app.post("/generate_avatar_video/")
async def generate_avatar_video(
    image: UploadFile = File(...),
    synthesized_audio_path: str = Form(...), # This is the path on main.py's side (e.g., "temp_audio_outputs/audio.wav")
    ref_eyeblink: UploadFile = File(None), # Optional
    background_tasks: BackgroundTasks = None
):
    logger.info("Received request for avatar video generation")
    timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
    unique_id = uuid.uuid4().hex[:8]

    # Construct the absolute path to the locally saved audio file
    local_synthesized_audio_path = os.path.join(BASE_DIR, synthesized_audio_path.replace("/", os.sep))

    if not os.path.exists(local_synthesized_audio_path):
        logger.error(f"Synthesized audio file not found locally: {local_synthesized_audio_path}")
        raise HTTPException(status_code=400, detail="Synthesized audio file not found. Please synthesize voice first or check path.")

    try:
        logger.info("Sending audio and image to SadTalker service")

        image_content = await image.read()

        # Read the audio file content to send it as a file upload to SadTalker
        with open(local_synthesized_audio_path, "rb") as audio_file:
            audio_content = audio_file.read()
        
        # Prepare the form data for SadTalker
        # 'files' is for file uploads, 'data' is for form fields (strings)
        sad_files_for_upload = {
            # Send the image file
            "image_file": (image.filename, image_content, image.content_type),
            # Send the audio file content directly
            "synthesized_audio_file": (os.path.basename(local_synthesized_audio_path), audio_content, "audio/wav")
        }
        
        # No 'data' field needed for synthesized_audio_path anymore, as it's sent as a file
        sad_data_for_form = {} 

        # Add optional reference files if provided (still as file uploads)
        if ref_eyeblink:
            eyeblink_content = await ref_eyeblink.read()
            sad_files_for_upload["ref_eyeblink"] = (ref_eyeblink.filename, eyeblink_content, ref_eyeblink.content_type)

        # Make the request to SadTalker
        sad_response = requests.post(
            SADTALKER_API_URL, 
            files=sad_files_for_upload, 
            data=sad_data_for_form, # This will be empty now
            timeout=1800
        ) 

        # Schedule cleanup of the temporary audio file immediately after the request
        background_tasks.add_task(cleanup_temp_file, local_synthesized_audio_path)

        if sad_response.status_code == 200:
            logger.info("Received video from SADTalker successfully")
            logger.info(f"Size of received video content from SadTalker: {len(sad_response.content)} bytes")
            final_video_filename = f"{timestamp}_{unique_id}_generated.mp4"
            final_video_path = os.path.join(BASE_DIR, FINAL_OUTPUT_DIR, final_video_filename)
            with open(final_video_path, "wb") as f:
                f.write(sad_response.content)
            logger.info(f"Generated video saved to {final_video_path}")

            video_url = f"http://localhost:8000/videos/{final_video_filename}"
            logger.info(f"Returning video URL to client: {video_url}")
            return {"video_url": video_url}
        else:
            error_detail = "Unknown error from SadTalker service."
            try:
                error_data = sad_response.json()
                error_detail = error_data.get("detail", error_detail)
            except ValueError:
                try:
                    error_detail = sad_response.content.decode('utf-8', errors='replace')
                except Exception:
                    error_detail = "Failed to decode SadTalker error response (neither JSON nor UTF-8)."

            logger.error(f"SADTalker video generation failed with status {sad_response.status_code}: {error_detail}")
            raise HTTPException(status_code=sad_response.status_code, detail=f"SADTalker video generation failed: {error_detail}")

    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection to SadTalker service failed: {e}", exc_info=True)
        background_tasks.add_task(cleanup_temp_file, local_synthesized_audio_path)
        raise HTTPException(status_code=503, detail=f"SadTalker service is unavailable. Please ensure it is running at {SADTALKER_API_URL.split('/generate_sadtalker/')[0]}. Error: {str(e)}")
    except requests.exceptions.Timeout:
        logger.error("SadTalker request timed out.")
        background_tasks.add_task(cleanup_temp_file, local_synthesized_audio_path)
        raise HTTPException(status_code=504, detail="SadTalker service did not respond in time.")
    except Exception as e:
        logger.error(f"General error during avatar video generation: {str(e)}", exc_info=True)
        background_tasks.add_task(cleanup_temp_file, local_synthesized_audio_path)
        raise HTTPException(status_code=500, detail=f"Avatar video generation failed: {str(e)}")


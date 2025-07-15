# your_project/model-server/sadtalker_api.py

import os
import subprocess
import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import shutil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SADTALKER_NEW_DIR = "C:\\Users\\mhrus\\Avatar_lab\\model-server\\sadtalker-new"
TEMP_UPLOAD_DIR = "C:\\Users\\mhrus\\Avatar_lab\\model-server\\temp_uploads"
# SadTalker will now receive audio as an upload, so it will save it to TEMP_UPLOAD_DIR
# and then use that path. No need for a separate TEMP_AUDIO_OUTPUTS_DIR for SadTalker's input.
SADTALKER_OUTPUTS_DIR = "C:\\Users\\mhrus\\Avatar_lab\\model-server\\outputs_sadtalker"

os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
os.makedirs(SADTALKER_OUTPUTS_DIR, exist_ok=True)

@app.post("/generate_sadtalker/")
async def generate_sadtalker_video(
    image_file: UploadFile = File(...),
    synthesized_audio_file: UploadFile = File(...), # <--- CHANGE: Expect audio as a File
    ref_eyeblink: UploadFile = File(None) # Optional ref_eyeblink
):
    logger.info(f"Received request for SadTalker video generation.")
    logger.info(f"Synthesized Audio Filename received: {synthesized_audio_file.filename}")

    # 1. Save the uploaded image temporarily
    image_path = os.path.join(TEMP_UPLOAD_DIR, image_file.filename)
    try:
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)
        logger.info(f"Image saved temporarily to: {image_path}")
    except Exception as e:
        logger.error(f"Failed to save image file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save image file: {e}")

    # 2. Save the uploaded audio file temporarily
    audio_path = os.path.join(TEMP_UPLOAD_DIR, synthesized_audio_file.filename)
    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(synthesized_audio_file.file, buffer)
        logger.info(f"Audio saved temporarily to: {audio_path}")
    except Exception as e:
        logger.error(f"Failed to save audio file: {e}")
        # Clean up image if audio saving fails
        if os.path.exists(image_path):
            os.remove(image_path)
        raise HTTPException(status_code=500, detail=f"Failed to save audio file: {e}")

    # 3. Handle optional ref_eyeblink file
    ref_eyeblink_path = None
    if ref_eyeblink:
        ref_eyeblink_path = os.path.join(TEMP_UPLOAD_DIR, ref_eyeblink.filename)
        try:
            with open(ref_eyeblink_path, "wb") as buffer:
                shutil.copyfileobj(ref_eyeblink.file, buffer)
            logger.info(f"Ref eyeblink image saved temporarily to: {ref_eyeblink_path}")
        except Exception as e:
            logger.error(f"Failed to save ref eyeblink file: {e}")
            # Clean up image and audio if ref eyeblink saving fails
            if os.path.exists(image_path): os.remove(image_path)
            if os.path.exists(audio_path): os.remove(audio_path)
            raise HTTPException(status_code=500, detail=f"Failed to save ref eyeblink file: {e}")

    python_executable = os.path.join("C:", os.sep, "Users", "mhrus", "Avatar_lab", "model-server", "venv_sadtalker", "Scripts", "python.exe")
    inference_script = os.path.join(SADTALKER_NEW_DIR, "inference.py")

    output_dir = SADTALKER_OUTPUTS_DIR
    os.makedirs(output_dir, exist_ok=True)
    # Use original filenames for base to avoid issues with unique IDs
    video_filename_base = os.path.splitext(image_file.filename)[0] + "_" + os.path.splitext(synthesized_audio_file.filename)[0]
    result_dir = os.path.join(output_dir, video_filename_base)

    sadtalker_command = [
        python_executable,
        inference_script,
        "--driven_audio", audio_path, # <--- Use the path to the saved audio file
        "--source_image", image_path,
        "--result_dir", result_dir,
        "--still",
    ]
    
    if ref_eyeblink_path:
        sadtalker_command.extend(["--ref_eyeblink", ref_eyeblink_path])
        # SadTalker's inference.py expects --ref_eyeblink and --ref_pose as separate arguments
        # If you were using --ref_pose, you'd add it similarly.
        # For now, assuming only --ref_eyeblink is relevant if provided.

    logger.info(f"Running SadTalker command: {' '.join(sadtalker_command)}")

    try:
        process = subprocess.Popen(
            sadtalker_command,
            cwd=SADTALKER_NEW_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        all_output_lines = []
        for line in process.stdout:
            logger.info(f"SadTalker Output: {line.strip()}")
            all_output_lines.append(line.strip())

        process.wait()

        if process.returncode != 0:
            error_message = f"SadTalker process exited with non-zero status {process.returncode}. Full output:\n{' '.join(all_output_lines)}"
            logger.error(error_message)
            raise HTTPException(status_code=500, detail=f"SADTalker video generation failed: {error_message}")

        final_video_path = None
        for line in reversed(all_output_lines):
            if line.startswith("The generated video is named:"):
                path_from_log = line.split("The generated video is named:")[1].strip()
                final_video_path = os.path.normpath(path_from_log)
                break

        if not final_video_path or not os.path.exists(final_video_path):
            logger.error(f"Could not find or verify final MP4 video path from SadTalker output.")
            logger.error(f"Attempted path: {final_video_path}")
            logger.error(f"Full SadTalker output for debugging:\n{' '.join(all_output_lines)}")
            raise HTTPException(status_code=500, detail="SADTalker did not produce a verifiable MP4 video at the expected path.")

        logger.info(f"SadTalker video generated successfully at: {final_video_path}")

        # Clean up temporary files
        try:
            os.remove(image_path)
            logger.info(f"Cleaned up temporary image file: {image_path}")
            os.remove(audio_path) # Clean up the uploaded audio file
            logger.info(f"Cleaned up temporary audio file: {audio_path}")
            if ref_eyeblink_path and os.path.exists(ref_eyeblink_path):
                os.remove(ref_eyeblink_path)
                logger.info(f"Cleaned up temporary ref eyeblink file: {ref_eyeblink_path}")
        except OSError as e:
            logger.warning(f"Could not remove temporary file: {e}")

        return FileResponse(
            path=final_video_path,
            media_type="video/mp4",
            filename=os.path.basename(final_video_path)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during SadTalker generation: {e}", exc_info=True)
        # Ensure temporary files are cleaned up even on unexpected errors
        if os.path.exists(image_path): os.remove(image_path)
        if os.path.exists(audio_path): os.remove(audio_path)
        if ref_eyeblink_path and os.path.exists(ref_eyeblink_path): os.remove(ref_eyeblink_path)
        raise HTTPException(status_code=500, detail=f"Error during SadTalker generation: {e}")


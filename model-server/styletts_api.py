# your_project/styletts_api.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from datetime import datetime
import torch # Keep torch import for StyleTTS2 internal use
import torchaudio # Keep torchaudio import for StyleTTS2 internal use
# your_project/styletts_api.py
# ... other imports ...
import nltk
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Ensure NLTK data is downloaded for StyleTTS2
try:
    nltk.data.find('tokenizers/punkt')
except LookupError: # Change this to LookupError
    print("Downloading NLTK 'punkt' package...")
    nltk.download('punkt')
    print("NLTK 'punkt' package downloaded.")

try:
    nltk.data.find('tokenizers/punkt_tab') # Try finding punkt_tab
except LookupError: # Change this to LookupError
    print("Downloading NLTK 'punkt_tab' package...")
    nltk.download('punkt_tab') # Download if not found
    print("NLTK 'punkt_tab' package downloaded.")
# The second 'except LookupError' was redundant and now removed to avoid confusion.
# The primary catch should be for when find() fails.

# Add the cloned StyleTTS2 directory to Python path
# ... rest of your styletts_api.py code ...

# Add the cloned StyleTTS2 directory to Python path
# This allows direct import of 'styletts2' module
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STYLETTS2_CLONE_PATH = os.path.join(BASE_DIR, "StyleTTS2")

# Critical: Ensure the StyleTTS2 clone path is in sys.path BEFORE importing styletts2
if STYLETTS2_CLONE_PATH not in sys.path:
    sys.path.insert(0, STYLETTS2_CLONE_PATH) # Use insert(0) to give it high priority

try:
    from styletts2 import tts
    print(f"Successfully imported StyleTTS2 from {STYLETTS2_CLONE_PATH}")
except ImportError as e:
    print(f"FATAL ERROR: Could not import StyleTTS2. Make sure it's cloned at {STYLETTS2_CLONE_PATH} and installed correctly (pip install -e {STYLETTS2_CLONE_PATH}).")
    print(f"Check your Python environment and the output of 'pip freeze' for styletts2.")
    print(f"Current sys.path: {sys.path}")
    raise RuntimeError(f"Failed to import StyleTTS2: {e}")

# Directories for uploads and outputs specific to this service
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads_styletts")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs_styletts")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI()

# Paths to StyleTTS2 model checkpoints relative to StyleTTS2_CLONE_PATH
# StyleTTS2 usually downloads these to its own 'checkpoints' folder.
# You can override with environment variables if you have custom paths.
# Example: STYLETTS2_CHECKPOINT="./StyleTTS2/checkpoints/epochs_2nd_00020.pth"
# Use os.path.join correctly to construct paths
STYLETTS2_MODEL_DEFAULT_REL_PATH = os.path.join("checkpoints", "epochs_2nd_00020.pth") # Common default
STYLETTS2_CONFIG_DEFAULT_REL_PATH = "config.yml" # Often in the root of the cloned repo

# Environment variables take precedence, otherwise construct from default relative paths
MODEL_CHECKPOINT_PATH = os.environ.get("STYLETTS2_CHECKPOINT", os.path.join(STYLETTS2_CLONE_PATH, STYLETTS2_MODEL_DEFAULT_REL_PATH))
CONFIG_PATH = os.environ.get("STYLETTS2_CONFIG", os.path.join(STYLETTS2_CLONE_PATH, STYLETTS2_CONFIG_DEFAULT_REL_PATH))

@app.on_event("startup")
async def startup_event():
    print("Loading StyleTTS2 model...")
    print(f"Attempting to load StyleTTS2 from:")
    print(f"  Model Checkpoint: {MODEL_CHECKPOINT_PATH}")
    print(f"  Config Path: {CONFIG_PATH}")

    # Verify paths before loading
    final_model_path = MODEL_CHECKPOINT_PATH if os.path.exists(MODEL_CHECKPOINT_PATH) else None
    final_config_path = CONFIG_PATH if os.path.exists(CONFIG_PATH) else None

    if not final_model_path:
        print(f"WARNING: StyleTTS2 model checkpoint not found at {MODEL_CHECKPOINT_PATH}. StyleTTS2 will attempt to download it.")
    if not final_config_path:
        print(f"WARNING: StyleTTS2 config file not found at {CONFIG_PATH}. StyleTTS2 will attempt to download it.")

    try:
        # If paths are None, StyleTTS2's constructor should handle downloading defaults
        app.state.styletts = tts.StyleTTS2(
            model_checkpoint_path=final_model_path,
            config_path=final_config_path
        )
        print("StyleTTS2 model loaded successfully.")
    except Exception as e:
        print(f"Error loading StyleTTS2 model during startup: {e}")
        print("This might be due to missing model files, incorrect paths, or environment issues.")
        raise RuntimeError(f"Failed to load StyleTTS2 model: {e}")

@app.post("/synthesize_styletts/")
async def synthesize_speech_styletts(
    text: str = Form(...),
    speaker_wav: UploadFile = File(...),
):
    try:
        if not hasattr(app.state, 'styletts') or app.state.styletts is None:
            raise HTTPException(status_code=503, detail="StyleTTS2 model not loaded. Please wait or check server logs.")

        timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
        speaker_filename = f"{timestamp}_{uuid.uuid4().hex}_{speaker_wav.filename}"
        speaker_path = os.path.join(UPLOAD_DIR, speaker_filename)
        with open(speaker_path, "wb") as f:
            f.write(await speaker_wav.read())
        print(f"===> StyleTTS2: Speaker audio saved to {speaker_path}")

        output_filename = f"{timestamp}_synthesized_styletts.wav"
        out_file = os.path.join(OUTPUT_DIR, output_filename)

        print(f"===> StyleTTS2: Synthesizing text: '{text}' using speaker: {speaker_path}")
        app.state.styletts.inference(
            text=text,
            target_voice_path=speaker_path,
            output_wav_file=out_file
        )
        print(f"===> StyleTTS2: Synthesized audio saved to {out_file}")

        os.remove(speaker_path) # Clean up uploaded speaker file

        return FileResponse(out_file, media_type="audio/wav", filename=os.path.basename(out_file))

    except Exception as e:
        print(f"!!! StyleTTS2 Error during synthesis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"StyleTTS2 synthesis failed: {str(e)}")
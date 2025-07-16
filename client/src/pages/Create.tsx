// // your_project/frontend/src/pages/CreatePage.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Mic, Image as ImageIcon, Play, Upload, Download, Pause } from 'lucide-react';
// import { Navbar } from '../components/Navbar';

// export const CreatePage: React.FC = () => {
//   const [text, setText] = useState('');
//   const [voiceFile, setVoiceFile] = useState<File | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [synthesizedAudioPath, setSynthesizedAudioPath] = useState<string | null>(null);
//   const [synthesizedAudioPlaybackUrl, setSynthesizedAudioPlaybackUrl] = useState<string | null>(null);
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [isPlayingUploadedAudio, setIsPlayingUploadedAudio] = useState(false);
//   const [isPlayingSynthesizedAudio, setIsPlayingSynthesizedAudio] = useState(false);
//   const [agreed, setAgreed] = useState(false);
//   const uploadedAudioRef = useRef<HTMLAudioElement | null>(null);
//   const synthesizedAudioRef = useRef<HTMLAudioElement | null>(null);

//   const API_BASE_URL = "http://localhost:5000"; // Your Express backend URL

//   // Helper function to get the JWT token from localStorage
//   const getAuthToken = () => {
//     // Assuming you store your token under 'token' or 'jwtToken'
//     return localStorage.getItem('token');
//   };

//   const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setVoiceFile(file);
//       const url = URL.createObjectURL(file);
//       setAudioUrl(url);
//     }
//   };

//   const toggleUploadedAudioPlay = () => {
//     if (uploadedAudioRef.current) {
//       if (isPlayingUploadedAudio) {
//         uploadedAudioRef.current.pause();
//       } else {
//         uploadedAudioRef.current.play();
//       }
//       setIsPlayingUploadedAudio(!isPlayingUploadedAudio);
//     }
//   };

//   const handleUploadedAudioEnded = () => {
//     setIsPlayingUploadedAudio(false);
//   };

//   const toggleSynthesizedAudioPlay = () => {
//     if (synthesizedAudioRef.current) {
//       if (isPlayingSynthesizedAudio) {
//         synthesizedAudioRef.current.pause();
//       } else {
//         synthesizedAudioRef.current.play();
//       }
//       setIsPlayingSynthesizedAudio(!isPlayingSynthesizedAudio);
//     }
//   };

//   const handleSynthesizedAudioEnded = () => {
//     setIsPlayingSynthesizedAudio(false);
//   };

//   // --- Step 1: Synthesize Voice ---
//   const handleVoiceSynthesis = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!text || !voiceFile) {
//       alert("Please provide text and a voice sample.");
//       return;
//     }

//     setLoading(true);
//     setSynthesizedAudioPath(null);
//     setSynthesizedAudioPlaybackUrl(null);

//     const formData = new FormData();
//     formData.append('text', text);
//     formData.append('speaker_wav', voiceFile);

//     // Get the authentication token
//     const token = getAuthToken();
//     if (!token) {
//       setLoading(false);
//       alert("Error: No token found. Please log in.");
//       // You might want to redirect to login page here
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/ai-avatar/synthesize-voice`, {
//         method: 'POST',
//         body: formData,
//         headers: {
//           // Add the Authorization header
//           'Authorization': `Bearer ${token}`
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         // Catch specific "No token" errors from backend for clearer user feedback
//         if (response.status === 401 && errorData.message === "No token, authorization denied") {
//             throw new Error("Authentication failed: Please log in again.");
//         }
//         throw new Error(errorData.message || errorData.detail || 'Failed to synthesize voice.');
//       }

//       const data = await response.json();
//       setSynthesizedAudioPath(data.audio_path);

//       // This URL will now correctly point to your Express backend, which then proxies to FastAPI
//       setSynthesizedAudioPlaybackUrl(`${API_BASE_URL}/api/ai-avatar/temp-audio-playback?path=${encodeURIComponent(data.audio_path)}`);

//       setStep(2);
//     } catch (error: any) {
//       console.error('Error synthesizing voice:', error);
//       alert(`Error synthesizing voice: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Step 2: Generate Avatar Video ---
//   const handleVideoGeneration = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!imageFile || !synthesizedAudioPath) {
//       alert("Please provide an avatar image and ensure voice is synthesized.");
//       return;
//     }

//     setLoading(true);
//     setVideoUrl(null);

//     const formData = new FormData();
//     formData.append('image', imageFile);
//     formData.append('synthesized_audio_path', synthesizedAudioPath);

//     // Get the authentication token for this request too
//     const token = getAuthToken();
//     if (!token) {
//       setLoading(false);
//       alert("Error: No token found. Please log in.");
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/ai-avatar/generate-avatar-video`, {
//         method: 'POST',
//         body: formData,
//         headers: {
//           // Add the Authorization header
//           'Authorization': `Bearer ${token}`
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         if (response.status === 401 && errorData.message === "No token, authorization denied") {
//             throw new Error("Authentication failed: Please log in again.");
//         }
//         throw new Error(errorData.message || errorData.detail || 'Failed to generate avatar video');
//       }

//       const data = await response.json();
//       setVideoUrl(data.video_url); // This video_url should be directly from FastAPI's static server or a CDN
//       setStep(3);
//     } catch (error: any) {
//       console.error('Error generating avatar video:', error);
//       alert(`Error generating avatar video: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetAll = () => {
//     setStep(1);
//     setText('');
//     setVoiceFile(null);
//     setImageFile(null);
//     setAudioUrl(null);
//     setSynthesizedAudioPath(null);
//     setSynthesizedAudioPlaybackUrl(null);
//     setVideoUrl(null);
//     setAgreed(false);
//     setIsPlayingUploadedAudio(false);
//     setIsPlayingSynthesizedAudio(false);
//     if (uploadedAudioRef.current) uploadedAudioRef.current.pause();
//     if (synthesizedAudioRef.current) synthesizedAudioRef.current.pause();
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <Navbar scrolled={true} />

//       <div className="container mx-auto px-6 pt-32 pb-16 max-w-4xl space-y-8">

//         {/* Step Bar */}
//         <div className="flex justify-between items-center mb-12 max-w-3xl mx-auto">
//           {[1, 2, 3].map((s, idx) => (
//             <React.Fragment key={s}>
//               <div className={`flex flex-col items-center`}>
//                 <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold
//                   ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}
//                 `}>
//                   {s}
//                 </div>
//                 <span className="mt-2 text-sm">{s === 1 ? 'Voice' : s === 2 ? 'Animation' : 'Result'}</span>
//               </div>
//               {idx < 2 && (
//                 <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`} />
//               )}
//             </React.Fragment>
//           ))}
//         </div>

//         {/* Step 1: Voice Input Form */}
//         {step === 1 && (
//           <form onSubmit={handleVoiceSynthesis} className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative">
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//               <Mic className="text-blue-400" />
//               Step 1: Provide Voice Input
//             </h2>

//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Text to Speak
//                 </label>
//                 <textarea
//                   value={text}
//                   onChange={(e) => setText(e.target.value)}
//                   className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 min-h-[120px]"
//                   placeholder="Enter the text you want your avatar to speak..."
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Voice Sample (for cloning)
//                 </label>
//                 <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
//                   <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                   <input
//                     type="file"
//                     accept="audio/*"
//                     onChange={handleVoiceUpload}
//                     className="hidden"
//                     id="voice-upload"
//                     required
//                   />
//                   <label
//                     htmlFor="voice-upload"
//                     className="cursor-pointer text-blue-400 hover:text-blue-300"
//                   >
//                     {voiceFile ? 'Change Voice File' : 'Click to upload voice sample (e.g., .wav, .mp3)'}
//                   </label>
//                 </div>
//               </div>

//               {voiceFile && (
//                 <div className="bg-black/40 rounded-xl p-4 flex items-center gap-4">
//                   <button
//                     type="button"
//                     onClick={toggleUploadedAudioPlay}
//                     className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
//                   >
//                     {isPlayingUploadedAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
//                   </button>
//                   <div className="flex-1">
//                     <p className="text-sm text-gray-300 truncate">{voiceFile.name}</p>
//                     <audio
//                       ref={uploadedAudioRef}
//                       src={audioUrl || ''}
//                       onEnded={handleUploadedAudioEnded}
//                       className="hidden"
//                     />
//                   </div>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={!text || !voiceFile || loading}
//                 className={`w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2
//                   ${!text || !voiceFile || loading
//                     ? 'bg-gray-700 cursor-not-allowed text-gray-400'
//                     : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
//                   }`}
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Synthesizing Voice...
//                   </>
//                 ) : (
//                   'Synthesize Voice & Go to Step 2'
//                 )}
//               </button>
//             </div>
//           </form>
//         )}

//         {/* Step 2: Image & Animation Input Form */}
//         {step === 2 && (
//           <form onSubmit={handleVideoGeneration} className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative">
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//               <ImageIcon className="text-blue-400" />
//               Step 2: Provide Avatar Image
//             </h2>

//             <div className="space-y-6">
//                 {/* Playback for Synthesized Audio */}
//                 {synthesizedAudioPlaybackUrl && (
//                     <div className="bg-black/40 rounded-xl p-4 flex items-center gap-4">
//                         <p className="text-sm text-gray-300">Synthesized Voice Preview:</p>
//                         <button
//                             type="button"
//                             onClick={toggleSynthesizedAudioPlay}
//                             className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
//                         >
//                             {isPlayingSynthesizedAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
//                         </button>
//                         <audio
//                             ref={synthesizedAudioRef}
//                             src={synthesizedAudioPlaybackUrl}
//                             onEnded={handleSynthesizedAudioEnded}
//                             className="hidden"
//                             preload="auto"
//                         />
//                     </div>
//                 )}

//               {/* Avatar Image Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Avatar Image
//                 </label>
//                 <div className="border-2 border-dashed border-gray-700 rounded-xl p-4">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0] || null;
//                       setImageFile(file);
//                     }}
//                     className="hidden"
//                     id="image-upload"
//                     required
//                   />
//                   <label
//                     htmlFor="image-upload"
//                     className="cursor-pointer flex flex-col items-center justify-center text-center text-blue-400 hover:text-blue-300"
//                   >
//                     <ImageIcon className="w-10 h-10 mb-2" />
//                     {imageFile ? 'Change Image' : 'Click to upload avatar image'}
//                   </label>

//                   {imageFile && (
//                     <div className="mt-4 rounded-lg overflow-hidden">
//                       <img
//                         src={URL.createObjectURL(imageFile)}
//                         alt="Avatar Preview"
//                         className="w-full max-h-[300px] object-contain rounded-lg border border-white/10"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={!imageFile || !synthesizedAudioPath || loading}
//                 className={`w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2
//                   ${!imageFile || !synthesizedAudioPath || loading
//                     ? 'bg-gray-700 cursor-not-allowed text-gray-400'
//                     : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
//                   }`}
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Generating Avatar Video...
//                   </>
//                 ) : (
//                   'Generate AI Avatar Video'
//                 )}
//               </button>
//             </div>
//           </form>
//         )}


//         {/* Step 3: Result */}
//         {step === 3 && (
//           <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative">
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//               <Play className="text-blue-400" />
//               Step 3: Your AI Avatar
//             </h2>

//             <div className="space-y-6">
//               <div className="bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-xl flex items-center gap-3">
//                 <Play size={20} />
//                 Your AI Avatar has been created successfully!
//               </div>

//               <div className="bg-black/40 p-6 rounded-xl">
//                 <div className="aspect-video bg-black/60 rounded-lg overflow-hidden mb-4">
//                   {videoUrl ? (
//                     <video
//                       src={videoUrl}
//                       controls
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center">
//                       <Play size={64} className="text-gray-600" />
//                     </div>
//                   )}
//                 </div>

//                 {/* Terms & Conditions Form */}
//                 <div className="bg-black/40 border border-white/10 p-4 rounded-xl mb-4">
//                   <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
//                   <div className="h-32 overflow-y-auto text-sm text-gray-300 bg-black/20 p-3 rounded-lg mb-3">
//                     <p>
//                       By using this AI avatar, you agree not to use it for any illegal, harmful,
//                       or unethical purposes. You must not impersonate others or create misleading
//                       or deepfake content that violates privacy, copyright, or applicable laws.
//                       Always ensure your usage complies with your local regulations.
//                     </p>
//                     <p className="mt-2">
//                       We are not responsible for misuse or damages resulting from inappropriate
//                       use of this tool. By continuing, you acknowledge these terms and accept full responsibility.
//                     </p>
//                   </div>
//                   <label className="flex items-center gap-2">
//                     <input
//                       id="terms"
//                       type="checkbox"
//                       checked={agreed}
//                       onChange={(e) => setAgreed(e.target.checked)}
//                       className="w-5 h-5 accent-blue-600"
//                     />
//                     <span>I have read and agree to the Terms & Conditions</span>
//                   </label>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   {videoUrl && (
//                     <>
//                       <a
//                         href={videoUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all duration-300"
//                       >
//                         <Play size={20} />
//                         Play Video
//                       </a>
//                       <a
//                         href={videoUrl}
//                         download="ai-avatar.mp4"
//                         className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300
//                           ${agreed ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
//                         `}
//                         onClick={(e) => {
//                           if (!agreed) e.preventDefault();
//                         }}
//                       >
//                         <Download size={20} />
//                         Download
//                       </a>
//                     </>
//                   )}
//                 </div>
//               </div>

//               <button
//                 onClick={resetAll}
//                 className={`w-full py-4 rounded-xl font-medium transition-all duration-300
//                   ${agreed
//                     ? 'bg-gray-700 hover:bg-gray-600 text-white'
//                     : 'bg-gray-800 text-gray-500 cursor-not-allowed'
//                   }`}
//                 disabled={!agreed}
//               >
//                 Create Another Avatar
//               </button>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// your_project/frontend/src/pages/CreatePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Image as ImageIcon, Play, Upload, Download, Pause } from 'lucide-react';
import { Navbar } from '../components/Navbar';
// Assuming you have access to react-router-dom for navigation
// import { useNavigate } from 'react-router-dom'; // You might need this if you implement the login choice

export const CreatePage: React.FC = () => {
  const [text, setText] = useState('');
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [synthesizedAudioPath, setSynthesizedAudioPath] = useState<string | null>(null);
  const [synthesizedAudioPlaybackUrl, setSynthesizedAudioPlaybackUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPlayingUploadedAudio, setIsPlayingUploadedAudio] = useState(false);
  const [isPlayingSynthesizedAudio, setIsPlayingSynthesizedAudio] = useState(false);
  // Removed isPlayingGeneratedVideo as we'll use native controls

  const [agreed, setAgreed] = useState(false);
  const uploadedAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthesizedAudioRef = useRef<HTMLAudioElement | null>(null);
  // Removed generatedVideoRef as we'll use native controls

  const API_BASE_URL = "http://localhost:5000"; // Your Express backend URL

  // Helper function to get the JWT token from localStorage
  const getAuthToken = () => {
    // Assuming you store your token under 'token' or 'jwtToken'
    return localStorage.getItem('token');
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoiceFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const toggleUploadedAudioPlay = () => {
    if (uploadedAudioRef.current) {
      if (isPlayingUploadedAudio) {
        uploadedAudioRef.current.pause();
      } else {
        uploadedAudioRef.current.play();
      }
      setIsPlayingUploadedAudio(!isPlayingUploadedAudio);
    }
  };

  const handleUploadedAudioEnded = () => {
    setIsPlayingUploadedAudio(false);
  };

  const toggleSynthesizedAudioPlay = () => {
    if (synthesizedAudioRef.current) {
      if (isPlayingSynthesizedAudio) {
        synthesizedAudioRef.current.pause();
      } else {
        synthesizedAudioRef.current.play();
      }
      setIsPlayingSynthesizedAudio(!isPlayingSynthesizedAudio);
    }
  };

  const handleSynthesizedAudioEnded = () => {
    setIsPlayingSynthesizedAudio(false);
  };

  // --- Step 1: Synthesize Voice ---
  const handleVoiceSynthesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !voiceFile) {
      alert("Please provide text and a voice sample.");
      return;
    }

    setLoading(true);
    setSynthesizedAudioPath(null);
    setSynthesizedAudioPlaybackUrl(null);

    const formData = new FormData();
    formData.append('text', text);
    formData.append('speaker_wav', voiceFile);

    // Get the authentication token
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      alert("Error: No token found. Please log in.");
      // You might want to redirect to login page here, e.g., navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-avatar/synthesize-voice`, {
        method: 'POST',
        body: formData,
        headers: {
          // Add the Authorization header
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Catch specific "No token" errors from backend for clearer user feedback
        if (response.status === 401 && errorData.message === "No token, authorization denied") {
            throw new Error("Authentication failed: Please log in again.");
        }
        throw new Error(errorData.message || errorData.detail || 'Failed to synthesize voice.');
      }

      const data = await response.json();
      setSynthesizedAudioPath(data.audio_path);

      // This URL will now correctly point to your Express backend, which then proxies to FastAPI
      setSynthesizedAudioPlaybackUrl(`${API_BASE_URL}/api/ai-avatar/temp-audio-playback?path=${encodeURIComponent(data.audio_path)}`);

      setStep(2);
    } catch (error: any) {
      console.error('Error synthesizing voice:', error);
      alert(`Error synthesizing voice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Generate Avatar Video ---
  const handleVideoGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !synthesizedAudioPath) {
      alert("Please provide an avatar image and ensure voice is synthesized.");
      return;
    }

    setLoading(true);
    setVideoUrl(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('synthesized_audio_path', synthesizedAudioPath);

    // Get the authentication token for this request too
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      alert("Error: No token found. Please log in.");
      // You might want to redirect to login page here
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-avatar/generate-avatar-video`, {
        method: 'POST',
        body: formData,
        headers: {
          // Add the Authorization header
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 && errorData.message === "No token, authorization denied") {
            throw new Error("Authentication failed: Please log in again.");
        }
        throw new Error(errorData.message || errorData.detail || 'Failed to generate avatar video');
      }

      const data = await response.json();
      setVideoUrl(data.video_url); // This video_url should be directly from FastAPI's static server or a CDN
      setStep(3);
    } catch (error: any) {
      console.error('Error generating avatar video:', error);
      alert(`Error generating avatar video: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setText('');
    setVoiceFile(null);
    setImageFile(null);
    setAudioUrl(null);
    setSynthesizedAudioPath(null);
    setSynthesizedAudioPlaybackUrl(null);
    setVideoUrl(null);
    setAgreed(false);
    setIsPlayingUploadedAudio(false);
    setIsPlayingSynthesizedAudio(false);
    if (uploadedAudioRef.current) uploadedAudioRef.current.pause();
    if (synthesizedAudioRef.current) synthesizedAudioRef.current.pause();
    // No need to pause generated video explicitly if using native controls as state won't track it
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar scrolled={true} />

      <div className="container mx-auto px-6 pt-32 pb-16 max-w-4xl space-y-8">

        {/* Step Bar */}
        <div className="flex justify-between items-center mb-12 max-w-3xl mx-auto">
          {[1, 2, 3].map((s, idx) => (
            <React.Fragment key={s}>
              <div className={`flex flex-col items-center`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold
                  ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}
                `}>
                  {s}
                </div>
                <span className="mt-2 text-sm">{s === 1 ? 'Voice' : s === 2 ? 'Animation' : 'Result'}</span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Voice Input Form */}
        {step === 1 && (
          <form onSubmit={handleVoiceSynthesis} className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Mic className="text-blue-400" />
              Step 1: Provide Voice Input
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text to Speak
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 min-h-[120px]"
                  placeholder="Enter the text you want your avatar to speak..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Voice Sample (for cloning)
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleVoiceUpload}
                    className="hidden"
                    id="voice-upload"
                    required
                  />
                  <label
                    htmlFor="voice-upload"
                    className="cursor-pointer text-blue-400 hover:text-blue-300"
                  >
                    {voiceFile ? 'Change Voice File' : 'Click to upload voice sample (e.g., .wav, .mp3)'}
                  </label>
                </div>
              </div>

              {voiceFile && (
                <div className="bg-black/40 rounded-xl p-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={toggleUploadedAudioPlay}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {isPlayingUploadedAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 truncate">{voiceFile.name}</p>
                    <audio
                      ref={uploadedAudioRef}
                      src={audioUrl || ''}
                      onEnded={handleUploadedAudioEnded}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!text || !voiceFile || loading}
                className={`w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2
                  ${!text || !voiceFile || loading
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Synthesizing Voice...
                  </>
                ) : (
                  'Synthesize Voice & Go to Step 2'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Image & Animation Input Form */}
        {step === 2 && (
          <form onSubmit={handleVideoGeneration} className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <ImageIcon className="text-blue-400" />
              Step 2: Provide Avatar Image
            </h2>

            <div className="space-y-6">
                {/* Playback for Synthesized Audio */}
                {synthesizedAudioPlaybackUrl && (
                    <div className="bg-black/40 rounded-xl p-4 flex items-center gap-4">
                      <p className="text-sm text-gray-300">Synthesized Voice Preview:</p>
                        <button
                            type="button"
                            onClick={toggleSynthesizedAudioPlay}
                            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            {isPlayingSynthesizedAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <audio
                            ref={synthesizedAudioRef}
                            src={synthesizedAudioPlaybackUrl}
                            onEnded={handleSynthesizedAudioEnded}
                            className="hidden"
                            preload="auto"
                        />
                    </div>
                )}

              {/* Avatar Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Avatar Image
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                    }}
                    className="hidden"
                    id="image-upload"
                    required
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center text-center text-blue-400 hover:text-blue-300"
                  >
                    <ImageIcon className="w-10 h-10 mb-2" />
                    {imageFile ? 'Change Image' : 'Click to upload avatar image'}
                  </label>

                  {imageFile && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Avatar Preview"
                        className="w-full max-h-[300px] object-contain rounded-lg border border-white/10"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!imageFile || !synthesizedAudioPath || loading}
                className={`w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2
                  ${!imageFile || !synthesizedAudioPath || loading
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Avatar Video...
                  </>
                ) : (
                  'Generate AI Avatar Video'
                )}
              </button>
            </div>
          </form>
        )}


        {/* Step 3: Result */}
        {step === 3 && (
          <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 relative">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Play className="text-blue-400" />
              Step 3: Your AI Avatar
            </h2>

            <div className="space-y-6">
              <div className="bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-xl flex items-center gap-3">
                <Play size={20} />
                Your AI Avatar has been created successfully!
              </div>

              <div className="bg-black/40 p-6 rounded-xl">
                <div className="aspect-video bg-black/60 rounded-lg overflow-hidden mb-4">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls // This enables native browser video controls (play, pause, volume, fullscreen)
                      className="w-full h-full object-contain rounded-lg border border-white/10"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play size={64} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Terms & Conditions Form */}
                <div className="bg-black/40 border border-white/10 p-4 rounded-xl mb-4">
                  <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
                  <div className="h-32 overflow-y-auto text-sm text-gray-300 bg-black/20 p-3 rounded-lg mb-3">
                    <p>
                      By using this AI avatar, you agree not to use it for any illegal, harmful,
                      or unethical purposes. You must not impersonate others or create misleading
                      or deepfake content that violates privacy, copyright, or applicable laws.
                      Always ensure your usage complies with your local regulations.
                    </p>
                    <p className="mt-2">
                      We are not responsible for misuse or damages resulting from inappropriate
                      use of this tool. By continuing, you acknowledge these terms and accept full responsibility.
                    </p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <span>I have read and agree to the Terms & Conditions</span>
                  </label>
                </div>

                {/* Buttons: Download and Create Another Avatar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Changed to sm:grid-cols-2 */}
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      download="ai-avatar.mp4"
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300
                        ${agreed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                      `}
                      onClick={(e) => {
                        if (!agreed) e.preventDefault();
                      }}
                    >
                      <Download size={20} />
                      Download Video
                    </a>
                  )}

                  <button
                    onClick={resetAll}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300
                      ${agreed
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    disabled={!agreed}
                  >
                    Create Another Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useEffect, useState, useRef } from "react";
import { Mic, User, Play, Download, Pause } from 'lucide-react';
import { Navbar } from '../components/Navbar';

type Voice = {
  voice_id: string;
  name: string;
  preview_audio: string;
  gender?: string;
};

type Avatar = {
  avatar_id: string;
  avatar_name: string;
  preview_image_url?: string | null;
  gender?: string;
};

const Loader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-4 p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-300 font-medium">{message}</p>
  </div>
);

const HeygenPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    setVoicesLoading(true);
    fetch("http://localhost:5000/api/heygen/voices")
      .then((res) => res.json())
      .then((data) => {
        const allVoices = data.voices || [];
        const maleVoices = allVoices.filter((v: any) => v.gender?.toLowerCase() === 'male').slice(0, 5);
        const femaleVoices = allVoices.filter((v: any) => v.gender?.toLowerCase() === 'female').slice(0, 5);
        setVoices([...maleVoices, ...femaleVoices]);
      })
      .finally(() => setVoicesLoading(false));

    setAvatarsLoading(true);
    fetch("http://localhost:5000/api/heygen/avatars")
      .then((res) => res.json())
      .then((data) => {
        const allAvatars = data || [];

        const pickUniqueFrontAvatars = (gender: string) => {
          const genderAvatars = allAvatars.filter((a: any) => a.gender?.toLowerCase() === gender);
          const map = new Map<string, any>();

          for (const avatar of genderAvatars) {
            const name = avatar.avatar_name.toLowerCase();
            const isFront = name.includes("front");
            const baseName = name.split(" ")[0];
            if (isFront && !map.has(baseName)) {
              map.set(baseName, avatar);
            }
          }

          return Array.from(map.values()).slice(0, 5);
        };

        const male = pickUniqueFrontAvatars("male");
        const female = pickUniqueFrontAvatars("female");
        setAvatars([...male, ...female]);
      })
      .finally(() => setAvatarsLoading(false));

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleVoicePlay = (voiceId: string, audioUrl: string) => {
    const currentAudio = audioRefs.current.get(voiceId);

    if (playingVoice === voiceId && currentAudio) {
      currentAudio.pause();
      setPlayingVoice(null);
    } else {
      if (playingVoice && audioRefs.current.get(playingVoice)) {
        audioRefs.current.get(playingVoice)!.pause();
      }

      let audio = audioRefs.current.get(voiceId);
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.onended = () => setPlayingVoice(null);
        audioRefs.current.set(voiceId, audio);
      }

      audio.play();
      setPlayingVoice(voiceId);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    setGenerationStatus("Processing video... This may take a few moments.");
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/heygen/video-status/${videoId}`);
        const data = await res.json();

        if (data.status === 'completed') {
          setVideoUrl(data.video_url);
          setGenerationStatus("Video generated successfully!");
          setLoading(false);
          setStep(3);
          clearInterval(intervalRef.current!);
        } else if (data.status === 'failed') {
          setGenerationStatus("Video generation failed. Please try again.");
          setLoading(false);
          clearInterval(intervalRef.current!);
        } else {
          setGenerationStatus(`Status: ${data.status}`);
        }
      } catch (err: any) {
        setGenerationStatus("Error checking video status.");
        setLoading(false);
        clearInterval(intervalRef.current!);
      }
    }, 15000);
  };

  const handleGenerate = async () => {
    if (!selectedVoice || !selectedAvatar || !prompt) {
      alert("Missing required fields.");
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setGenerationStatus("Generating video...");

    try {
      const res = await fetch("http://localhost:5000/api/heygen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_id: selectedVoice.voice_id,
          avatar_id: selectedAvatar.avatar_id,
          script: prompt,
        }),
      });

      const data = await res.json();
      const videoId = data.video_id;
      if (videoId) {
        pollVideoStatus(videoId);
      } else {
        throw new Error("No video ID returned.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationStatus("Error generating video.");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedVoice(null);
    setSelectedAvatar(null);
    setPrompt("");
    setVideoUrl(null);
    setGenerationStatus(null);
    setStep(1);
    audioRefs.current.forEach((audio) => audio.pause());
    setPlayingVoice(null);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-[64px]">
      <Navbar scrolled={true} />
      <div className="container mx-auto px-6 pt-8 pb-16 max-w-6xl space-y-8">
        {/* Step Bar */}
        <div className="flex justify-between items-center mb-12 max-w-3xl mx-auto">
          {[1, 2, 3].map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold
                  ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {s}
                </div>
                <span className="mt-2 text-sm">
                  {s === 1 ? 'Select' : s === 2 ? 'Script' : 'Result'}
                </span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Selection */}
        {step === 1 && (
          <>
            {/* Voice Selection */}
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Mic className="text-blue-400" />
                Choose a Voice
              </h2>
              {voicesLoading ? <Loader message="Loading voices..." /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {voices.map((voice) => (
                    <div
                      key={voice.voice_id}
                      onClick={() => setSelectedVoice(voice)}
                      className={`bg-black/40 border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedVoice?.voice_id === voice.voice_id
                          ? "border-blue-500 shadow-lg shadow-blue-500/25"
                          : "border-white/10 hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold truncate">{voice.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          {voice.gender}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVoicePlay(voice.voice_id, voice.preview_audio);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-2 flex items-center justify-center gap-2"
                      >
                        {playingVoice === voice.voice_id ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar Selection */}
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <User className="text-blue-400" />
                Choose an Avatar
              </h2>
              {avatarsLoading ? <Loader message="Loading avatars..." /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.avatar_id}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`bg-black/40 border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedAvatar?.avatar_id === avatar.avatar_id
                          ? "border-blue-500 shadow-lg shadow-blue-500/25"
                          : "border-white/10 hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold truncate">{avatar.avatar_name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          {avatar.gender}
                        </span>
                      </div>
                      <div className="aspect-square bg-black/60 rounded-lg overflow-hidden">
                        {avatar.preview_image_url ? (
                          <img src={avatar.preview_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (!selectedVoice || !selectedAvatar) {
                  alert("Please select both a voice and an avatar.");
                  return;
                }
                setStep(2);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl"
            >
              Continue to Script
            </button>
          </>
        )}

        {/* Step 2: Script Input */}
        {step === 2 && (
          <>
          {(step === 2 || step === 3) && selectedVoice && selectedAvatar && (
  <div className="flex items-center gap-6 mb-8 bg-gray-900/50 border border-white/10 p-4 rounded-xl">
    {/* Avatar Image */}
    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
      {selectedAvatar.preview_image_url ? (
        <img
          src={selectedAvatar.preview_image_url}
          alt={selectedAvatar.avatar_name}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className="text-gray-400 w-12 h-12" />
      )}
    </div>

    {/* Info */}
    <div>
      <h3 className="text-lg font-semibold">{selectedAvatar.avatar_name}</h3>
      <p className="text-gray-400 text-sm mb-2">Voice: {selectedVoice.name}</p>
      <p className="text-gray-500 text-xs">Gender: {selectedAvatar.gender || 'Unknown'}</p>
    </div>
  </div>
)}

            <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Your Script</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What should your avatar say?"
                rows={4}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white resize-none min-h-[120px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full sm:w-1/2 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl"
              >
                Back to Selection
              </button>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl"
              >
                {loading ? "Generating..." : "Generate Video"}
              </button>
            </div>

            {loading && <Loader message={generationStatus || "Generating video..."} />}
            {!loading && generationStatus && (
              <div className="text-gray-400 text-center">{generationStatus}</div>
            )}
          </>
        )}

        {/* Step 3: Video Result */}
        {step === 3 && videoUrl && (
          <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10">
            {(step === 2 || step === 3) && selectedVoice && selectedAvatar && (
  <div className="flex items-center gap-6 mb-8 bg-gray-900/50 border border-white/10 p-4 rounded-xl">
    {/* Avatar Image */}
    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
      {selectedAvatar.preview_image_url ? (
        <img
          src={selectedAvatar.preview_image_url}
          alt={selectedAvatar.avatar_name}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className="text-gray-400 w-12 h-12" />
      )}
    </div>

      {/* Info */}
      <div>
        <h3 className="text-lg font-semibold">{selectedAvatar.avatar_name}</h3>
        <p className="text-gray-400 text-sm mb-2">Voice: {selectedVoice.name}</p>
        <p className="text-gray-500 text-xs">Gender: {selectedAvatar.gender || 'Unknown'}</p>
      </div>
    </div>
  )}

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Play className="text-blue-400" />
              Your AI Avatar Video
            </h2>

            <video src={videoUrl} controls className="w-full rounded-xl mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={videoUrl}
                download="ai-avatar.mp4"
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-center"
              >
                <Download size={20} className="inline-block mr-2" />
                Download Video
              </a>

              <button
                onClick={resetForm}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeygenPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface IGeneratedDetails {
    textInput?: string;
    speakerFilename?: string;
    generatedAudioPath?: string;
    sourceImageFilename?: string;
    refEyeblinkFilename?: string;
    generatedVideoUrl?: string;
}

interface IGeneratedContent {
    _id: string;
    userId: string;
    type: 'voice_synthesis' | 'avatar_generation';
    timestamp: string;
    details: IGeneratedDetails;
}

interface HistoryDisplayProps {
    API_BASE_URL: string;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ API_BASE_URL }) => {
    const [history, setHistory] = useState<IGeneratedContent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/api/ai-avatar/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("Fetched history:", response.data);

        if (Array.isArray(response.data)) {
            setHistory(response.data);
        } else {
            console.error("Unexpected response:", response.data);
            setError("Server response was not a valid history array.");
        }
    } catch (err: any) {
        console.error('Error fetching history:', err);
        setError(err.response?.data?.message || 'Failed to fetch history.');
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="p-4 max-w-4xl mx-auto bg-gray-800 text-white rounded-lg shadow-lg my-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-purple-400">Your Generation History</h2>
            <button
                onClick={fetchHistory}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out mb-6"
            >
                Refresh History
            </button>

            {loading && <p className="text-center text-gray-400">Loading history...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}

            {!loading && !error && history.length === 0 && (
                <p className="text-center text-gray-400">No history found. Start generating!</p>
            )}

            <div className="space-y-6">
                {history.map((item) => (
                    <div key={item._id} className="bg-gray-700 p-4 rounded-md shadow-md border border-gray-600">
                        <p className="text-lg font-semibold text-blue-300 mb-2">Type: {item.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-400 mb-3">Generated on: {new Date(item.timestamp).toLocaleString()}</p>

                        {item.type === 'voice_synthesis' && (
                            <div className="space-y-2">
                                <p><strong>Text Input:</strong> {item.details.textInput}</p>
                                <p><strong>Speaker File:</strong> {item.details.speakerFilename}</p>
                                {item.details.generatedAudioPath && (
                                    <div>
                                        <p><strong>Generated Audio:</strong></p>
                                        <audio controls className="w-full mt-2 rounded-md">
                                            <source src={`${API_BASE_URL}/temp_audio_playback?path=${encodeURIComponent(item.details.generatedAudioPath)}`} type="audio/wav" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                            </div>
                        )}

                        {item.type === 'avatar_generation' && (
                            <div className="space-y-2">
                                <p><strong>Source Image:</strong> {item.details.sourceImageFilename}</p>
                                <p><strong>Audio Path Used:</strong> {item.details.generatedAudioPath}</p>
                                {item.details.refEyeblinkFilename && (
                                    <p><strong>Ref Eyeblink:</strong> {item.details.refEyeblinkFilename}</p>
                                )}
                                {item.details.generatedVideoUrl && (
                                    <div>
                                        <p><strong>Generated Video:</strong></p>
                                        <video controls className="w-full mt-2 rounded-md border border-gray-500" poster="https://placehold.co/600x400/333333/FFFFFF?text=Loading+Video">
                                            <source src={item.details.generatedVideoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryDisplay;

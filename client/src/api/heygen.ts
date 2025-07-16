import axios from "axios";

// ✅ This should match your backend route
const API_URL = "http://localhost:5000/api/heygen";

export const getVoices = async () => {
  const res = await axios.get(`${API_URL}/voices`);
  return res.data.voices; // matches your backend response: { voices: [...] }
};

export const getAvatars = async () => {
  const res = await axios.get(`${API_URL}/avatars`);
  return res.data.avatars;
};

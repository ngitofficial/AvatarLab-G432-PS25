/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// frontend/src/api/index.ts
import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust port if yours is different

export const api = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user; // Return the user data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('API Login Error:', error.response?.data || error.message);
      // Re-throw the error so your AuthContext can catch it and handle UI error messages
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user; // Return the user data
    } catch (error: any) {
      console.error('API Register Error:', error.response?.data || error.message);
      // Re-throw the error for AuthContext
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Keep these as actual API calls if they will be handled by your model server
  cloneVoice: async (text: string, voiceFile: File) => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('voice', voiceFile);

    try {
      // Assuming your model server is on port 5001 as per your app.py
      const response = await axios.post('http://localhost:5001/tts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Expecting an audio blob
      });
      // You might return a blob URL or just the blob itself depending on how you handle it
      return URL.createObjectURL(response.data); // Example: create a blob URL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('API Clone Voice Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Voice cloning failed');
    }
  },

  animateAvatar: async (imageFile: File, audioUrl: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    // If audioUrl is a blob URL, you might need to fetch the blob first
    // For simplicity, let's assume audioUrl is a path/filename if your backend expects that
    // OR if the model server expects a file, you'd need to convert the URL back to a File/Blob.
    // This part depends heavily on how your model server's /animate endpoint expects audio.
    // For now, let's assume audioUrl is just a string for the mock.
    // For a real scenario, you'd likely append the actual audio Blob/File.
    // Example for appending a fetched blob:
    // const audioBlobResponse = await fetch(audioUrl);
    // const audioBlob = await audioBlobResponse.blob();
    // formData.append('audio', audioBlob, 'output.wav'); // Give it a filename

    try {
      // Assuming your model server is on port 5001
      const response = await axios.post('http://localhost:5001/animate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Expecting a video blob
      });
      return URL.createObjectURL(response.data); // Example: create a blob URL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('API Animate Avatar Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Avatar animation failed');
    }
  },
};
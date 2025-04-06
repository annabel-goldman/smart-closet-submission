import axios from 'axios';
import { ClosetResponse } from '../types/types';

const API_BASE_URL = 'https://v5bqcgfgd7.execute-api.us-east-2.amazonaws.com/prod';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
// Add any authentication headers here if needed
// axios.defaults.headers.common['Authorization'] = 'your-auth-token';

export const uploadImage = async (file: File, userId: string): Promise<void> => {
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });

    reader.readAsDataURL(file);
    const base64Data = await base64Promise;

    // Send the data as JSON
    await axios.post(`${API_BASE_URL}/images`, {
        user_id: userId,
        filename: file.name,
        file_content: base64Data
    });
};

export const getCloset = async (userId: string): Promise<ClosetResponse> => {
    // Strip special characters from userId, keeping only alphanumeric characters
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    const response = await axios.get(`${API_BASE_URL}/closet/${cleanUserId}`);
    return response.data;
}; 
// src/utils/imageHelper.js
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';

    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;

    // Convert backslashes to forward slashes
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // If it doesn't start with a slash, add one
    const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

    // Return the full URL
    return `http://localhost:3000${path}`;
};
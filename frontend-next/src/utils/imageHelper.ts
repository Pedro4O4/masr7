// src/utils/imageHelper.ts
import { BASE_URL } from "@/config";

export const getImageUrl = (imagePath: string | null | undefined, fallback: string = '/placeholder-image.jpg'): string => {
    if (!imagePath) return fallback;

    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;

    // Convert backslashes to forward slashes
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // If it doesn't start with a slash, add one
    const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

    // Return the full URL
    return `${BASE_URL}${path}`;
};

import type { ApiResponse } from '@/types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function analyzeMood(imageBase64: string): Promise<ApiResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/predict_emotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.emotion || (typeof data.confidence !== 'number' && typeof data.confidence !== 'string') || !Array.isArray(data.songs)) {
      throw new ApiError('Invalid response format from API');
    }

    return data as ApiResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError('Network error: Unable to reach the server. Is the backend running?');
    }
    throw new ApiError('An unexpected error occurred');
  }
}
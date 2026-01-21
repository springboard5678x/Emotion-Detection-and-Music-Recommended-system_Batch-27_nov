export interface Song {
  track_name: string;
  artists: string;
  album_name: string;
  track_genre: string;
  valence: number;
  energy: number;
  emotion_id: number;
  album_art?: string;
  spotify_url?: string;
}

export interface ApiResponse {
  emotion: string;
  confidence: string | number;
  songs: Song[];
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
}
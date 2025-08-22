"use server";

export interface AudioRecognitionResult {
  status: 'success' | 'error';
  result?: {
    artist: string;
    title: string;
    album?: string;
    release_date?: string;
    label?: string;
    timecode?: string;
    song_link?: string;
    apple_music?: {
      url: string;
      previews?: { url: string }[];
    };
    spotify?: {
      external_urls?: { spotify: string };
    };
  };
  error?: {
    error_code: number;
    error_message: string;
  };
}

export const audioRecognitionService = {
  async recognizeAudio(audioFile: File): Promise<AudioRecognitionResult> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      
      // For now, using the free tier (no API token)
      // TODO: Add API token from environment for production use
      const apiToken = process.env.AUDD_API_TOKEN;
      if (apiToken) {
        formData.append('api_token', apiToken);
      }
      
      const response = await fetch('https://api.audd.io/', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it for FormData
        },
      });
      
      if (!response.ok) {
        return {
          status: 'error',
          error: {
            error_code: response.status,
            error_message: `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.result) {
        return {
          status: 'success',
          result: {
            artist: data.result.artist,
            title: data.result.title,
            album: data.result.album,
            release_date: data.result.release_date,
            label: data.result.label,
            timecode: data.result.timecode,
            song_link: data.result.song_link,
            apple_music: data.result.apple_music,
            spotify: data.result.spotify,
          },
        };
      } else {
        return {
          status: 'error',
          error: {
            error_code: data.error?.error_code || 0,
            error_message: data.error?.error_message || 'Unknown error occurred',
          },
        };
      }
    } catch (error) {
      console.error('Audio recognition error:', error);
      return {
        status: 'error',
        error: {
          error_code: -1,
          error_message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  },
};
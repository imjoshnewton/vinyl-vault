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

export async function recognizeAudioAction(formData: FormData): Promise<AudioRecognitionResult> {
  const audioFile = formData.get('audio') as File;
  
  if (!audioFile) {
    return {
      status: 'error',
      error: {
        error_code: 400,
        error_message: 'No audio file provided',
      },
    };
  }
  
  // Validate file size (max 10MB as per AudD docs)
  if (audioFile.size > 10 * 1024 * 1024) {
    return {
      status: 'error',
      error: {
        error_code: 413,
        error_message: 'Audio file too large. Maximum size is 10MB.',
      },
    };
  }
  
  // Validate file type
  const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
  if (!allowedTypes.includes(audioFile.type)) {
    return {
      status: 'error',
      error: {
        error_code: 415,
        error_message: 'Unsupported audio format. Please use WAV, MP3, or OGG.',
      },
    };
  }
  
  // Inline the recognition logic here to avoid importing service objects
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('file', audioFile);
    
    // Add API token if available
    const apiToken = process.env.AUDD_API_TOKEN;
    if (apiToken) {
      formDataToSend.append('api_token', apiToken);
    }
    
    console.log('Sending request to AudD API...');
    console.log('API Token present:', !!apiToken);
    
    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: formDataToSend,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return {
        status: 'error',
        error: {
          error_code: response.status,
          error_message: `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
        },
      };
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    
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
}
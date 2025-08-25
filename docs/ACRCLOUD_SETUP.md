# Setting up ACRCloud for Free Audio Recognition

## 1. Sign Up for ACRCloud

1. Go to [https://console.acrcloud.com/](https://console.acrcloud.com/)
2. Sign up for a free account
3. Verify your email

## 2. Create a Project

1. In the console, click "Create Project"
2. Select "Audio & Video Recognition"
3. Choose your region (US-West, EU-West, etc.)
4. Select "Music" as the recognition type

## 3. Get Your Credentials

After creating the project, you'll get:
- `Host`: (e.g., identify-us-west-2.acrcloud.com)
- `Access Key`: Your unique key
- `Access Secret`: Your secret key

## 4. Update Environment Variables

Add these to your `.env.local`:

```bash
ACRCLOUD_HOST=identify-us-west-2.acrcloud.com
ACRCLOUD_ACCESS_KEY=your_access_key
ACRCLOUD_ACCESS_SECRET=your_access_secret
```

## 5. Install Dependencies

```bash
bun add crypto-js
```

## 6. Create ACRCloud Service

Create `/services/acrcloud.service.ts`:

```typescript
import CryptoJS from 'crypto-js';

interface ACRCloudConfig {
  host: string;
  accessKey: string;
  accessSecret: string;
}

interface ACRCloudResult {
  status: {
    msg: string;
    code: number;
  };
  metadata?: {
    music?: Array<{
      title: string;
      artists: Array<{
        name: string;
      }>;
      album?: {
        name: string;
      };
      release_date?: string;
      label?: string;
      external_metadata?: {
        spotify?: {
          track?: {
            id: string;
          };
        };
      };
    }>;
  };
}

export class ACRCloudService {
  private config: ACRCloudConfig;

  constructor(config: ACRCloudConfig) {
    this.config = config;
  }

  private buildStringToSign(
    method: string,
    uri: string,
    accessKey: string,
    signatureVersion: string,
    timestamp: number
  ): string {
    return [method, uri, accessKey, signatureVersion, timestamp].join('\n');
  }

  private sign(signString: string, accessSecret: string): string {
    return CryptoJS.HmacSHA1(signString, accessSecret)
      .toString(CryptoJS.enc.Base64);
  }

  async identify(audioBuffer: Buffer): Promise<ACRCloudResult> {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = this.buildStringToSign(
      'POST',
      '/v1/identify',
      this.config.accessKey,
      '1',
      timestamp
    );
    
    const signature = this.sign(stringToSign, this.config.accessSecret);
    
    const formData = new FormData();
    formData.append('sample', new Blob([audioBuffer]));
    formData.append('access_key', this.config.accessKey);
    formData.append('data_type', 'audio');
    formData.append('signature_version', '1');
    formData.append('signature', signature);
    formData.append('sample_bytes', audioBuffer.length.toString());
    formData.append('timestamp', timestamp.toString());
    
    const response = await fetch(`https://${this.config.host}/v1/identify`, {
      method: 'POST',
      body: formData,
    });
    
    return await response.json();
  }
}
```

## 7. Update Audio Recognition Action

Update `/actions/audio-recognition.actions.ts`:

```typescript
"use server";

import { ACRCloudService } from '@/services/acrcloud.service';

export async function recognizeAudioAction(formData: FormData) {
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
  
  try {
    const acrcloud = new ACRCloudService({
      host: process.env.ACRCLOUD_HOST!,
      accessKey: process.env.ACRCLOUD_ACCESS_KEY!,
      accessSecret: process.env.ACRCLOUD_ACCESS_SECRET!,
    });
    
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const result = await acrcloud.identify(buffer);
    
    if (result.status.code === 0 && result.metadata?.music?.[0]) {
      const track = result.metadata.music[0];
      return {
        status: 'success',
        result: {
          artist: track.artists.map(a => a.name).join(', '),
          title: track.title,
          album: track.album?.name,
          release_date: track.release_date,
          label: track.label,
        },
      };
    } else if (result.status.code === 1001) {
      return {
        status: 'error',
        error: {
          error_code: 404,
          error_message: 'No match found. Try recording closer to the speakers.',
        },
      };
    } else {
      return {
        status: 'error',
        error: {
          error_code: result.status.code,
          error_message: result.status.msg,
        },
      };
    }
  } catch (error) {
    console.error('Audio recognition error:', error);
    return {
      status: 'error',
      error: {
        error_code: -1,
        error_message: 'Recognition failed',
      },
    };
  }
}
```

## Free Tier Limits

- **100 requests per day** (resets at midnight UTC)
- **10 seconds max** per recording
- **Perfect for personal use** or small projects

## Benefits over AudD

- ✅ **Permanently free tier** (not just a trial)
- ✅ **Good recognition quality**
- ✅ **Includes Spotify/Apple Music metadata**
- ✅ **No credit card required**

## Testing

After setup, test with a song playing and you should get results like:

```json
{
  "status": {
    "msg": "Success",
    "code": 0
  },
  "metadata": {
    "music": [{
      "title": "Song Title",
      "artists": [{"name": "Artist Name"}],
      "album": {"name": "Album Name"},
      "release_date": "2023-01-01"
    }]
  }
}
```
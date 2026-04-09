import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TTS_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('TTS_API_KEY not set; TTS synthesis will return empty audio.');
    }
  }

  /**
   * Synthesize speech from a text chunk.
   * When TTS_API_KEY is provided this calls the configured Cloud TTS API.
   * Without credentials it returns an empty buffer (stub).
   */
  async synthesize(text: string): Promise<Buffer> {
    if (!this.apiKey || text.trim().length === 0) {
      return Buffer.alloc(0);
    }

    // Cloud TTS provider can be swapped here.
    // Example: Google Cloud Text-to-Speech REST API
    const endpoint =
      this.configService.get<string>('TTS_API_ENDPOINT') ??
      'https://texttospeech.googleapis.com/v1/text:synthesize';

    const body = {
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const response = await fetch(`${endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as { audioContent: string };
    return Buffer.from(json.audioContent, 'base64');
  }
}

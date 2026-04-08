import { Injectable } from '@nestjs/common';

@Injectable()
export class TtsService {
  /**
   * Synthesize speech from a text chunk.
   * Implementation will use Google Cloud TTS / AWS Polly in Phase 3.
   */
  async synthesize(_text: string): Promise<Buffer> {
    // TODO: Integrate Cloud TTS API
    return Buffer.alloc(0);
  }
}

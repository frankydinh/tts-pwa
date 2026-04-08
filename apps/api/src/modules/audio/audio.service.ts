import { Injectable } from '@nestjs/common';

@Injectable()
export class AudioService {
  /**
   * Save an audio buffer to storage and return its URL.
   * Implementation in Phase 3.
   */
  async save(_documentId: string, _index: number, _audio: Buffer): Promise<string> {
    // TODO: Implement file storage
    return '';
  }
}

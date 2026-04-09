import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('AUDIO_STORAGE_PATH') ?? '/tmp/audio';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save an audio buffer to local storage and return its URL path.
   * In production, swap this for S3/Vercel Blob storage.
   */
  async save(documentId: string, index: number, audio: Buffer): Promise<string> {
    if (audio.length === 0) {
      // Stub: return a placeholder URL when no audio data
      return `/api/audio/${documentId}/${index}.mp3`;
    }

    const dir = path.join(this.uploadDir, documentId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${index}.mp3`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, audio);
    this.logger.log(`Saved audio chunk ${index} for document ${documentId}`);

    return `/api/audio/${documentId}/${filename}`;
  }
}

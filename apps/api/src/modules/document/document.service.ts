import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { DocumentDto, DocumentStatus, PlaylistDto, AudioChunkDto } from '@tech-audiobook/shared-types';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly redis: Redis | null;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (url && token) {
      this.redis = new Redis({ url, token });
    } else {
      this.logger.warn('Upstash Redis credentials not set; using in-memory fallback.');
      this.redis = null;
    }
  }

  // In-memory fallback when Redis is not configured
  private memDocs: Map<string, DocumentDto> = new Map();
  private memPlaylists: Map<string, PlaylistDto> = new Map();

  async findAll(): Promise<DocumentDto[]> {
    if (this.redis) {
      const ids = await this.redis.lrange<string>('doc:ids', 0, -1);
      if (!ids || ids.length === 0) return [];
      const docs: DocumentDto[] = [];
      for (const id of ids) {
        const raw = await this.redis.hgetall(`doc:${id}`);
        if (raw) docs.push(raw as unknown as DocumentDto);
      }
      return docs;
    }
    return Array.from(this.memDocs.values());
  }

  async findById(id: string): Promise<DocumentDto | undefined> {
    if (this.redis) {
      const raw = await this.redis.hgetall(`doc:${id}`);
      return raw ? (raw as unknown as DocumentDto) : undefined;
    }
    return this.memDocs.get(id);
  }

  async create(filename: string): Promise<DocumentDto> {
    const now = new Date().toISOString();
    const doc: DocumentDto = {
      id: crypto.randomUUID(),
      filename,
      status: DocumentStatus.UPLOADED,
      createdAt: now,
      updatedAt: now,
    };

    if (this.redis) {
      await this.redis.hset(`doc:${doc.id}`, doc as unknown as Record<string, unknown>);
      await this.redis.lpush('doc:ids', doc.id);
    } else {
      this.memDocs.set(doc.id, doc);
    }

    return doc;
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<void> {
    const now = new Date().toISOString();
    if (this.redis) {
      await this.redis.hset(`doc:${id}`, { status, updatedAt: now });
    } else {
      const doc = this.memDocs.get(id);
      if (doc) {
        doc.status = status;
        doc.updatedAt = now;
      }
    }
  }

  async savePlaylist(documentId: string, title: string, chunks: AudioChunkDto[]): Promise<void> {
    const playlist: PlaylistDto = { documentId, title, chunks };
    if (this.redis) {
      await this.redis.set(`playlist:${documentId}`, JSON.stringify(playlist));
    } else {
      this.memPlaylists.set(documentId, playlist);
    }
  }

  async getPlaylist(documentId: string): Promise<PlaylistDto> {
    if (this.redis) {
      const raw = await this.redis.get<string>(`playlist:${documentId}`);
      if (!raw) throw new NotFoundException(`Playlist not found for document ${documentId}`);
      return JSON.parse(raw) as PlaylistDto;
    }
    const playlist = this.memPlaylists.get(documentId);
    if (!playlist) throw new NotFoundException(`Playlist not found for document ${documentId}`);
    return playlist;
  }
}

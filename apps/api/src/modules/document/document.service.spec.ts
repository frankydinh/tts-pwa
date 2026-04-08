import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DocumentService } from './document.service';
import { DocumentStatus } from '@tech-audiobook/shared-types';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: ConfigService,
          useValue: {
            get: () => undefined, // No Redis credentials → in-memory fallback
          },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array initially', async () => {
    expect(await service.findAll()).toEqual([]);
  });

  it('should create a document', async () => {
    const doc = await service.create('test.pdf');
    expect(doc.filename).toBe('test.pdf');
    expect(doc.status).toBe(DocumentStatus.UPLOADED);
    expect(doc.id).toBeDefined();
  });

  it('should find a document by id', async () => {
    const doc = await service.create('test.pdf');
    const found = await service.findById(doc.id);
    expect(found).toEqual(doc);
  });

  it('should return undefined for non-existent id', async () => {
    expect(await service.findById('non-existent')).toBeUndefined();
  });

  it('should update document status', async () => {
    const doc = await service.create('test.pdf');
    await service.updateStatus(doc.id, DocumentStatus.COMPLETED);
    const updated = await service.findById(doc.id);
    expect(updated?.status).toBe(DocumentStatus.COMPLETED);
  });

  it('should save and retrieve a playlist', async () => {
    const doc = await service.create('audio.pdf');
    const chunks = [
      { id: `${doc.id}-0`, documentId: doc.id, index: 0, url: '/audio/0.mp3', durationMs: 0 },
    ];
    await service.savePlaylist(doc.id, 'audio.pdf', chunks);
    const playlist = await service.getPlaylist(doc.id);
    expect(playlist.documentId).toBe(doc.id);
    expect(playlist.chunks).toHaveLength(1);
  });
});

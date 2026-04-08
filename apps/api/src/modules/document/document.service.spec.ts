import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentStatus } from '@tech-audiobook/shared-types';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentService],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array initially', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should create a document', () => {
    const doc = service.create('test.pdf');
    expect(doc.filename).toBe('test.pdf');
    expect(doc.status).toBe(DocumentStatus.UPLOADED);
    expect(doc.id).toBeDefined();
  });

  it('should find a document by id', () => {
    const doc = service.create('test.pdf');
    const found = service.findById(doc.id);
    expect(found).toEqual(doc);
  });

  it('should return undefined for non-existent id', () => {
    expect(service.findById('non-existent')).toBeUndefined();
  });
});

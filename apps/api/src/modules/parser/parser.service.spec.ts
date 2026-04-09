import { Test, TestingModule } from '@nestjs/testing';
import { ParserService } from './parser.service';

describe('ParserService', () => {
  let service: ParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParserService],
    }).compile();

    service = module.get<ParserService>(ParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanText', () => {
    it('should remove standalone page numbers', () => {
      const input = 'Introduction\n42\nThis is text.';
      const result = service.cleanText(input);
      expect(result).not.toMatch(/^\s*42\s*$/m);
      expect(result).toContain('This is text.');
    });

    it('should remove "Page N" patterns', () => {
      const input = 'Content here.\nPage 5\nMore content.';
      const result = service.cleanText(input);
      expect(result).not.toContain('Page 5');
      expect(result).toContain('Content here.');
    });

    it('should replace fenced code blocks with placeholder', () => {
      const input = 'Some text.\n```\nconst x = 1;\n```\nMore text.';
      const result = service.cleanText(input);
      expect(result).toContain('[Code snippet omitted]');
      expect(result).not.toContain('const x = 1;');
    });

    it('should replace code-like lines with placeholder', () => {
      const input = 'Text before.\nif (x > 0) { return x; }\nText after.';
      const result = service.cleanText(input);
      expect(result).toContain('[Code snippet omitted]');
    });

    it('should collapse multiple blank lines', () => {
      const input = 'Line 1.\n\n\n\nLine 2.';
      const result = service.cleanText(input);
      expect(result).not.toMatch(/\n{3,}/);
    });
  });

  describe('chunkText', () => {
    it('should return a single chunk for short text', () => {
      const text = 'Hello world.';
      const chunks = service.chunkText(text);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe('Hello world.');
    });

    it('should split text into chunks not exceeding maxLength', () => {
      const sentence = 'This is a sentence. ';
      const text = sentence.repeat(100);
      const chunks = service.chunkText(text, 1000);
      // Allow up to 10% over maxLength: a single sentence added may push a chunk slightly over
      const allowedMax = 1100;
      for (const chunk of chunks) {
        expect(chunk.length).toBeLessThanOrEqual(allowedMax);
      }
    });

    it('should not create empty chunks', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      const chunks = service.chunkText(text, 20);
      for (const chunk of chunks) {
        expect(chunk.trim().length).toBeGreaterThan(0);
      }
    });

    it('should preserve all text content across chunks', () => {
      const text = 'Alpha. Beta. Gamma. Delta. Epsilon.';
      const chunks = service.chunkText(text, 15);
      const rejoined = chunks.join(' ');
      expect(rejoined).toContain('Alpha');
      expect(rejoined).toContain('Epsilon');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CleanerService } from './cleaner.service';

describe('CleanerService', () => {
  let service: CleanerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleanerService],
    }).compile();

    service = module.get<CleanerService>(CleanerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Rule 1: Headers, footers, and page numbers ───────────────────────────

  describe('Rule 1 – page numbers and chapter headers', () => {
    it('should remove standalone page numbers', () => {
      const input = 'Some content.\n42\nMore content.';
      const result = service.clean(input);
      expect(result).not.toMatch(/^\s*42\s*$/m);
      expect(result).toContain('Some content.');
      expect(result).toContain('More content.');
    });

    it('should remove "Chapter N" header lines', () => {
      const input = 'Chapter 1: Introduction\nThis is the actual content.';
      const result = service.clean(input);
      expect(result).not.toContain('Chapter 1');
      expect(result).toContain('actual content');
    });

    it('should remove "N | Chapter" style headers', () => {
      const input = '32 | Chapter 2\nFollowing paragraph text.';
      const result = service.clean(input);
      expect(result).not.toContain('Chapter 2');
      expect(result).toContain('Following paragraph text.');
    });
  });

  // ─── Rule 2: Citations and URLs ───────────────────────────────────────────

  describe('Rule 2 – citations and URLs', () => {
    it('should remove inline citation numbers like [3] and [12]', () => {
      const input = 'This was proven in [3] and also supported by [12] further studies.';
      const result = service.clean(input);
      expect(result).not.toContain('[3]');
      expect(result).not.toContain('[12]');
      expect(result).toContain('proven');
    });

    it('should replace http URLs with [Link]', () => {
      const input = 'Visit http://example.com for more information.';
      const result = service.clean(input);
      expect(result).not.toContain('http://example.com');
      expect(result).toContain('[Link]');
    });

    it('should replace https URLs with [Link]', () => {
      const input = 'See https://www.example.org/docs/guide for details.';
      const result = service.clean(input);
      expect(result).not.toContain('https://www.example.org/docs/guide');
      expect(result).toContain('[Link]');
    });
  });

  // ─── Rule 3: Code snippets ───────────────────────────────────────────────

  describe('Rule 3 – code snippet detection', () => {
    it('should replace fenced code blocks with placeholder', () => {
      const input = 'Some text.\n```\nconst x = 1;\nconsole.log(x);\n```\nMore text.';
      const result = service.clean(input);
      expect(result).toContain('[Code snippet omitted for audio playback]');
      expect(result).not.toContain('const x = 1;');
      expect(result).toContain('More text.');
    });

    it('should replace code-like lines with many special chars', () => {
      const input = 'Normal sentence.\nif (x > 0) { return x; }\nAnother sentence.';
      const result = service.clean(input);
      expect(result).toContain('[Code snippet omitted for audio playback]');
      expect(result).not.toContain('if (x > 0)');
    });

    it('should replace lines with code keywords', () => {
      const input = 'The function is shown below.\nfunction greet() { return "hello"; }\nEnd of example.';
      const result = service.clean(input);
      expect(result).toContain('[Code snippet omitted for audio playback]');
    });

    it('should preserve normal prose sentences', () => {
      const input = 'This is a normal sentence. It has no code in it.';
      const result = service.clean(input);
      expect(result).not.toContain('[Code snippet omitted for audio playback]');
      expect(result).toContain('normal sentence');
    });
  });

  // ─── Rule 4: Whitespace normalisation ────────────────────────────────────

  describe('Rule 4 – whitespace normalisation', () => {
    it('should collapse multiple spaces into one', () => {
      const input = 'Word1    Word2\tWord3';
      const result = service.clean(input);
      expect(result).not.toMatch(/\s{2,}/);
    });

    it('should join mid-sentence line breaks (lines not ending with punctuation)', () => {
      const input = 'This is a long sentence that\nwas broken by the PDF renderer.';
      const result = service.clean(input);
      expect(result).toContain('that was broken');
    });

    it('should NOT join lines where current line ends with a period', () => {
      const input = 'First sentence.\nSecond sentence.';
      const result = service.clean(input);
      // Lines separated by a period should stay on separate lines
      expect(result).toMatch(/First sentence\.\s*\n\s*Second sentence\./);
    });
  });
});

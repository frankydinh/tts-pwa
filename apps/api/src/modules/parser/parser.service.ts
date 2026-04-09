import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class ParserService {
  /**
   * Extract raw text from a PDF buffer using pdf-parse.
   */
  async extractText(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  /**
   * Clean raw text by removing headers, footers, page numbers,
   * and replacing code snippets with a placeholder.
   */
  cleanText(rawText: string): string {
    let text = rawText;

    // Remove standalone page numbers (e.g. "42" or "Page 42")
    text = text.replace(/^\s*(Page\s+)?\d+\s*$/gim, '');

    // Remove repeated chapter/section headers (all-caps short lines)
    text = text.replace(/^[A-Z][A-Z\s]{2,60}$/gm, '');

    // Detect and replace code snippets: blocks with braces, indented lines, or backtick fences
    text = this._replaceCodeBlocks(text);

    // Collapse multiple blank lines into one
    text = text.replace(/(\r?\n){3,}/g, '\n\n');

    return text.trim();
  }

  /**
   * Split cleaned text into chunks of at most maxLength characters,
   * splitting at sentence boundaries where possible.
   */
  chunkText(text: string, maxLength = 1000): string[] {
    const chunks: string[] = [];
    // Split by sentence-ending punctuation
    const sentences = text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) ?? [text];
    let current = '';

    for (const sentence of sentences) {
      if (current.length + sentence.length > maxLength && current.length > 0) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }

    if (current.trim().length > 0) {
      chunks.push(current.trim());
    }

    return chunks;
  }

  private _replaceCodeBlocks(text: string): string {
    // Replace fenced code blocks (``` ... ```)
    text = text.replace(/```[\s\S]*?```/g, '[Code snippet omitted]');

    // Replace lines that look like code: high density of { } ; ( ) = > < symbols
    const lines = text.split('\n');
    const result: string[] = [];
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];

    for (const line of lines) {
      const codeCharCount = (line.match(/[{}();=><]/g) ?? []).length;
      const isCodeLike = codeCharCount >= 3 || /^\s{4,}\S/.test(line);

      if (isCodeLike) {
        inCodeBlock = true;
        codeBlockBuffer.push(line);
      } else {
        if (inCodeBlock) {
          result.push('[Code snippet omitted]');
          codeBlockBuffer = [];
          inCodeBlock = false;
        }
        result.push(line);
      }
    }

    if (inCodeBlock && codeBlockBuffer.length > 0) {
      result.push('[Code snippet omitted]');
    }

    return result.join('\n');
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class CleanerService {
  /**
   * Run the full cleaning pipeline on raw extracted PDF text.
   */
  clean(rawText: string): string {
    let text = rawText;

    // Rule 1: Remove headers, footers, and page numbers
    text = this._removePageNumbers(text);
    text = this._removeChapterHeaders(text);

    // Rule 2: Remove citation references and replace URLs
    text = this._removeCitationReferences(text);
    text = this._replaceUrls(text);

    // Rule 3: Replace code snippets with a placeholder
    text = this._replaceCodeBlocks(text);

    // Rule 4: Whitespace normalisation
    text = this._normaliseWhitespace(text);
    text = this._joinBrokenLines(text);

    return text.trim();
  }

  // ─── Rule 1 ──────────────────────────────────────────────────────────────

  /** Remove lines that contain only a number (standalone page numbers). */
  private _removePageNumbers(text: string): string {
    return text.replace(/^\s*\d+\s*$/gm, '');
  }

  /** Remove repeated chapter/section header lines. */
  private _removeChapterHeaders(text: string): string {
    return text.replace(/^(Chapter\s\d+|.*\s\|\sChapter).*$/gim, '');
  }

  // ─── Rule 2 ──────────────────────────────────────────────────────────────

  /** Remove inline citation numbers like [3] or [12]. */
  private _removeCitationReferences(text: string): string {
    return text.replace(/\[\d+\]/g, '');
  }

  /** Replace bare URLs with a readable placeholder. */
  private _replaceUrls(text: string): string {
    return text.replace(/(https?:\/\/[^\s]+)/g, '[Link]');
  }

  // ─── Rule 3 ──────────────────────────────────────────────────────────────

  private _replaceCodeBlocks(text: string): string {
    // Replace fenced code blocks (``` ... ```)
    text = text.replace(/```[\s\S]*?```/g, '[Code snippet omitted for audio playback]');

    // Heuristic line-by-line detection: lines with many special symbols or deep indentation
    const lines = text.split('\n');
    const result: string[] = [];
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];

    const CODE_KEYWORDS = /\b(const|let|var|function|return|class|public|private|import|export|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/;

    for (const line of lines) {
      const specialCharCount = (line.match(/[{}();=><]/g) ?? []).length;
      const isCodeLike =
        specialCharCount >= 3 ||
        /^\s{4,}\S/.test(line) ||
        CODE_KEYWORDS.test(line);

      if (isCodeLike) {
        inCodeBlock = true;
        codeBlockBuffer.push(line);
      } else {
        if (inCodeBlock) {
          result.push('[Code snippet omitted for audio playback]');
          codeBlockBuffer = [];
          inCodeBlock = false;
        }
        result.push(line);
      }
    }

    if (inCodeBlock && codeBlockBuffer.length > 0) {
      result.push('[Code snippet omitted for audio playback]');
    }

    return result.join('\n');
  }

  // ─── Rule 4 ──────────────────────────────────────────────────────────────

  /** Collapse runs of spaces/tabs into a single space. */
  private _normaliseWhitespace(text: string): string {
    return text.replace(/[ \t]+/g, ' ');
  }

  /**
   * Join lines where the break is mid-sentence (PDF hard-wraps long lines).
   * A line break is joined when:
   *   - the current line does NOT end with sentence-ending punctuation, AND
   *   - the next line starts with a lowercase letter (not a new sentence).
   */
  private _joinBrokenLines(text: string): string {
    return text.replace(/(\w)\n([a-z])/g, '$1 $2');
  }
}

import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { ParserService } from '../parser/parser.service';
import { TtsService } from '../tts/tts.service';
import { AudioService } from '../audio/audio.service';
import { DocumentStatus, UploadResponseDto } from '@tech-audiobook/shared-types';

@Controller('documents')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly parserService: ParserService,
    private readonly ttsService: TtsService,
    private readonly audioService: AudioService,
  ) {}

  @Get()
  async getDocuments() {
    return this.documentService.findAll();
  }

  @Get(':id/playlist')
  async getPlaylist(@Param('id') id: string) {
    const doc = await this.documentService.findById(id);
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return this.documentService.getPlaylist(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are accepted');
    }

    // 1. Create metadata record
    const doc = await this.documentService.create(file.originalname);
    this.logger.log(`Created document ${doc.id} for ${file.originalname}`);

    // 2. Run the processing pipeline asynchronously (non-blocking response)
    this._processPipeline(doc.id, file.buffer).catch((err: unknown) => {
      this.logger.error(`Pipeline failed for ${doc.id}: ${String(err)}`);
    });

    return { documentId: doc.id, filename: doc.filename, status: doc.status };
  }

  private async _processPipeline(documentId: string, buffer: Buffer): Promise<void> {
    try {
      // Extracting
      await this.documentService.updateStatus(documentId, DocumentStatus.EXTRACTING);
      const rawText = await this.parserService.extractText(buffer);

      // Cleaning
      await this.documentService.updateStatus(documentId, DocumentStatus.CLEANING);
      const cleanedText = this.parserService.cleanText(rawText);

      // Chunking
      await this.documentService.updateStatus(documentId, DocumentStatus.CHUNKING);
      const textChunks = this.parserService.chunkText(cleanedText);

      // Synthesizing
      await this.documentService.updateStatus(documentId, DocumentStatus.SYNTHESIZING);
      const audioChunks = [];
      for (let i = 0; i < textChunks.length; i++) {
        const audioBuffer = await this.ttsService.synthesize(textChunks[i]);
        const url = await this.audioService.save(documentId, i, audioBuffer);
        audioChunks.push({ id: `${documentId}-${i}`, documentId, index: i, url, durationMs: 0 });
      }

      // Save playlist
      const doc = await this.documentService.findById(documentId);
      await this.documentService.savePlaylist(documentId, doc?.filename ?? documentId, audioChunks);
      await this.documentService.updateStatus(documentId, DocumentStatus.COMPLETED);
      this.logger.log(`Pipeline completed for document ${documentId}`);
    } catch (error) {
      this.logger.error(`Pipeline error for ${documentId}`, error);
      await this.documentService.updateStatus(documentId, DocumentStatus.FAILED);
    }
  }
}

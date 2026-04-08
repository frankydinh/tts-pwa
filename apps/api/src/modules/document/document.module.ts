import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { ParserModule } from '../parser/parser.module';
import { TtsModule } from '../tts/tts.module';
import { AudioModule } from '../audio/audio.module';

@Module({
  imports: [ParserModule, TtsModule, AudioModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}

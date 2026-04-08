import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './modules/document/document.module';
import { ParserModule } from './modules/parser/parser.module';
import { TtsModule } from './modules/tts/tts.module';
import { AudioModule } from './modules/audio/audio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DocumentModule,
    ParserModule,
    TtsModule,
    AudioModule,
  ],
})
export class AppModule {}

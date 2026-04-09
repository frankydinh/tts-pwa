import { Module } from '@nestjs/common';
import { TtsService } from './tts.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TtsService],
  exports: [TtsService],
})
export class TtsModule {}

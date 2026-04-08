import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}

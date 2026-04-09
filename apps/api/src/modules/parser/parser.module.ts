import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { CleanerService } from './cleaner.service';

@Module({
  providers: [ParserService, CleanerService],
  exports: [ParserService, CleanerService],
})
export class ParserModule {}

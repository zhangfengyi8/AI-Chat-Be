import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiMemoryController } from './ai.memory.controller';
// import { AiController } from './ai.controller';

@Module({
  controllers: [AiMemoryController],
  // controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

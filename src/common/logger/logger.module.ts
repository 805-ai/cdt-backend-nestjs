import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

@Global() // available everywhere without re-importing
@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}

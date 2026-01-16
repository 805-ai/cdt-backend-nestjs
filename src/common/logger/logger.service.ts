import { Injectable, LoggerService } from '@nestjs/common';
import { join } from 'path';
import { createLogger, format, Logger, transports } from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'debug',
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        }),
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: join(__dirname, '../../logs/app.log'),
          format: format.combine(
            format.uncolorize(),
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
              return `${timestamp} [${level}]: ${message}`;
            }),
          ),
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}

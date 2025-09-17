import { SetMetadata } from '@nestjs/common';

export const LOG_LEVEL_METADATA = 'log_level';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export const Log = (level: LogLevel = LogLevel.INFO) => {
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(LOG_LEVEL_METADATA, level)(target, propertyName, descriptor);
    return descriptor;
  };
};

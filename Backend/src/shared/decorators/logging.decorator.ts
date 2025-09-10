import { SetMetadata } from '@nestjs/common';

export const LOGGING_KEY = 'logging';
export const Logging = (enabled: boolean = true) =>
  SetMetadata(LOGGING_KEY, enabled);

import { SetMetadata } from '@nestjs/common';

export const TEAM_ACCESS_KEY = 'teamAccess';
export const TeamAccess = (...permissions: string[]) =>
  SetMetadata(TEAM_ACCESS_KEY, permissions);

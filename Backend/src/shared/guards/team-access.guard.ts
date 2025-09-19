import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TEAM_ACCESS_KEY } from '../decorators/team-access.decorator';

@Injectable()
export class TeamAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTeamAccess = this.reflector.getAllAndOverride<string[]>(
      TEAM_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTeamAccess) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();

    // 사용자의 팀 ID 확인
    const userTeamId = user.teamId;
    if (!userTeamId) {
      throw new ForbiddenException('팀에 소속되지 않은 사용자입니다.');
    }

    // 요청에서 팀 ID 추출 (URL 파라미터, 쿼리, 또는 바디에서)
    const requestedTeamId = this.extractTeamIdFromRequest(request);

    if (requestedTeamId && requestedTeamId !== userTeamId) {
      throw new ForbiddenException('다른 팀의 데이터에 접근할 수 없습니다.');
    }

    return true;
  }

  private extractTeamIdFromRequest(request: any): number | null {
    // URL 파라미터에서 팀 ID 추출
    if (request.params?.teamId) {
      return parseInt(request.params.teamId);
    }

    // 쿼리 파라미터에서 팀 ID 추출
    if (request.query?.teamId) {
      return parseInt(request.query.teamId);
    }

    // 바디에서 팀 ID 추출
    if (request.body?.teamId) {
      return parseInt(request.body.teamId);
    }

    return null;
  }
}

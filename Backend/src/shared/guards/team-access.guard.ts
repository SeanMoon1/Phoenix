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

    // 사용자의 팀 ID 확인 (팀이 없는 사용자도 허용)
    const userTeamId = user.teamId;

    // 팀이 없는 사용자는 팀 관련 검증을 건너뛰고 허용
    if (!userTeamId) {
      return true;
    }

    // 요청에서 팀 ID 추출 (URL 파라미터, 쿼리, 또는 바디에서)
    const requestedTeamId = this.extractTeamIdFromRequest(request);

    // 팀 관리자 권한 확인
    const isTeamAdmin =
      user.isAdmin &&
      (user.adminLevel === 'TEAM_ADMIN' || user.adminLevel === 'SUPER_ADMIN');

    if (requestedTeamId && requestedTeamId !== userTeamId) {
      // 팀 관리자는 다른 팀의 데이터도 조회 가능 (관리 목적)
      if (!isTeamAdmin) {
        throw new ForbiddenException('다른 팀의 데이터에 접근할 수 없습니다.');
      }
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

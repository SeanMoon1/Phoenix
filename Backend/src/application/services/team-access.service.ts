import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TeamAccessService {
  /**
   * 사용자가 특정 팀의 데이터에 접근할 수 있는지 확인
   * @param userTeamId 사용자의 팀 ID
   * @param targetTeamId 접근하려는 팀 ID
   * @param requiredPermissions 필요한 권한들
   */
  validateTeamAccess(
    userTeamId: number | null,
    targetTeamId: number | null,
    requiredPermissions: string[] = [],
  ): boolean {
    // 팀이 없는 사용자는 개인 데이터에만 접근 가능
    if (!userTeamId) {
      // 개인 데이터 접근은 허용 (targetTeamId가 null이거나 개인 데이터인 경우)
      if (!targetTeamId) {
        return true;
      }
      throw new ForbiddenException(
        '팀에 소속되지 않은 사용자는 팀 데이터에 접근할 수 없습니다.',
      );
    }

    // 같은 팀이 아니면 접근 불가
    if (userTeamId !== targetTeamId) {
      throw new ForbiddenException('다른 팀의 데이터에 접근할 수 없습니다.');
    }

    return true;
  }

  /**
   * 사용자가 관리자 권한을 가지고 있는지 확인
   * @param user 사용자 정보
   * @param requiredPermission 필요한 권한
   */
  validateAdminPermission(user: any, requiredPermission: string): boolean {
    // 관리자 권한 확인 로직
    // 실제 구현에서는 admin 테이블과 admin_level 테이블을 조회해야 함
    if (!user.isAdmin) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    return true;
  }

  /**
   * 팀별 데이터 필터링
   * @param data 원본 데이터
   * @param userTeamId 사용자의 팀 ID
   */
  filterTeamData<T extends { teamId?: number }>(
    data: T[],
    userTeamId: number,
  ): T[] {
    return data.filter((item) => item.teamId === userTeamId);
  }
}

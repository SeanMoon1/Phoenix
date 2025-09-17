import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async getDashboard(): Promise<any> {
    // TODO: 실제 구현
    return {
      totalUsers: 0,
      totalScenarios: 0,
      totalTrainingSessions: 0,
      activeUsers: 0,
    };
  }

  async getStats(): Promise<any> {
    // TODO: 실제 구현
    return {
      systemStats: {
        uptime: '99.9%',
        responseTime: '120ms',
        errorRate: '0.1%',
      },
    };
  }
}

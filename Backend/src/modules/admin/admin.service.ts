import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { TrainingService } from '../training/training.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
    private readonly scenariosService: ScenariosService,
    private readonly trainingService: TrainingService,
  ) {}

  async getDashboard() {
    const [users, teams, scenarios, trainingSessions] = await Promise.all([
      this.usersService.findAll(),
      this.teamsService.findAll(),
      this.scenariosService.findAll(),
      this.trainingService.findAll(),
    ]);

    return {
      totalUsers: users.length,
      totalTeams: teams.length,
      totalScenarios: scenarios.length,
      totalTrainingSessions: trainingSessions.length,
      recentUsers: users.slice(-5),
      recentTeams: teams.slice(-5),
      recentScenarios: scenarios.slice(-5),
      recentTrainingSessions: trainingSessions.slice(-5),
    };
  }

  async getStats() {
    const [users, teams, scenarios, trainingSessions] = await Promise.all([
      this.usersService.findAll(),
      this.teamsService.findAll(),
      this.scenariosService.findAll(),
      this.trainingService.findAll(),
    ]);

    return {
      users: {
        total: users.length,
        active: users.filter(user => user.isActive).length,
        inactive: users.filter(user => !user.isActive).length,
      },
      teams: {
        total: teams.length,
        active: teams.filter(team => team.status === 'active').length,
        inactive: teams.filter(team => team.status === 'inactive').length,
      },
      scenarios: {
        total: scenarios.length,
        published: scenarios.filter(scenario => scenario.status === 'published').length,
        draft: scenarios.filter(scenario => scenario.status === 'draft').length,
        archived: scenarios.filter(scenario => scenario.status === 'archived').length,
      },
      training: {
        total: trainingSessions.length,
        scheduled: trainingSessions.filter(session => session.status === 'scheduled').length,
        inProgress: trainingSessions.filter(session => session.status === 'in_progress').length,
        completed: trainingSessions.filter(session => session.status === 'completed').length,
        cancelled: trainingSessions.filter(session => session.status === 'cancelled').length,
      },
    };
  }
}


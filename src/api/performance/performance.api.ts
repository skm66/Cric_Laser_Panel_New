import axiosInstance from '../../utils/api';
import { TeamFormResponse, HeadToHeadResponse, RecentMatchItem, TeamOption } from './types';

const BASE = '/performance';

export const performanceApi = {
  getTeams: () =>
    axiosInstance.get<{ success: boolean; data: TeamOption[] }>(`${BASE}/teams`).then(r => r.data.data),

  getTeamForm: (teamId: number) =>
    axiosInstance.get<{ success: boolean; data: TeamFormResponse }>(`${BASE}/team/${teamId}/form`).then(r => r.data.data),

  getHeadToHead: (teamAId: number, teamBId: number) =>
    axiosInstance.get<{ success: boolean; data: HeadToHeadResponse }>(`${BASE}/head-to-head`, {
      params: { teamAId, teamBId },
    }).then(r => r.data.data),

  getRecentMatches: (limit = 10) =>
    axiosInstance.get<{ success: boolean; data: RecentMatchItem[] }>(`${BASE}/recent-matches`, {
      params: { limit },
    }).then(r => r.data.data),
};

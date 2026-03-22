import { ApiResponse } from "../../utils";
import axiosInstance from "../../utils/api";
import { MatchWithOddsResponse, OddsHistoryRequest, OddsHistoryResponse } from "./types";

class OddsService {
    getAllMatches() {
        return axiosInstance.get<ApiResponse<MatchWithOddsResponse[]>>('/odds-history/matches');
    }

    createOddsHistory(matchId: number, data: OddsHistoryRequest) {
        return axiosInstance.post<ApiResponse<OddsHistoryResponse>>(`/odds-history/match/${matchId}`, data);
    }

    getOddsHistoryByMatch(matchId: number) {
        return axiosInstance.get<ApiResponse<OddsHistoryResponse[]>>(`/odds-history/match/${matchId}`);
    }

    getOddsHistoryByRange(matchId: number, from: string, to: string) {
        // Convert datetime-local format (2024-01-01T00:00) to ISO (2024-01-01T00:00:00)
        const fromIso = from.length === 16 ? from + ':00' : from;
        const toIso = to.length === 16 ? to + ':00' : to;
        return axiosInstance.get<ApiResponse<OddsHistoryResponse[]>>(
            `/odds-history/match/${matchId}/history`,
            { params: { from: fromIso, to: toIso } }
        );
    }

    getLatestOdds(matchId: number) {
        return axiosInstance.get<ApiResponse<OddsHistoryResponse>>(`/odds-history/match/${matchId}/latest`);
    }

    updateOddsHistory(oddsId: number, data: OddsHistoryRequest) {
        return axiosInstance.put<ApiResponse<OddsHistoryResponse>>(`/odds-history/${oddsId}`, data);
    }

    deleteOddsHistory(oddsId: number) {
        return axiosInstance.delete<ApiResponse<string>>(`/odds-history/${oddsId}`);
    }
}

export default new OddsService();

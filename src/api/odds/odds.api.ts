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

    updateOddsHistory(oddsId: number, data: OddsHistoryRequest) {
        return axiosInstance.put<ApiResponse<OddsHistoryResponse>>(`/odds-history/${oddsId}`, data);
    }

    deleteOddsHistory(oddsId: number) {
        return axiosInstance.delete<ApiResponse<string>>(`/odds-history/${oddsId}`);
    }
}

export default new OddsService();

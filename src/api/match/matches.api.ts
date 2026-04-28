import { AxiosRequestConfig, AxiosResponse } from "axios";
import { AppAction } from "../../store/AppReducer";
import { ApiResponse } from "../../utils";
import axiosInstance from "../../utils/api";
import { BaseApiService } from "../BaseApiService";
import { MatchRequest } from "./matchRequest";
import { MatchResponse, MatchStatus } from "./matchResponse";
import { Dispatch } from "react";
import { MatchSession } from "./matchSession";
import { LiveMatchDto } from "./LiveMatchResponse";

export class MatchService extends BaseApiService {
    constructor(dispatch?: Dispatch<AppAction>) {
        super(dispatch);
    }

    async getLiveMatch(matchId: string) {
        // Backend LiveMatchController returns raw MatchDto, not wrapped in ApiResponse
        const response = await axiosInstance.get<LiveMatchDto>(`/matches/live/${matchId}`);
        return response.data;
    }

    saveMatch(data: MatchRequest) {
        return this.safeApiCall(() =>
            axiosInstance.post<MatchRequest, AxiosResponse<ApiResponse<string>>>("/match/save", data)
        );
    }

    updateMatch(tournamentId: number, data: MatchRequest) {
        return this.safeApiCall(() =>
            axiosInstance.put<MatchRequest, AxiosResponse<ApiResponse<string>>>(
                `/match/update/${tournamentId}`,
                data
            )
        );
    }

    getMatchInfoInfo(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.get<unknown, AxiosResponse<ApiResponse<MatchResponse>>>(
                "/match/getMatchInfo/" + matchId
            )
        );
    }

    queryMatches(matchStatus?: MatchStatus) {
        const config: AxiosRequestConfig = matchStatus ? { params: { matchStatus } } : { params: {} };
        return this.safeApiCall(() =>
            axiosInstance.get<unknown, AxiosResponse<ApiResponse<MatchResponse[]>>>("/match/list", config)
        );
    }

    deleteMatch(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.delete<unknown, AxiosResponse<ApiResponse<null>>>(`/match/delete/${matchId}`)
        );
    }
    forceRestart(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.get<unknown, AxiosResponse<ApiResponse<null>>>(`/match/forceRestart/${matchId}`)
        );
    }

    finishMatch(matchId: number, winner: number) {
        return this.safeApiCall(() =>
            axiosInstance.post<unknown, AxiosResponse<ApiResponse<string>>>(`/match/finish/${matchId}`, null, {
                params: { winner },
            })
        );
    }

    pauseMatch(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.post<unknown, AxiosResponse<ApiResponse<string>>>(`/match/pause/${matchId}`)
        );
    }

    cancelMatch(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.post<unknown, AxiosResponse<ApiResponse<string>>>(`/match/cancel/${matchId}`)
        );
    }

    getMatchSession(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.get<unknown, AxiosResponse<ApiResponse<MatchSession>>>(`/matches/${matchId}/session`)
        );
    }

    createOrUpdateSession(matchId: number, data: MatchSession) {
        return this.safeApiCall(() =>
            axiosInstance.post<MatchSession, AxiosResponse<ApiResponse<MatchSession>>>(`/matches/${matchId}/session`, data)
        );
    }

    removeRate(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.delete<unknown, AxiosResponse<ApiResponse<MatchSession>>>(`/matches/${matchId}/session/rate`)
        );
    }

    resetSessionScore(matchId: number) {
        return this.safeApiCall(() =>
            axiosInstance.post<unknown, AxiosResponse<ApiResponse<MatchSession>>>(`/matches/${matchId}/session/reset-score`)
        );
    }
}

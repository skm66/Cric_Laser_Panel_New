import React from "react";
import { Typography, Chip, Box } from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { MatchResponse } from "../../../api/match/matchResponse";

interface Props {
  match: MatchResponse;
}

const getResultLabel = (match: MatchResponse) => {
  if (match.winningTeam === 0) return match.teamA.teamName;
  if (match.winningTeam === 1) return match.teamB.teamName;
  if (match.winningTeam === 2) return "Draw";
  if (match.winningTeam === 3) return "No Result";
  return "";
};

const MatchResult: React.FC<Props> = ({ match }) => (
  <>
    {match.tossWinner && (
      <Typography variant="subtitle2">
        Toss won by <strong>{match.tossWinner === match.teamA.teamId ? match.teamA.teamName : match.teamB.teamName}</strong>
        {" "}and elected to <strong>{match.electedTo}</strong>.
      </Typography>
    )}

    {match.winningTeam !== null && match.winningTeam !== undefined && (
      <Box display="flex" alignItems="center" gap={1}>
        <EmojiEvents color="success" />
        <Typography variant="subtitle2">
          Result: <Chip label={getResultLabel(match)} color="success" />
        </Typography>
      </Box>
    )}
  </>
);

export default MatchResult;

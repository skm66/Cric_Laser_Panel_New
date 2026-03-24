import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Stack, Chip, CircularProgress,
    Alert, Button, Divider
} from '@mui/material';
import { Casino, ArrowForward } from '@mui/icons-material';
import oddsApi from '../../api/odds/odds.api';
import { MatchWithOddsResponse } from '../../api/odds/types';

const statusColor = (s: string): 'success' | 'warning' | 'default' => {
    if (s === 'IN_PROGRESS' || s === 'LIVE') return 'success';
    if (s === 'UPCOMING' || s === 'UP_COMING') return 'warning';
    return 'default';
};

const OddsListView = () => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<MatchWithOddsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        oddsApi.getAllMatches()
            .then(res => setMatches(res.data.data || []))
            .catch(e => setError(e.response?.data?.message || 'Failed to load matches'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Casino color="primary" />
                <Typography variant="h5" fontWeight={700}>Odds Management</Typography>
            </Stack>

            {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && matches.length === 0 && (
                <Alert severity="info">No matches available for odds management.</Alert>
            )}

            <Stack spacing={2}>
                {matches.map(m => (
                    <Paper key={m.matchId} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                            <Box>
                                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {m.teamAFull || m.teamA} vs {m.teamBFull || m.teamB}
                                    </Typography>
                                    <Chip label={m.matchStatus} size="small" color={statusColor(m.matchStatus)} />
                                    {m.hasOddsHistory && (
                                        <Chip label="Has Odds" size="small" color="primary" variant="outlined" />
                                    )}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {m.tournament} &nbsp;·&nbsp; {m.format} &nbsp;·&nbsp; {m.uniqueNumber || `M${m.matchId}`}
                                </Typography>
                                {m.hasOddsHistory && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Stack direction="row" spacing={2} flexWrap="wrap">
                                            {m.latestTeam1Min != null && (
                                                <Typography variant="caption" color="text.secondary">
                                                    T1: <b>{m.latestTeam1Min} – {m.latestTeam1Max}</b>
                                                </Typography>
                                            )}
                                            {m.latestTeam2Min != null && (
                                                <Typography variant="caption" color="text.secondary">
                                                    T2: <b>{m.latestTeam2Min} – {m.latestTeam2Max}</b>
                                                </Typography>
                                            )}
                                            {m.latestDrawMin != null && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Draw: <b>{m.latestDrawMin} – {m.latestDrawMax}</b>
                                                </Typography>
                                            )}
                                            {m.latestSessionMin != null && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Session: <b>{m.latestSessionMin} – {m.latestSessionMax}</b>
                                                </Typography>
                                            )}
                                        </Stack>
                                    </>
                                )}
                            </Box>
                            <Button
                                variant="contained"
                                size="small"
                                endIcon={<ArrowForward />}
                                onClick={() => navigate(`/odds/${m.matchId}`)}
                                sx={{ textTransform: 'none', minWidth: 120 }}
                            >
                                Manage Odds
                            </Button>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
};

export default OddsListView;

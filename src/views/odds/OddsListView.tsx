import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Alert, Chip, Button, Paper
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import oddsApi from '../../api/odds/odds.api';
import { MatchWithOddsResponse } from '../../api/odds/types';

const statusInfo = (s: string) => {
    if (s === 'IN_PROGRESS') return { label: 'L', bg: '#4caf50' };
    if (s === 'COMPLETED') return { label: 'F', bg: '#e53935' };
    if (s === 'NOT_STARTED') return { label: 'NS', bg: '#757575' };
    return { label: s.charAt(0), bg: '#757575' };
};

const OddsListView = () => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<MatchWithOddsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await oddsApi.getAllMatches();
            setMatches(res.data.data);
            setError(null);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load');
        } finally { setLoading(false); }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight={700} mb={2} color="text.primary">
                Session Rooms
            </Typography>

            {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.paper' }}>
                                    {['Key', 'T1', 'T2', 'Format', 'Status', 'Order', 'UN', 'T1 Rate', 'T2 Rate', 'Draw', 'Session', 'Lambi', 'Time', 'Action'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {matches.map((m) => {
                                    const st = statusInfo(m.matchStatus);
                                    const isLive = m.matchStatus === 'IN_PROGRESS';
                                    const hasOdds = m.hasOddsHistory;
                                    return (
                                        <TableRow
                                            key={m.matchId}
                                            hover
                                            sx={{
                                                bgcolor: isLive ? 'rgba(76,175,80,0.06)' : 'inherit',
                                                '&:hover': { bgcolor: isLive ? 'rgba(76,175,80,0.1)' : 'action.hover' }
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 700, color: '#1565c0', fontSize: 13 }}>{m.matchKey}</TableCell>
                                            <TableCell sx={{ fontSize: 13 }}>{m.teamA}</TableCell>
                                            <TableCell sx={{ fontSize: 13 }}>{m.teamB}</TableCell>
                                            <TableCell sx={{ fontSize: 12 }}>{m.format || 'T20'}</TableCell>
                                            <TableCell>
                                                <Chip label={st.label} size="small"
                                                    sx={{ bgcolor: st.bg, color: '#fff', fontWeight: 700, height: 22, fontSize: 11, minWidth: 28 }} />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12 }}>{m.orderNumber}</TableCell>
                                            <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{m.uniqueNumber}</TableCell>

                                            {/* Inline odds values — shown after odds are set */}
                                            <TableCell sx={{ fontSize: 12, color: hasOdds ? '#1565c0' : 'text.disabled' }}>
                                                {hasOdds && m.latestTeam1Min != null
                                                    ? `${m.latestTeam1Min} - ${m.latestTeam1Max}`
                                                    : <Typography variant="caption" color="text.disabled">N/A</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: hasOdds ? '#1565c0' : 'text.disabled' }}>
                                                {hasOdds && m.latestTeam2Min != null
                                                    ? `${m.latestTeam2Min} - ${m.latestTeam2Max}`
                                                    : <Typography variant="caption" color="text.disabled">N/A</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12 }}>
                                                {hasOdds && m.latestDrawMin != null
                                                    ? `${m.latestDrawMin} - ${m.latestDrawMax}`
                                                    : <Typography variant="caption" color="text.disabled">N/A</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12 }}>
                                                {hasOdds && m.latestSessionMin != null
                                                    ? `${m.latestSessionMin} - ${m.latestSessionMax}`
                                                    : <Typography variant="caption" color="text.disabled">N/A</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12 }}>
                                                {hasOdds && m.latestLambiMin != null
                                                    ? `${m.latestLambiMin} - ${m.latestLambiMax}`
                                                    : <Typography variant="caption" color="text.disabled">N/A</Typography>}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                                {m.startTime
                                                    ? new Date(m.startTime).toLocaleString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {isLive ? (
                                                    <Button variant="contained" size="small"
                                                        onClick={() => navigate(`/odds/${m.matchId}`)}
                                                        sx={{
                                                            bgcolor: '#1565c0', fontSize: 11, px: 1.5, py: 0.4,
                                                            textTransform: 'none', whiteSpace: 'nowrap',
                                                            '&:hover': { bgcolor: '#0d47a1' }
                                                        }}>
                                                        Set Session
                                                    </Button>
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">N/A</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default OddsListView;

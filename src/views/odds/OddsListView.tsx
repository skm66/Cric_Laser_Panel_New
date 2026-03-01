import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Stack, Chip, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { AppButton, AppLink } from '../../components';
import { Add, Visibility } from '@mui/icons-material';
import oddsApi from '../../api/odds/odds.api';
import { MatchWithOddsResponse } from '../../api/odds/types';
import { useTheme } from '@mui/material';

const OddsListView = () => {
    const theme = useTheme();
    const [matches, setMatches] = useState<MatchWithOddsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const response = await oddsApi.getAllMatches();
            setMatches(response.data.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <Card elevation={0} sx={{ borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                                Odds Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Manage betting odds for matches
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box p={3}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                ) : matches.length === 0 ? (
                    <Box py={8} textAlign="center">
                        <Typography variant="h6" color="text.secondary">No matches available</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>MATCH</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TOURNAMENT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>START TIME</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {matches.map((match) => (
                                    <TableRow key={match.matchId} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{match.teamA} vs {match.teamB}</TableCell>
                                        <TableCell>{match.tournament}</TableCell>
                                        <TableCell>{new Date(match.startTime).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip label={match.matchStatus} size="small" color={match.matchStatus === 'LIVE' ? 'success' : 'default'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={match.hasOddsHistory ? "View Odds" : "Add Odds"}>
                                                <IconButton component={AppLink} to={`/odds/${match.matchId}`} size="small" color="primary">
                                                    {match.hasOddsHistory ? <Visibility fontSize="small" /> : <Add fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
        </Box>
    );
};

export default OddsListView;

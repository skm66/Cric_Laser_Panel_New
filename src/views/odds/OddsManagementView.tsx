import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Stack, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppButton } from '../../components';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import oddsApi from '../../api/odds/odds.api';
import { OddsHistoryRequest, OddsHistoryResponse } from '../../api/odds/types';
import { useTheme } from '@mui/material';

const OddsManagementView = () => {
    const theme = useTheme();
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const [odds, setOdds] = useState<OddsHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingOdds, setEditingOdds] = useState<OddsHistoryResponse | null>(null);
    const [formData, setFormData] = useState<OddsHistoryRequest>({
        matchNumber: '',
        team1Min: 0,
        team1Max: 0,
        team2Min: 0,
        team2Max: 0,
        drawMin: 0,
        drawMax: 0,
        overNumber: 0,
        sessionMin: 0,
        sessionMax: 0,
        lambiMin: 0,
        lambiMax: 0,
    });

    useEffect(() => {
        if (matchId) fetchOdds();
    }, [matchId]);

    const fetchOdds = async () => {
        setLoading(true);
        try {
            const response = await oddsApi.getOddsHistoryByMatch(Number(matchId));
            setOdds(response.data.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load odds');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (odds?: OddsHistoryResponse) => {
        if (odds) {
            setEditingOdds(odds);
            setFormData({
                matchNumber: odds.matchNumber,
                team1Min: odds.team1Min,
                team1Max: odds.team1Max,
                team2Min: odds.team2Min,
                team2Max: odds.team2Max,
                drawMin: odds.drawMin,
                drawMax: odds.drawMax,
                overNumber: odds.overNumber,
                sessionMin: odds.sessionMin,
                sessionMax: odds.sessionMax,
                lambiMin: odds.lambiMin,
                lambiMax: odds.lambiMax,
            });
        } else {
            setEditingOdds(null);
            setFormData({
                matchNumber: '',
                team1Min: 0,
                team1Max: 0,
                team2Min: 0,
                team2Max: 0,
                drawMin: 0,
                drawMax: 0,
                overNumber: 0,
                sessionMin: 0,
                sessionMax: 0,
                lambiMin: 0,
                lambiMax: 0,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingOdds(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingOdds) {
                await oddsApi.updateOddsHistory(editingOdds.id, formData);
            } else {
                await oddsApi.createOddsHistory(Number(matchId), formData);
            }
            handleCloseDialog();
            fetchOdds();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save odds');
        }
    };

    const handleDelete = async (oddsId: number) => {
        if (window.confirm('Are you sure you want to delete this odds entry?')) {
            try {
                await oddsApi.deleteOddsHistory(oddsId);
                fetchOdds();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete odds');
            }
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <Card elevation={0} sx={{ borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <IconButton onClick={() => navigate('/odds')} size="small">
                                    <ArrowBack />
                                </IconButton>
                                <Box>
                                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                                        Match Odds
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Manage odds for match #{matchId}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        <AppButton variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                            Add Odds
                        </AppButton>
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
                ) : odds.length === 0 ? (
                    <Box py={8} textAlign="center">
                        <Typography variant="h6" color="text.secondary">No odds entries yet</Typography>
                        <Typography variant="body2" color="text.secondary">Click "Add Odds" to create one</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>MATCH #</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TEAM 1</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TEAM 2</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>DRAW</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>SESSION</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {odds.map((odd) => (
                                    <TableRow key={odd.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{odd.matchNumber}</TableCell>
                                        <TableCell>{odd.team1Min} - {odd.team1Max}</TableCell>
                                        <TableCell>{odd.team2Min} - {odd.team2Max}</TableCell>
                                        <TableCell>{odd.drawMin} - {odd.drawMax}</TableCell>
                                        <TableCell>{odd.sessionMin} - {odd.sessionMax}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => handleOpenDialog(odd)} size="small" color="primary">
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleDelete(odd.id)} size="small" color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingOdds ? 'Edit Odds' : 'Add Odds'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Match Number" value={formData.matchNumber} onChange={(e) => setFormData({ ...formData, matchNumber: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Team 1 Min" value={formData.team1Min} onChange={(e) => setFormData({ ...formData, team1Min: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Team 1 Max" value={formData.team1Max} onChange={(e) => setFormData({ ...formData, team1Max: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Team 2 Min" value={formData.team2Min} onChange={(e) => setFormData({ ...formData, team2Min: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Team 2 Max" value={formData.team2Max} onChange={(e) => setFormData({ ...formData, team2Max: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Draw Min" value={formData.drawMin} onChange={(e) => setFormData({ ...formData, drawMin: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Draw Max" value={formData.drawMax} onChange={(e) => setFormData({ ...formData, drawMax: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth type="number" label="Over Number" value={formData.overNumber} onChange={(e) => setFormData({ ...formData, overNumber: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Session Min" value={formData.sessionMin} onChange={(e) => setFormData({ ...formData, sessionMin: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Session Max" value={formData.sessionMax} onChange={(e) => setFormData({ ...formData, sessionMax: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Lambi Min" value={formData.lambiMin} onChange={(e) => setFormData({ ...formData, lambiMin: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Lambi Max" value={formData.lambiMax} onChange={(e) => setFormData({ ...formData, lambiMax: Number(e.target.value) })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <AppButton onClick={handleCloseDialog}>Cancel</AppButton>
                    <AppButton onClick={handleSubmit} variant="contained">{editingOdds ? 'Update' : 'Create'}</AppButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OddsManagementView;

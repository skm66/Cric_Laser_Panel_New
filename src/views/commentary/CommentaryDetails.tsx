import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    CircularProgress,
    Divider,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit as EditIcon, ArrowBack } from '@mui/icons-material';
import { MatchService } from '../../api/match/matches.api';
import { commentaryService, Commentary, OverSummary } from '../../api/match/commentary.api';
import { MatchResponse } from '../../api/match/matchResponse';
import { AppButton } from '../../components';
import { LiveMatchDto } from '../../api/match/LiveMatchResponse';

const CommentaryDetails: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<MatchResponse | null>(null);
    const [commentaries, setCommentaries] = useState<Commentary[]>([]);
    const [overSummaries, setOverSummaries] = useState<OverSummary[]>([]);
    const [liveData, setLiveData] = useState<LiveMatchDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState<Commentary | null>(null);
    const [editText, setEditText] = useState('');

    const matchService = new MatchService();

    useEffect(() => {
        const fetchData = async () => {
            if (!matchId) return;
            try {
                // Fetch commentary
                const commRes = await commentaryService.getCommentary(matchId);
                if (commRes.data.success) {
                    setCommentaries(commRes.data.data);
                }

                // Fetch Over Summaries
                const sumRes = await commentaryService.getOverSummaries(matchId);
                if (sumRes.data.success) {
                    setOverSummaries(sumRes.data.data);
                }

                // Fetch Live Match Data (Detailed Scorecard)
                try {
                    const liveDataResponse = await matchService.getLiveMatch(matchId);
                    if (liveDataResponse) {
                        setLiveData(liveDataResponse);
                    }
                } catch (e) {
                    console.error("Failed to fetch live match data", e);
                }


                // Fetch matches for header info (only if not loaded)
                if (!match) {
                    const matchesList = await matchService.queryMatches();
                    if (Array.isArray(matchesList)) {
                        const found = matchesList.find((m: MatchResponse) => m.liveMatchId === matchId);
                        if (found) setMatch(found);
                    }
                }

                setLoading(false); // Only set loading false after first fetch
            } catch (error) {
                console.error("Error fetching data", error);
                setLoading(false);
            }
        };

        fetchData(); // Initial fetch

        const intervalId = setInterval(fetchData, 1000); // Poll every 1 second for instant updates

        return () => clearInterval(intervalId); // Cleanup
    }, [matchId, match]);

    const handleEditClick = (item: Commentary) => {
        setEditItem(item);
        setEditText(item.commentaryText);
    };

    const handleClose = () => {
        setEditItem(null);
        setEditText('');
    };

    const handleSave = async () => {
        if (!editItem) return;
        try {
            await commentaryService.updateCommentary(editItem.id, editText);
            setCommentaries(prev => prev.map(c => c.id === editItem.id ? { ...c, commentaryText: editText } : c));
            handleClose();
        } catch (error) {
            console.error("Failed to update commentary", error);
            alert("Failed to update commentary");
        }
    };

    // Grouping Logic
    const groupedCommentary = commentaries.reduce((acc, curr) => {
        const over = curr.overNumber;
        if (!acc[over]) acc[over] = [];
        acc[over].push(curr);
        return acc;
    }, {} as Record<number, Commentary[]>);

    const sortedOverNumbers = Object.keys(groupedCommentary).map(Number).sort((a, b) => b - a);

    // Calculate live card stats from liveData
    const getLiveCardStats = () => {
        if (!liveData || !liveData.innings || liveData.innings.length === 0) return null;
        // Last inning is usually current? Or check for state/result?
        // Let's take the last inning in the list as current.
        const currentInning = liveData.innings[liveData.innings.length - 1];

        const striker = currentInning.batters.find(b => b.id === currentInning.currentStrikerId);
        const nonStriker = currentInning.batters.find(b => b.id === currentInning.currentNonStrikerId);
        const bowler = currentInning.bowlers.find(b => b.id === currentInning.currentOver?.bowlerId);

        return {
            striker, nonStriker, bowler,
            score: currentInning.total || currentInning.currentScore || "0-0",
            // total format might be "268/3 (45.3)" or just "268-3"
            teamText: currentInning.title || "Score"
        };
    };

    const liveStats = getLiveCardStats();


    if (loading) return <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 0, bgcolor: '#f4f5f7', minHeight: '100vh' }}>
            <Box sx={{ bgcolor: '#fff', p: 2, borderBottom: '1px solid #e0e0e0', mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={() => navigate('/commentary')}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {match ? `${match.teamA.teamName} vs ${match.teamB.teamName} ` : 'Match Commentary'}
                        </Typography>
                        {match && (
                            <Typography variant="body2" color="text.secondary">
                                {match.matchStatus} | {match.tournamentName}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
                {commentaries.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography>No commentary available yet.</Typography>
                    </Paper>
                )}

                {sortedOverNumbers.map(overNum => {
                    const balls = groupedCommentary[overNum];
                    // Sort balls by ball number descending for display list, but we need correct order for timeline
                    const ballsForTimeline = [...balls].sort((a, b) => a.ballNumber - b.ballNumber);

                    const timeline = ballsForTimeline.map(b => b.runs).join(' ');
                    const timelineRuns = balls.reduce((sum, b) => {
                        if (b.runs === '4') return sum + 4;
                        if (b.runs === '6') return sum + 6;
                        if (['W', 'Wd', 'NB'].includes(b.runs)) return sum; // Wd/NB might have runs attached in future, simplifying for now
                        // For extras, usually we count 1, but runs string might be just 'Wd'.
                        // Assuming strict 'Wd' string means 1 run extra ideally, but parser logic above used 0.
                        // Let's keep it simple or user-defined.
                        return sum + (parseInt(b.runs) || 0);
                    }, 0);

                    const summary = overSummaries.find(s => s.overNumber === overNum);

                    return (
                        <Box key={overNum} sx={{ mb: 3 }}>
                            {summary ? (
                                <Paper
                                    elevation={3}
                                    sx={{
                                        bgcolor: '#1E293B', // Dark Slate Blue for high visibility
                                        color: '#fff',
                                        p: 2,
                                        mb: 1,
                                        borderRadius: 2
                                    }}
                                >
                                    {/* Top Row: OVER number | Timeline | Total Runs */}
                                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                                        <Typography variant="body2" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                                            OVER {overNum}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1, fontWeight: 500 }}>
                                            {timeline} <span style={{ opacity: 0.6 }}>({timelineRuns} RUNS)</span>
                                        </Typography>
                                    </Stack>

                                    <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                                    {/* Bottom Grid: Team Score | Batsmen | Bowler */}
                                    <Grid container spacing={2} alignItems="center">
                                        {/* Left Col: Team Score and Name */}
                                        <Grid item xs={3} sm={2} sx={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#93C5FD', fontSize: '0.75rem', lineHeight: 1.2 }}>
                                                {/* Assuming we might want team name here, using placeholder or deriving if available later. 
                                                    For now match data has team names. 
                                                    Typically summary doesn't explicitly have batting team name, but we can infer or hardcode based on inning.
                                                    Let's just show Score cleanly as requested. 
                                                */}
                                                {/* Ideally we'd show the batting team code (e.g. NZ) but let's stick to score for now if code unavailable */}
                                                SCORE
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4ADE80' }}>
                                                {summary.teamTotalRuns}-{summary.teamTotalWickets}
                                            </Typography>
                                        </Grid>

                                        {/* Middle Col: Batsmen Stats */}
                                        <Grid item xs={9} sm={6}>
                                            <Stack spacing={0.5}>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" fontWeight="500">{summary.strikerName}</Typography>
                                                    <Typography variant="body2">{summary.strikerRuns}({summary.strikerBalls})</Typography>
                                                </Stack>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography variant="body2" fontWeight="500" sx={{ opacity: 0.8 }}>{summary.nonStrikerName}</Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{summary.nonStrikerRuns}({summary.nonStrikerBalls})</Typography>
                                                </Stack>
                                            </Stack>
                                        </Grid>

                                        {/* Right Col: Bowler Stats */}
                                        <Grid item xs={12} sm={4}>
                                            <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-end' }} spacing={2}>
                                                <Box textAlign={{ xs: 'left', sm: 'right' }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#93C5FD' }}>{summary.bowlerName}</Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                        {summary.bowlerOvers}-{summary.bowlerMaidens}-{summary.bowlerRuns}-{summary.bowlerWickets}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ) : (
                                // Provisional Summary Card for Live/In-Progress Over
                                <Paper
                                    elevation={1}
                                    sx={{
                                        bgcolor: '#334155',
                                        color: '#fff',
                                        p: 2,
                                        mb: 1,
                                        borderRadius: 2,
                                        borderLeft: '4px solid #FACC15' // Yellow accent for "Live"
                                    }}
                                >
                                    {/* Matches structure of the main summary but with live data */}
                                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                                        <Typography variant="body2" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                                            OVER {overNum}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1, fontWeight: 500 }}>
                                            {timeline || "Waiting..."} <span style={{ opacity: 0.6 }}>({timelineRuns} RUNS)</span>
                                        </Typography>
                                        <Chip label="LIVE" size="small" color="warning" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 'bold' }} />
                                    </Stack>

                                    <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                                    {/* If we have liveStats, show them in same grid format, else show Loading */}
                                    {liveStats ? (
                                        <Grid container spacing={2} alignItems="center">
                                            {/* Score */}
                                            <Grid item xs={3} sm={2} sx={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#93C5FD', fontSize: '0.75rem' }}>
                                                    SCORE
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#4ADE80' }}>
                                                    {liveStats.score}
                                                </Typography>
                                            </Grid>

                                            {/* Batsmen */}
                                            <Grid item xs={9} sm={6}>
                                                <Stack spacing={0.5}>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="500">{liveStats.striker?.name || "Striker"}</Typography>
                                                        <Typography variant="body2">{liveStats.striker?.runs || 0}({liveStats.striker?.balls || 0})</Typography>
                                                    </Stack>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight="500" sx={{ opacity: 0.8 }}>{liveStats.nonStriker?.name || "Non-Striker"}</Typography>
                                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{liveStats.nonStriker?.runs || 0}({liveStats.nonStriker?.balls || 0})</Typography>
                                                    </Stack>
                                                </Stack>
                                            </Grid>

                                            {/* Bowler */}
                                            <Grid item xs={12} sm={4}>
                                                <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-end' }} spacing={2}>
                                                    <Box textAlign={{ xs: 'left', sm: 'right' }}>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#93C5FD' }}>{liveStats.bowler?.name || "Bowler"}</Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                            {liveStats.bowler?.overs || "0.0"}-{liveStats.bowler?.maidens || 0}-{liveStats.bowler?.runsConceded || 0}-{liveStats.bowler?.wickets || 0}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Box sx={{ opacity: 0.6, fontSize: '0.875rem' }}>Loading live stats...</Box>
                                    )}
                                </Paper>
                            )}

                            <Paper square elevation={0} sx={{ bgcolor: '#fff' }}>
                                {balls.map((item) => (
                                    <Box key={item.id}>
                                        <Stack direction="row" spacing={2} sx={{ p: 2, '&:hover': { bgcolor: '#f9f9f9' } }}>
                                            <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 40, color: '#333' }}>
                                                {item.overNumber - 1}.{item.ballNumber}
                                            </Typography>
                                            <Box flex={1}>
                                                <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6 }}>
                                                    <span style={{ fontWeight: 600 }}>{item.bowlerName} to {item.batterName}, </span>
                                                    {item.commentaryText}
                                                </Typography>
                                            </Box>
                                            <Stack alignItems="center" spacing={0.5}>
                                                {item.runs === 'W' || ['4', '6'].includes(item.runs) ? (
                                                    <Chip label={item.runs} size="small" color={item.runs === 'W' ? 'error' : 'success'} sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                                                ) : null}
                                                <IconButton size="small" onClick={() => handleEditClick(item)} sx={{ opacity: 0.5 }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Stack>
                                        <Divider light />
                                    </Box>
                                ))}
                            </Paper>
                        </Box>
                    );
                })}
            </Box>

            <Dialog open={!!editItem} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit Commentary</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Commentary Text"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <AppButton onClick={handleClose} variant="text" color="secondary">Cancel</AppButton>
                    <AppButton onClick={handleSave} variant="contained" color="primary">Save</AppButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CommentaryDetails;

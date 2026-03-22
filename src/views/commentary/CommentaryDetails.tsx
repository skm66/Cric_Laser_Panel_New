import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Stack, CircularProgress, Divider,
    Chip, IconButton, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit as EditIcon, ArrowBack, EmojiEvents, SportsCricket } from '@mui/icons-material';
import { MatchService } from '../../api/match/matches.api';
import { commentaryService, Commentary, OverSummary, MatchSummary } from '../../api/match/commentary.api';
import { MatchResponse } from '../../api/match/matchResponse';
import { AppButton } from '../../components';
import { LiveMatchDto } from '../../api/match/LiveMatchResponse';

const CommentaryDetails: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<MatchResponse | null>(null);
    const [commentaries, setCommentaries] = useState<Commentary[]>([]);
    const [overSummaries, setOverSummaries] = useState<OverSummary[]>([]);
    const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
    const [liveData, setLiveData] = useState<LiveMatchDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState<Commentary | null>(null);
    const [editText, setEditText] = useState('');

    const matchService = new MatchService();

    useEffect(() => {
        const fetchData = async () => {
            if (!matchId) return;
            try {
                const [commRes, sumRes] = await Promise.all([
                    commentaryService.getCommentary(matchId),
                    commentaryService.getOverSummaries(matchId),
                ]);
                if (commRes.data.success) setCommentaries(commRes.data.data);
                if (sumRes.data.success) setOverSummaries(sumRes.data.data);

                // Load match summary (scorecard + result)
                try {
                    const summaryRes = await commentaryService.getMatchSummary(matchId);
                    if (summaryRes.data.success) setMatchSummary(summaryRes.data.data);
                } catch (e) { /* ignore */ }

                try {
                    const liveDataResponse = await matchService.getLiveMatch(matchId);
                    if (liveDataResponse) setLiveData(liveDataResponse);
                } catch (e) { /* match may be completed */ }

                if (!match) {
                    const matchesList = await matchService.queryMatches();
                    if (Array.isArray(matchesList)) {
                        const found = matchesList.find((m: MatchResponse) => m.liveMatchId === matchId);
                        if (found) setMatch(found);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 3000);
        return () => clearInterval(intervalId);
    }, [matchId]);

    const handleEditClick = (item: Commentary) => { setEditItem(item); setEditText(item.commentaryText); };
    const handleClose = () => { setEditItem(null); setEditText(''); };
    const handleSave = async () => {
        if (!editItem) return;
        try {
            await commentaryService.updateCommentary(editItem.id, editText);
            setCommentaries(prev => prev.map(c => c.id === editItem.id ? { ...c, commentaryText: editText } : c));
            handleClose();
        } catch (error) { alert("Failed to update commentary"); }
    };

    // Separate result entry from normal commentary
    const resultEntry = commentaries.find(c => c.runs === 'RESULT');
    const normalCommentaries = commentaries.filter(c => c.runs !== 'RESULT');

    // Group by innings
    const inningsNumbers = [...new Set(normalCommentaries.map(c => c.inningsNumber || 1))].sort((a, b) => a - b);

    const getLiveCardStats = () => {
        if (!liveData || !liveData.innings || liveData.innings.length === 0) return null;
        const currentInning = liveData.innings[liveData.innings.length - 1];
        const striker = currentInning.batters.find(b => b.id === currentInning.currentStrikerId);
        const nonStriker = currentInning.batters.find(b => b.id === currentInning.currentNonStrikerId);
        const bowler = currentInning.bowlers.find(b => b.id === currentInning.currentOver?.bowlerId);
        return {
            striker, nonStriker, bowler,
            score: currentInning.total || currentInning.currentScore || "0-0",
            teamText: currentInning.title || "Score"
        };
    };
    const liveStats = getLiveCardStats();

    const isCompleted = matchSummary?.matchStatus === 'COMPLETED' || !!resultEntry;

    if (loading) return <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 0, bgcolor: '#f4f5f7', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ bgcolor: '#fff', p: 2, borderBottom: '1px solid #e0e0e0', mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={() => navigate('/commentary')}><ArrowBack /></IconButton>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {match ? `${match.teamA.teamName} vs ${match.teamB.teamName}` : 'Match Commentary'}
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

                {/* ── Match Scorecard ── */}
                {matchSummary && matchSummary.innings && matchSummary.innings.length > 0 && (
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                            <SportsCricket sx={{ color: '#1565c0', fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={700} color="primary">
                                MATCH SCORECARD
                            </Typography>
                            <Chip
                                label={isCompleted ? 'COMPLETED' : 'LIVE'}
                                size="small"
                                color={isCompleted ? 'default' : 'warning'}
                                sx={{ ml: 'auto', fontWeight: 700, fontSize: '0.65rem' }}
                            />
                        </Stack>
                        <Divider sx={{ mb: 1.5 }} />
                        {matchSummary.innings.map((inn) => (
                            <Stack key={inn.inningsNumber} direction="row" alignItems="center"
                                justifyContent="space-between" sx={{ py: 0.75 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 140 }}>
                                    {inn.battingTeam}
                                </Typography>
                                <Typography variant="body1" fontWeight={800} sx={{ color: '#1565c0', minWidth: 80 }}>
                                    {inn.runs}/{inn.wickets}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ({inn.overs} ov)
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    Innings {inn.inningsNumber}
                                </Typography>
                            </Stack>
                        ))}
                    </Paper>
                )}

                {/* ── Match Result Banner ── */}
                {(resultEntry || (matchSummary?.result && isCompleted)) && (
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#1a3a1a', color: '#fff', borderRadius: 2, border: '2px solid #4caf50' }}>
                        <Stack direction="row" alignItems="center" gap={2}>
                            <EmojiEvents sx={{ color: '#ffd700', fontSize: 36 }} />
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Match Result
                                </Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ color: '#4caf50' }}>
                                    {resultEntry
                                        ? resultEntry.commentaryText.replace('MATCH RESULT: ', '')
                                        : matchSummary?.result}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                )}

                {normalCommentaries.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography>No commentary available yet.</Typography>
                    </Paper>
                )}

                {/* ── Innings Commentary ── */}
                {inningsNumbers.map(inningsNum => {
                    const inningsCommentaries = normalCommentaries.filter(c => (c.inningsNumber || 1) === inningsNum);
                    const inningsOverSummaries = overSummaries.filter(s => (s.inningsNumber || 1) === inningsNum);

                    // Determine innings title from scorecard or liveData
                    const scorecardInnings = matchSummary?.innings?.find(i => i.inningsNumber === inningsNum);
                    const inningsTitle = scorecardInnings
                        ? `${scorecardInnings.battingTeam} — ${scorecardInnings.runs}/${scorecardInnings.wickets} (${scorecardInnings.overs} ov)`
                        : liveData?.innings?.[inningsNum - 1]?.title || `Innings ${inningsNum}`;

                    const grouped = inningsCommentaries.reduce((acc, curr) => {
                        const over = curr.overNumber;
                        if (!acc[over]) acc[over] = [];
                        acc[over].push(curr);
                        return acc;
                    }, {} as Record<number, Commentary[]>);

                    const sortedOvers = Object.keys(grouped).map(Number).sort((a, b) => b - a);

                    return (
                        <Box key={inningsNum} mb={4}>
                            {/* Innings Header */}
                            <Box sx={{ bgcolor: '#1E293B', color: '#fff', px: 2, py: 1.5, borderRadius: 1, mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#93C5FD' }}>
                                    Innings {inningsNum}: {inningsTitle}
                                </Typography>
                            </Box>

                            {sortedOvers.map(overNum => {
                                const balls = grouped[overNum];
                                const ballsForTimeline = [...balls].sort((a, b) => a.ballNumber - b.ballNumber);
                                const timeline = ballsForTimeline.map(b => b.runs).join(' ');
                                const timelineRuns = balls.reduce((sum, b) => {
                                    if (b.runs === '4') return sum + 4;
                                    if (b.runs === '6') return sum + 6;
                                    if (['W', 'Wd', 'NB'].includes(b.runs)) return sum;
                                    return sum + (parseInt(b.runs) || 0);
                                }, 0);

                                const summary = inningsOverSummaries.find(s => s.overNumber === overNum - 1);

                                return (
                                    <Box key={overNum} sx={{ mb: 3 }}>
                                        {summary ? (
                                            <Paper elevation={3} sx={{ bgcolor: '#1E293B', color: '#fff', p: 2, mb: 1, borderRadius: 2 }}>
                                                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                                                    <Typography variant="body2" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                                                        OVER {overNum}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1, fontWeight: 500 }}>
                                                        {timeline} <span style={{ opacity: 0.6 }}>({timelineRuns} RUNS)</span>
                                                    </Typography>
                                                </Stack>
                                                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid size={{ xs: 3, sm: 2 }} sx={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#93C5FD', fontSize: '0.75rem' }}>SCORE</Typography>
                                                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#4ADE80' }}>
                                                            {summary.teamTotalRuns}-{summary.teamTotalWickets}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 9, sm: 6 }}>
                                                        <Stack spacing={0.5}>
                                                            <Stack direction="row" justifyContent="space-between">
                                                                <Typography variant="body2" fontWeight="500">{summary.strikerName}</Typography>
                                                                <Typography variant="body2">{summary.strikerRuns}({summary.strikerBalls})</Typography>
                                                            </Stack>
                                                            <Stack direction="row" justifyContent="space-between">
                                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>{summary.nonStrikerName}</Typography>
                                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>{summary.nonStrikerRuns}({summary.nonStrikerBalls})</Typography>
                                                            </Stack>
                                                        </Stack>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 4 }}>
                                                        <Box textAlign={{ xs: 'left', sm: 'right' }}>
                                                            <Typography variant="body2" fontWeight="bold" sx={{ color: '#93C5FD' }}>{summary.bowlerName}</Typography>
                                                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                                {summary.bowlerOvers}-{summary.bowlerMaidens}-{summary.bowlerRuns}-{summary.bowlerWickets}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        ) : (
                                            <Paper elevation={1} sx={{ bgcolor: '#334155', color: '#fff', p: 2, mb: 1, borderRadius: 2, borderLeft: '4px solid #FACC15' }}>
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
                                                {liveStats ? (
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid size={{ xs: 3, sm: 2 }} sx={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#93C5FD', fontSize: '0.75rem' }}>SCORE</Typography>
                                                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#4ADE80' }}>{liveStats.score}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 9, sm: 6 }}>
                                                            <Stack spacing={0.5}>
                                                                <Stack direction="row" justifyContent="space-between">
                                                                    <Typography variant="body2" fontWeight="500">{liveStats.striker?.name || "Striker"}</Typography>
                                                                    <Typography variant="body2">{liveStats.striker?.runs || 0}({liveStats.striker?.balls || 0})</Typography>
                                                                </Stack>
                                                                <Stack direction="row" justifyContent="space-between">
                                                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{liveStats.nonStriker?.name || "Non-Striker"}</Typography>
                                                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{liveStats.nonStriker?.runs || 0}({liveStats.nonStriker?.balls || 0})</Typography>
                                                                </Stack>
                                                            </Stack>
                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 4 }}>
                                                            <Box textAlign={{ xs: 'left', sm: 'right' }}>
                                                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#93C5FD' }}>{liveStats.bowler?.name || "Bowler"}</Typography>
                                                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                                    {liveStats.bowler?.overs || "0.0"}-{liveStats.bowler?.maidens || 0}-{liveStats.bowler?.runsConceded || 0}-{liveStats.bowler?.wickets || 0}
                                                                </Typography>
                                                            </Box>
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
                                                                {item.commentaryText}
                                                            </Typography>
                                                        </Box>
                                                        <Stack alignItems="center" spacing={0.5}>
                                                            {(item.runs === 'W' || ['4', '6'].includes(item.runs)) && (
                                                                <Chip label={item.runs} size="small" color={item.runs === 'W' ? 'error' : 'success'} sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                                                            )}
                                                            <IconButton size="small" onClick={() => handleEditClick(item)} sx={{ opacity: 0.5 }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    </Stack>
                                                    <Divider />
                                                </Box>
                                            ))}
                                        </Paper>
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            <Dialog open={!!editItem} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit Commentary</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Commentary Text" type="text" fullWidth multiline rows={3}
                        value={editText} onChange={(e) => setEditText(e.target.value)} />
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

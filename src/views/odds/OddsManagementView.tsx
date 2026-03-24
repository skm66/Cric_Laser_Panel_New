import {
    Box, Typography, Stack, IconButton, TextField, Button,
    Divider, CircularProgress, Alert, Paper, Chip, Select, MenuItem
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Add, Remove, ArrowBack, Wifi } from '@mui/icons-material';
import oddsApi from '../../api/odds/odds.api';
import { OddsHistoryRequest, OddsHistoryResponse } from '../../api/odds/types';
import { useWebSocketSubscription } from '../../hooks/useWebSocketSubscription';

const STEP = 0.01;

const mkForm = (): OddsHistoryRequest => ({
    matchNumber: '', team1Min: 0.01, team1Max: 0.01,
    team2Min: 0.01, team2Max: 0.01, drawMin: 0.01, drawMax: 0.01,
    overNumber: 0, sessionMin: 0, sessionMax: 0, lambiMin: 0, lambiMax: 0,
});

const bluBtn = {
    bgcolor: '#1976d2', color: '#fff', borderRadius: 1, p: 0.5,
    '&:hover': { bgcolor: '#1565c0' }, minWidth: 32, minHeight: 32,
};

const NF = ({ label, value, onChange }: { label?: string; value: number; onChange: (v: number) => void }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 90 }}>
        {label && <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3, fontSize: 10 }}>{label}</Typography>}
        <TextField
            size="small" type="number" value={value}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            slotProps={{ htmlInput: { step: STEP, style: { textAlign: 'center', padding: '6px 8px', fontSize: 14 } } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
    </Box>
);

const RateSection = ({ title, minVal, maxVal, onMin, onMax, onPlus, onMinus }: {
    title: string; minVal: number; maxVal: number;
    onMin: (v: number) => void; onMax: (v: number) => void;
    onPlus: () => void; onMinus: () => void;
}) => (
    <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: 15 }}>{title}</Typography>
        <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <NF label="Min" value={minVal} onChange={onMin} />
            <NF label="Max" value={maxVal} onChange={onMax} />
            <IconButton size="small" onClick={onPlus} sx={bluBtn}><Add sx={{ fontSize: 18 }} /></IconButton>
            <IconButton size="small" onClick={onMinus} sx={bluBtn}><Remove sx={{ fontSize: 18 }} /></IconButton>
        </Stack>
    </Box>
);

const OddsManagementView = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();

    const [odds, setOdds] = useState<OddsHistoryResponse[]>([]);
    const [liveOdds, setLiveOdds] = useState<OddsHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<OddsHistoryRequest>(mkForm());
    const [teamAName, setTeamAName] = useState('Team 1');
    const [teamBName, setTeamBName] = useState('Team 2');
    const [matchHeader, setMatchHeader] = useState('');

    useWebSocketSubscription<OddsHistoryResponse>({
        endpoint: process.env.REACT_APP_WEB_SOCKET_URL || 'http://localhost:8080/live-match',
        topic: `/topic/odds/${matchId}`,
        onMessage: useCallback((data: OddsHistoryResponse) => {
            setLiveOdds(data);
            setOdds(prev => {
                const exists = prev.find(o => o.id === data.id);
                return exists ? prev.map(o => o.id === data.id ? data : o) : [data, ...prev];
            });
        }, []),
    });

    useEffect(() => { if (matchId) load(); }, [matchId]); // eslint-disable-line react-hooks/exhaustive-deps

    const load = async () => {
        setLoading(true);
        try {
            const res = await oddsApi.getOddsHistoryByMatch(Number(matchId));
            const list: OddsHistoryResponse[] = res.data.data;
            setOdds(list);
            if (list.length > 0) {
                const latest = list[0];
                const tA = latest.teamAName || 'Team 1';
                const tB = latest.teamBName || 'Team 2';
                setTeamAName(tA);
                setTeamBName(tB);
                setMatchHeader(`Match Number - ${latest.matchNumber}`);
                setForm({
                    matchNumber: latest.matchNumber,
                    team1Min: latest.team1Min, team1Max: latest.team1Max,
                    team2Min: latest.team2Min, team2Max: latest.team2Max,
                    drawMin: latest.drawMin ?? 0.01, drawMax: latest.drawMax ?? 0.01,
                    overNumber: latest.overNumber ?? 0,
                    sessionMin: latest.sessionMin ?? 0, sessionMax: latest.sessionMax ?? 0,
                    lambiMin: latest.lambiMin ?? 0, lambiMax: latest.lambiMax ?? 0,
                });
            } else {
                setMatchHeader(`Match Number - M${matchId}`);
                setForm(f => ({ ...f, matchNumber: `M${matchId}` }));
            }
            setError(null);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load');
        } finally { setLoading(false); }
    };

    const s = (k: keyof OddsHistoryRequest, v: number | string) => setForm(f => ({ ...f, [k]: v }));
    const bump = (k: keyof OddsHistoryRequest, dir: 1 | -1) =>
        setForm(f => ({ ...f, [k]: Math.max(0, parseFloat(((Number(f[k]) || 0) + dir * STEP).toFixed(2))) }));

    const submit = async () => {
        setSaving(true);
        try {
            await oddsApi.createOddsHistory(Number(matchId), form);
            await load();
            setError(null);
        } catch (e: any) { setError(e.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const removeRate = async () => {
        if (!odds.length || !window.confirm('Remove latest rate?')) return;
        try { await oddsApi.deleteOddsHistory(odds[0].id); await load(); }
        catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
    };

    const updateSession = async () => {
        setSaving(true);
        try {
            if (odds.length > 0) await oddsApi.updateOddsHistory(odds[0].id, form);
            else await oddsApi.createOddsHistory(Number(matchId), form);
            await load();
        } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    return (
        <Box sx={{ p: 2, maxWidth: 640, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <IconButton size="small" onClick={() => navigate('/odds')} sx={{ color: 'text.secondary' }}>
                    <ArrowBack fontSize="small" />
                </IconButton>
                <Typography variant="body2" color="text.secondary">Session Rooms</Typography>
                {liveOdds && <Chip icon={<Wifi />} label="Live" color="success" size="small" />}
            </Stack>

            <Paper elevation={2} sx={{ borderRadius: 2, p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                    {matchHeader || `Match Number - M${matchId}`}
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    {[
                        { label: 'Team 1', val: form.team1Min },
                        { label: 'Team 2', val: form.team2Min },
                        { label: 'Draw', val: form.drawMin ?? 0.01 },
                        { label: 'Session', val: form.sessionMin ?? 1 },
                        { label: 'Lambi', val: form.lambiMin ?? 1 },
                    ].map(item => (
                        <Box key={item.label} sx={{ minWidth: 72 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{item.label}</Typography>
                            <Select size="small" value={item.val}
                                sx={{ fontSize: 13, height: 30, minWidth: 72, '.MuiSelect-select': { py: 0.5, px: 1 } }}
                                onChange={() => {}}>
                                <MenuItem value={item.val}>{item.val}</MenuItem>
                            </Select>
                        </Box>
                    ))}
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : (
                <Paper elevation={2} sx={{ borderRadius: 2, p: 2.5, mb: 2 }}>
                    <RateSection title={teamAName}
                        minVal={form.team1Min} maxVal={form.team1Max}
                        onMin={v => s('team1Min', v)} onMax={v => s('team1Max', v)}
                        onPlus={() => { bump('team1Min', 1); bump('team1Max', 1); }}
                        onMinus={() => { bump('team1Min', -1); bump('team1Max', -1); }} />

                    <RateSection title={teamBName}
                        minVal={form.team2Min} maxVal={form.team2Max}
                        onMin={v => s('team2Min', v)} onMax={v => s('team2Max', v)}
                        onPlus={() => { bump('team2Min', 1); bump('team2Max', 1); }}
                        onMinus={() => { bump('team2Min', -1); bump('team2Max', -1); }} />

                    <RateSection title="Draw"
                        minVal={form.drawMin ?? 0.01} maxVal={form.drawMax ?? 0.01}
                        onMin={v => s('drawMin', v)} onMax={v => s('drawMax', v)}
                        onPlus={() => { bump('drawMin', 1); bump('drawMax', 1); }}
                        onMinus={() => { bump('drawMin', -1); bump('drawMax', -1); }} />

                    <Stack direction="row" spacing={1.5} mb={3}>
                        <Button variant="contained" disabled={saving} onClick={submit}
                            sx={{ bgcolor: '#1976d2', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#1565c0' } }}>
                            Submit
                        </Button>
                        <Button variant="contained" disabled={saving || !odds.length} onClick={removeRate}
                            sx={{ bgcolor: '#1976d2', textTransform: 'none', px: 2, '&:hover': { bgcolor: '#1565c0' } }}>
                            Remove Rate
                        </Button>
                    </Stack>

                    <Divider sx={{ mb: 2.5 }} />

                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: 15 }}>Session Score</Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-end" mb={1.5}>
                        <NF label="Over" value={form.overNumber ?? 0} onChange={v => s('overNumber', v)} />
                        <NF label="Min Score" value={form.sessionMin ?? 0} onChange={v => s('sessionMin', v)} />
                        <NF label="Max Score" value={form.sessionMax ?? 0} onChange={v => s('sessionMax', v)} />
                        <IconButton size="small" onClick={() => { bump('sessionMin', 1); bump('sessionMax', 1); }} sx={bluBtn}>
                            <Add sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => { bump('sessionMin', -1); bump('sessionMax', -1); }} sx={bluBtn}>
                            <Remove sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Stack>
                    <Stack direction="row" spacing={1.5} mb={3}>
                        <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}
                            onClick={() => { s('sessionMin', 0); s('sessionMax', 0); s('overNumber', 0); }}>
                            Set 0
                        </Button>
                        <Button variant="contained" size="small" disabled={saving} onClick={updateSession}
                            sx={{ bgcolor: '#1976d2', textTransform: 'none', '&:hover': { bgcolor: '#1565c0' } }}>
                            Update Sess Score
                        </Button>
                    </Stack>

                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: 15 }}>Lambi</Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-end">
                        <NF label="Min Score" value={form.lambiMin ?? 0} onChange={v => s('lambiMin', v)} />
                        <NF label="Max Score" value={form.lambiMax ?? 0} onChange={v => s('lambiMax', v)} />
                        <IconButton size="small" onClick={() => { bump('lambiMin', 1); bump('lambiMax', 1); }} sx={bluBtn}>
                            <Add sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => { bump('lambiMin', -1); bump('lambiMax', -1); }} sx={bluBtn}>
                            <Remove sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Stack>
                </Paper>
            )}

            {odds.length > 0 && (
                <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" fontWeight={700}>Odds History</Typography>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    {['#', 'T1', 'T2', 'Draw', 'Session', 'Lambi', 'Over', 'Time'].map(h => (
                                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {odds.map((o, i) => (
                                    <tr key={o.id} style={{ borderTop: '1px solid #eee' }}>
                                        <td style={{ padding: '7px 10px' }}>{i + 1}</td>
                                        <td style={{ padding: '7px 10px', color: '#1565c0' }}>{o.team1Min} - {o.team1Max}</td>
                                        <td style={{ padding: '7px 10px', color: '#1565c0' }}>{o.team2Min} - {o.team2Max}</td>
                                        <td style={{ padding: '7px 10px' }}>{o.drawMin ?? '-'} - {o.drawMax ?? '-'}</td>
                                        <td style={{ padding: '7px 10px' }}>{o.sessionMin ?? '-'} - {o.sessionMax ?? '-'}</td>
                                        <td style={{ padding: '7px 10px' }}>{o.lambiMin ?? '-'} - {o.lambiMax ?? '-'}</td>
                                        <td style={{ padding: '7px 10px' }}>{o.overNumber ?? '-'}</td>
                                        <td style={{ padding: '7px 10px', whiteSpace: 'nowrap', color: '#666' }}>
                                            {new Date(o.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default OddsManagementView;

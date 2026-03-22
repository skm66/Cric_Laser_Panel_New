import { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Avatar, Chip, Select, MenuItem,
  FormControl, InputLabel, Divider, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip,
  LinearProgress, Collapse, IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { performanceApi } from '../../api/performance/performance.api';
import {
  TeamOption, TeamFormResponse, HeadToHeadResponse, RecentMatchItem,
  MatchResultItem, InningsScore,
} from '../../api/performance/types';

const TeamLogo = ({ url, name, size = 40 }: { url?: string | null; name: string; size?: number }) => (
  <Avatar src={url || undefined} sx={{ width: size, height: size, bgcolor: 'primary.main', fontSize: size * 0.4 }}>
    {!url && name.charAt(0)}
  </Avatar>
);

const ResultBadge = ({ result }: { result: 'W' | 'L' }) => (
  <Chip
    label={result}
    size="small"
    sx={{
      width: 28, height: 28, fontWeight: 700, fontSize: 13,
      bgcolor: result === 'W' ? '#2e7d32' : '#c62828',
      color: '#fff',
      borderRadius: '50%',
    }}
  />
);

const InningsScoreChips = ({ innings }: { innings: InningsScore[] }) => {
  if (!innings || innings.length === 0) return <Typography variant="caption" color="text.secondary">No score data</Typography>;
  return (
    <Stack direction="column" gap={0.3}>
      {innings.map((inn, i) => (
        <Typography key={i} variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          {inn.teamName}: <strong>{inn.runs}/{inn.wickets}</strong> ({inn.overs} ov)
        </Typography>
      ))}
    </Stack>
  );
};

const formatDate = (s: string | null) => {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Expandable row for team form table
const FormRow = ({ m }: { m: MatchResultItem }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover>
        <TableCell sx={{ py: 0.5, width: 32 }}>
          {m.innings && m.innings.length > 0 && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ py: 0.5 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <TeamLogo url={m.opponentLogo} name={m.opponentFull} size={22} />
            <Typography variant="body2">{m.opponentFull}</Typography>
          </Stack>
        </TableCell>
        <TableCell sx={{ py: 0.5 }}>{m.format}</TableCell>
        <TableCell sx={{ py: 0.5 }}>{formatDate(m.endTime)}</TableCell>
        <TableCell sx={{ py: 0.5 }} align="center"><ResultBadge result={m.result} /></TableCell>
      </TableRow>
      {m.innings && m.innings.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} sx={{ py: 0, border: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover', borderRadius: 1, mb: 0.5 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
                  SCORECARD
                </Typography>
                {m.innings.map((inn, i) => (
                  <Stack key={i} direction="row" alignItems="center" gap={2} mb={0.3}>
                    <Typography variant="body2" sx={{ minWidth: 120 }}>{inn.teamName}</Typography>
                    <Typography variant="body2" fontWeight={700}>{inn.runs}/{inn.wickets}</Typography>
                    <Typography variant="body2" color="text.secondary">({inn.overs} ov)</Typography>
                  </Stack>
                ))}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default function InfoView() {
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamAId, setTeamAId] = useState<number | ''>('');
  const [teamBId, setTeamBId] = useState<number | ''>('');
  const [formA, setFormA] = useState<TeamFormResponse | null>(null);
  const [formB, setFormB] = useState<TeamFormResponse | null>(null);
  const [h2h, setH2h] = useState<HeadToHeadResponse | null>(null);
  const [recent, setRecent] = useState<RecentMatchItem[]>([]);
  const [h2hLoading, setH2hLoading] = useState(false);

  useEffect(() => {
    performanceApi.getTeams().then(setTeams).catch(console.error);
    performanceApi.getRecentMatches(10).then(setRecent).catch(console.error);
  }, []);

  useEffect(() => {
    if (!teamAId) { setFormA(null); return; }
    performanceApi.getTeamForm(teamAId as number).then(setFormA).catch(console.error);
  }, [teamAId]);

  useEffect(() => {
    if (!teamBId) { setFormB(null); return; }
    performanceApi.getTeamForm(teamBId as number).then(setFormB).catch(console.error);
  }, [teamBId]);

  useEffect(() => {
    if (!teamAId || !teamBId) { setH2h(null); return; }
    setH2hLoading(true);
    performanceApi.getHeadToHead(teamAId as number, teamBId as number)
      .then(setH2h).catch(console.error).finally(() => setH2hLoading(false));
  }, [teamAId, teamBId]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Info / Performance</Typography>

      {/* Team Selectors */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Team A</InputLabel>
              <Select value={teamAId} label="Team A" onChange={e => setTeamAId(e.target.value as number)}>
                {teams.map(t => (
                  <MenuItem key={t.id} value={t.id} disabled={t.id === teamBId}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <TeamLogo url={t.logoUrl} name={t.name} size={24} />
                      {t.name} ({t.shortCode})
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">VS</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Team B</InputLabel>
              <Select value={teamBId} label="Team B" onChange={e => setTeamBId(e.target.value as number)}>
                {teams.map(t => (
                  <MenuItem key={t.id} value={t.id} disabled={t.id === teamAId}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <TeamLogo url={t.logoUrl} name={t.name} size={24} />
                      {t.name} ({t.shortCode})
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Team Form Cards */}
      {(formA || formB) && (
        <Grid container spacing={2} mb={3}>
          {([formA, formB] as (TeamFormResponse | null)[]).map((form, idx) => form && (
            <Grid size={{ xs: 12, md: 6 }} key={idx}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" gap={2} mb={2}>
                  <TeamLogo url={form.teamLogoUrl} name={form.teamName} size={48} />
                  <Box>
                    <Typography fontWeight={700}>{form.teamName}</Typography>
                    <Typography variant="body2" color="text.secondary">{form.teamShortCode}</Typography>
                  </Box>
                  <Box ml="auto" textAlign="right">
                    <Typography variant="body2" color="text.secondary">Win Ratio</Typography>
                    <Typography fontWeight={700} color={form.winRatio >= 50 ? 'success.main' : 'error.main'}>
                      {form.winRatio.toFixed(1)}%
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                  LAST 5 MATCHES
                </Typography>
                <Stack direction="row" gap={1} mb={2} flexWrap="wrap">
                  {form.lastFive.length === 0
                    ? <Typography variant="body2" color="text.secondary">No completed matches</Typography>
                    : form.lastFive.map((m, i) => (
                      <Tooltip
                        key={i}
                        title={`vs ${m.opponentFull} • ${m.format} • ${m.tournament} • ${formatDate(m.endTime)}`}
                        arrow
                      >
                        <Box sx={{ cursor: 'default' }}>
                          <ResultBadge result={m.result} />
                        </Box>
                      </Tooltip>
                    ))
                  }
                </Stack>

                <Stack direction="row" gap={1} mb={2}>
                  <Chip label={`W: ${form.wins}`} size="small" color="success" variant="outlined" />
                  <Chip label={`L: ${form.losses}`} size="small" color="error" variant="outlined" />
                  <Chip label={`Played: ${form.lastFive.length}`} size="small" variant="outlined" />
                </Stack>

                {form.lastFive.length > 0 && (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, py: 0.5, width: 32 }} />
                        <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Opponent</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Format</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 0.5 }} align="center">Result</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {form.lastFive.map((m, i) => <FormRow key={i} m={m} />)}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Head to Head */}
      {h2hLoading && <LinearProgress sx={{ mb: 2 }} />}
      {h2h && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Head to Head (Last {h2h.totalMatches} matches)
          </Typography>

          {h2h.totalMatches === 0 ? (
            <Typography color="text.secondary">No head-to-head matches found between these teams.</Typography>
          ) : (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-around" mb={2}>
                <Stack alignItems="center" gap={1}>
                  <TeamLogo url={h2h.teamALogoUrl} name={h2h.teamAName} size={56} />
                  <Typography fontWeight={700}>{h2h.teamAShortCode}</Typography>
                  <Typography variant="h4" fontWeight={800} color="primary">{h2h.teamAWins}</Typography>
                  <Typography variant="caption" color="text.secondary">Wins</Typography>
                </Stack>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary">VS</Typography>
                  <Typography variant="body2" color="text.secondary">{h2h.totalMatches} matches</Typography>
                </Box>
                <Stack alignItems="center" gap={1}>
                  <TeamLogo url={h2h.teamBLogoUrl} name={h2h.teamBName} size={56} />
                  <Typography fontWeight={700}>{h2h.teamBShortCode}</Typography>
                  <Typography variant="h4" fontWeight={800} color="secondary">{h2h.teamBWins}</Typography>
                  <Typography variant="caption" color="text.secondary">Wins</Typography>
                </Stack>
              </Stack>

              <Box mb={2}>
                <LinearProgress
                  variant="determinate"
                  value={h2h.totalMatches > 0 ? (h2h.teamAWins / h2h.totalMatches) * 100 : 50}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Stack direction="row" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="primary">{h2h.teamAShortCode}</Typography>
                  <Typography variant="caption" color="secondary">{h2h.teamBShortCode}</Typography>
                </Stack>
              </Box>

              <Divider sx={{ mb: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }} />
                    <TableCell sx={{ fontWeight: 600 }}>Opponent</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Format</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tournament</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Result ({h2h.teamAShortCode})</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {h2h.matches.map((m, i) => <FormRow key={i} m={m} />)}
                </TableBody>
              </Table>
            </>
          )}
        </Paper>
      )}

      {/* Recent Matches */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Recent Completed Matches</Typography>
        {recent.length === 0
          ? <Typography color="text.secondary">No completed matches found.</Typography>
          : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Match</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Format</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tournament</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Winner</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.map((m, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <TeamLogo url={m.teamALogo} name={m.teamA} size={24} />
                        <Typography variant="body2" fontWeight={600}>{m.teamA}</Typography>
                        <Typography variant="body2" color="text.secondary">vs</Typography>
                        <Typography variant="body2" fontWeight={600}>{m.teamB}</Typography>
                        <TeamLogo url={m.teamBLogo} name={m.teamB} size={24} />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <InningsScoreChips innings={m.innings} />
                    </TableCell>
                    <TableCell>{m.format}</TableCell>
                    <TableCell>{m.tournament || '—'}</TableCell>
                    <TableCell>
                      <Chip label={m.winnerName} size="small" color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>{formatDate(m.endTime)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        }
      </Paper>
    </Box>
  );
}

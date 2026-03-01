import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  Tooltip,
  Card,
  CardContent,
  Divider,
  InputAdornment
} from '@mui/material';
import { AppButton, AppLink } from '../../components';
import { Edit, Delete, Visibility, Add, Search, Public } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import playerApi from '../../api/players/playerApi';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ExportCsvButton from './ExportButton';
import ImportCsvButton from './ImportButton';
import { ShortPlayer } from '../../api/players/res/players';


const ManagePlayersPage = () => {
  const theme = useTheme();
  const [players, setPlayers] = useState<ShortPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryQuery, setCountryQuery] = useState('');

  const fetchPlayers = useCallback(async (query: string = '', country: string = '') => {
    setLoading(true);
    try {
      const response = await playerApi.queryPlayers({
        search: query,
        nationality: country
      });
      setPlayers(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      const msg = err.response?.data?.message || err.message || 'Failed to load players.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useDebouncedValue(searchQuery, 500);
  const debouncedCountry = useDebouncedValue(countryQuery, 500);

  useEffect(() => {
    fetchPlayers(debouncedSearch, debouncedCountry);
  }, [debouncedSearch, debouncedCountry, fetchPlayers]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playerApi.deletePlayer(id);
        fetchPlayers(searchQuery, countryQuery);
      } catch (err: any) {
        console.error("Delete failed", err);
        const serverMessage = err.response?.data?.message || err.message || 'Failed to delete player';
        setError(serverMessage);
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      {/* Header & Controls Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
            mb={3}
          >
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                Manage Players
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                View, search, and manage your player database
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <ExportCsvButton
                url={process.env.REACT_APP_URL_API + "/players/export"}
                variant="outlined"
                color="secondary"
              />
              <ImportCsvButton
                importUrl={process.env.REACT_APP_URL_API + "/players/import"}
                onImportSuccess={() => fetchPlayers(searchQuery, countryQuery)}
                showSnackbar={true}
              />
              <AppButton
                component={AppLink}
                to="/players/new"
                variant="contained"
                color="primary"
                startIcon={<Add />}
                sx={{ px: 3, fontWeight: 'bold' }}
              >
                New Player
              </AppButton>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Search Filters Row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, maxWidth: { sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="Filter by country..."
              variant="outlined"
              size="small"
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              sx={{ flex: 1, maxWidth: { sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Public fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={3}>
            <Alert severity="error" variant="filled">{error}</Alert>
          </Box>
        ) : players.length === 0 ? (
          <Box py={8} textAlign="center">
            <Typography variant="h6" color="text.secondary">No players found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your search or add a new player</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>NAME</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ROLE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>NATIONALITY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{player.name}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
                        px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold'
                      }}>
                        {player.role || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{player.nationality}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton component={AppLink} to={`/players/${player.id}`} size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton component={AppLink} to={`/players/edit/${player.id}`} size="small" color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(player.id)} size="small" color="error">
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
    </Box>
  );
};

export default ManagePlayersPage;

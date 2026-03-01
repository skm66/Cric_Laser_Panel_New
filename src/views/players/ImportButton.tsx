import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Stack, Typography, Snackbar } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axiosInstance from '../../utils/api';

type ImportCsvProps = {
  importUrl: string;
  onImportSuccess?: () => void;
  showSnackbar?: boolean;
};

const ImportCsvButton: React.FC<ImportCsvProps> = ({ importUrl, onImportSuccess, showSnackbar = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axiosInstance.post(importUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('CSV imported successfully!');
      if (showSnackbar) setOpenSnackbar(true);

      onImportSuccess?.();
      setFile(null);
      // Clear file input value to allow re-selection of same file if needed
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to import CSV';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Stack spacing={1} alignItems="center" sx={{ minWidth: 280 }}>
      {/* Hidden File Input */}
      <input
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Stack direction="row" spacing={1} alignItems="center" width="100%">
        <label htmlFor="csv-file-input" style={{ flexGrow: 1 }}>
          <Button fullWidth variant="outlined" component="span" startIcon={<UploadFileIcon />}>
            Select CSV File
          </Button>
        </label>

        <Button
          variant="contained"
          color="primary"
          disabled={!file || loading}
          onClick={handleUpload}
          sx={{ whiteSpace: 'nowrap', minWidth: 120 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Import CSV'}
        </Button>
      </Stack>

      {file && (
        <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-word', alignSelf: 'flex-start' }}>
          Selected: <strong>{file.name}</strong>
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
      {success && !showSnackbar && <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }} variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default ImportCsvButton;

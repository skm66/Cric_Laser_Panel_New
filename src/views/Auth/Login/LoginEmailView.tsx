import { SyntheticEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../../store';
import {
  AppButton,
  AppLink,
  AppIconButton,
  AppAlert,
  AppForm,
} from '../../../components';
import {
  useAppForm,
  SHARED_CONTROL_PROPS,
  eventPreventDefault,
} from '../../../utils/form';
import { authApi } from '../../../api/auth/auth.api';
import { localStorageSet } from '../../../utils/localStorage';

const VALIDATE_FORM_LOGIN_EMAIL = {
  username: {
    presence: true,
  },
  password: {
    presence: true,
    length: {
      minimum: 8,
      maximum: 32,
      message: 'must be between 8 and 32 characters',
    },
  },
};

interface FormStateValues {
  username: string;
  password: string;
}

const LoginEmailView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [, dispatch] = useAppStore();

  const { formState, onFieldChange, fieldGetError, fieldHasError, isFormValid } =
    useAppForm({
      validationSchema: VALIDATE_FORM_LOGIN_EMAIL,
      initialValues: { username: '', password: '' } as FormStateValues,
    });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const values = formState.values as FormStateValues;

  const handleShowPasswordClick = useCallback(() => {
    setShowPassword((old) => !old);
  }, []);

  const handleFormSubmit = useCallback(
    async (event: SyntheticEvent) => {
      event.preventDefault();
      setLoading(true);
      setError(undefined);

      try {
        const response = await authApi.login({
          username: values.username,
          password: values.password,
        });

        const loginData = response.data.data;
        
        localStorageSet('authToken', loginData.token);
        localStorageSet('currentUser', {
          username: loginData.username,
          email: loginData.email,
          role: loginData.role,
        });

        dispatch({ type: 'SET_AUTH', payload: true });
        dispatch({ type: 'SET_USER', payload: {
          username: loginData.username,
          email: loginData.email,
          role: loginData.role,
        }});

        navigate('/', { replace: true });
      } catch (err: any) {
        setError(err.message || 'Invalid username or password');
      } finally {
        setLoading(false);
      }
    },
    [values, dispatch, navigate]
  );

  const handleCloseError = useCallback(() => setError(undefined), []);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor={theme.palette.background.default}
      px={2}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 900,
          display: 'flex',
          minHeight: 500,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: 10,
        }}
      >
        {/* Image Side */}
        <Box
          flex={1}
          sx={{
            backgroundImage: `url('/img/app/login-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', md: 'block' },
          }}
        />

        {/* Form Side */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          p={4}
        >
          <AppForm onSubmit={handleFormSubmit}>
            <Box textAlign="center" mb={3}>
              <LoginIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight="bold" mt={1}>
                Admin Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back. Please login to continue.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <TextField
              required
              autoComplete="username"
              label="Username"
              name="username"
              value={values.username}
              error={fieldHasError('username')}
              helperText={fieldGetError('username') || ' '}
              onChange={onFieldChange}
              {...SHARED_CONTROL_PROPS}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              label="Password"
              name="password"
              value={values.password}
              error={fieldHasError('password')}
              helperText={fieldGetError('password') || ' '}
              onChange={onFieldChange}
              {...SHARED_CONTROL_PROPS}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <AppIconButton
                      aria-label="toggle password visibility"
                      icon={showPassword ? 'visibilityon' : 'visibilityoff'}
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                      onClick={handleShowPasswordClick}
                      onMouseDown={eventPreventDefault}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <AppAlert severity="error" onClose={handleCloseError} sx={{ mb: 2 }}>
                {error}
              </AppAlert>
            )}

            <AppButton
              type="submit"
              color='primary'
              disabled={!isFormValid() || loading}
              fullWidth
              sx={{
                mt: 2,
                fontWeight: 600,
                py: 1.25,
                fontSize: '1rem',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </AppButton>

            <Typography variant="body2" align="center" mt={2}>
              <AppLink to="/auth/recovery/password" style={{ color: theme.palette.text.secondary }}>
                Forgot Password?
              </AppLink>
            </Typography>
          </AppForm>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginEmailView;

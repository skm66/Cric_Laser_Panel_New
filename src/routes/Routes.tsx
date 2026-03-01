import { useCallback, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppLoading } from '../components';
import { useAuthWatchdog, useIsAuthenticated } from '../hooks';
import { localStorageGet } from '../utils/localStorage';
import { useAppStore } from '../store';
import PublicRoutes from './PublicRoutes';
import PrivateRoutes from './PrivateRoutes';

/**
 * Renders routes depending on Authenticated or Anonymous users
 * @component Routes
 */
const Routes = () => {
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [, dispatch] = useAppStore();
  const isAuthenticated = useIsAuthenticated();

  const afterLogin = useCallback(() => {
    const user = localStorageGet('currentUser', undefined);
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_AUTH', payload: true });
    }
    setRefresh((old) => old + 1);
    setLoading(false);
  }, [dispatch]);

  const afterLogout = useCallback(() => {
    setRefresh((old) => old + 1);
    setLoading(false);
  }, []);

  useAuthWatchdog(afterLogin, afterLogout);

  if (loading) {
    return <AppLoading />;
  }

  console.log(`Routes() - isAuthenticated: ${isAuthenticated}, refreshCount: ${refresh}`);
  return (
    <BrowserRouter>{isAuthenticated ? <PrivateRoutes key={refresh} /> : <PublicRoutes key={refresh} />}</BrowserRouter>
  );
};
export default Routes;

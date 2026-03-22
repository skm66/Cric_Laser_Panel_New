import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { localStorageGet, localStorageDelete } from '../utils/localStorage';

type CurrentUser = {
  username?: string;
  email?: string;
  role?: string;
};

/**
 * Hook to get currently logged user
 * @returns {object | undefined} user data as object or undefined if user is not logged in
 */
export function useCurrentUser(): CurrentUser | undefined {
  const [state] = useAppStore();
  return state.currentUser as CurrentUser | undefined;
}

/**
 * Hook to detect is current user authenticated or not
 * @returns {boolean} true if user is authenticated, false otherwise
 */
export function useIsAuthenticated() {
  const token = localStorageGet('authToken', '');
  return Boolean(token);
}

/**
 * Returns event handler to Logout current user
 * @returns {function} calling this event logs out current user
 */
export function useEventLogout() {
  const navigate = useNavigate();
  const [, dispatch] = useAppStore();

  return useCallback(() => {
    localStorageDelete('authToken');
    localStorageDelete('currentUser');
    dispatch({ type: 'SET_AUTH', payload: false });
    dispatch({ type: 'SET_USER', payload: {} });
    navigate('/auth/login', { replace: true });
  }, [dispatch, navigate]);
}

/**
 * Adds watchdog and calls different callbacks on user login and logout
 * @param {function} afterLogin callback to call after user login
 * @param {function} afterLogout callback to call after user logout
 */
export function useAuthWatchdog(afterLogin: () => void, afterLogout: () => void) {
  const [state, dispatch] = useAppStore();

  useEffect(() => {
    if (state.isAuthenticated) {
      afterLogin?.();
    } else {
      afterLogout?.();
    }
  }, [state.isAuthenticated, dispatch, afterLogin, afterLogout]);
}

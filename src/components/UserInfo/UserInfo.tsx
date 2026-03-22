import { Avatar, Stack, Typography } from '@mui/material';
import AppLink from '../AppLink';

interface UserInfoProps {
  className?: string;
  showAvatar?: boolean;
  user?: any;
}

/**
 * Renders User info with Avatar
 * @component UserInfo
 * @param {string} [className] - optional className for <div> tag
 * @param {boolean} [showAvatar] - user's avatar picture is shown when true
 * @param {object} [user] - logged user data {username, email, role...}
 */
const UserInfo = ({ className, showAvatar = false, user, ...restOfProps }: UserInfoProps) => {
  const username = user?.username || 'User';
  const role = user?.role || '';
  const email = user?.email || '';

  return (
    <Stack alignItems="center" minHeight="fit-content" marginBottom={2} {...restOfProps}>
      {showAvatar ? (
        <AppLink to="/user" underline="none">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              fontSize: '3rem',
            }}
            alt={username}
          >
            {username.charAt(0).toUpperCase()}
          </Avatar>
        </AppLink>
      ) : null}
      <Typography sx={{ mt: 1 }} variant="h6">
        {username}
      </Typography>
      <Typography variant="body2">{email || role || 'Loading...'}</Typography>
    </Stack>
  );
};

export default UserInfo;

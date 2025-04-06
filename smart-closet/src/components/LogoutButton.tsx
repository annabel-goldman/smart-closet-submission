import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <Button
      variant="outlined"
      color="error"
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
      sx={{
        minWidth: '200px',
        py: 1.5,
        px: 4,
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '8px',
        borderWidth: '2px',
        '&:hover': {
          borderWidth: '2px',
        }
      }}
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;

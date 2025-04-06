import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/closet",
      },
    });
  };

  return (
    <Button
      variant="outlined"
      onClick={handleLogin}
      startIcon={<LoginIcon />}
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
      Log In
    </Button>
  );
};

export default LoginButton;

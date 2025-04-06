import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const SignupButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleSignup = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/closet",
      },
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  return (
    <Button
      variant="contained"
      onClick={handleSignup}
      startIcon={<PersonAddIcon />}
      sx={{
        minWidth: '200px',
        py: 1.5,
        px: 4,
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }
      }}
    >
      Sign Up
    </Button>
  );
};

export default SignupButton;

import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Box } from "@mui/material";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import SignupButton from "./SignupButton";

const AuthButtons = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <Box sx={{ 
      display: "flex", 
      gap: 3, 
      justifyContent: "center",
      flexDirection: { xs: 'column', sm: 'row' }
    }}>
      {!isAuthenticated && (
        <>
          <SignupButton />
          <LoginButton />
        </>
      )}
      {isAuthenticated && (
        <LogoutButton />
      )}
    </Box>
  );
};

export default AuthButtons;

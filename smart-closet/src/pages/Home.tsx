import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Typography, Box, Paper } from "@mui/material";
import AuthButtons from "../components/AuthButtons";

const Home: React.FC = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 6, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            Welcome to Smart Closet
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              color: 'text.secondary',
              mb: 4
            }}
          >
            Your Personal Wardrobe Management System
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Organize your clothes, create outfits, and manage your wardrobe with ease. 
            Upload your clothing items and let our AI help you keep track of your fashion collection.
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 2
            }}
          >
            Get started by signing in or creating an account
          </Typography>
          <AuthButtons />
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;

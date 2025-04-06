import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Typography, Box, Paper } from "@mui/material";
import { uploadImage, getCloset } from "../api/api";
import { ClosetResponse } from "../types/types";
import UserActions from "../components/UserActions";
import ClosetGrid from "../components/ClosetGrid";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import UserCard from "../components/UserCard";

const Closet: React.FC = () => {
  const { user } = useAuth0();
  const [closet, setCloset] = useState<ClosetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.sub) return;

    try {
      setLoading(true);
      setError(null);
      await uploadImage(file, user.sub);
      setUploadSuccess(true);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCloset = async () => {
    if (!user?.sub) return;

    try {
      setLoading(true);
      setError(null);
      const closetData = await getCloset(user.sub);
      setCloset(closetData);
      setUploadSuccess(false);
    } catch (err) {
      setError("Failed to fetch closet. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          Smart Closet
        </Typography>
        <Typography 
          variant="h5" 
          component="h2" 
          align="center" 
          sx={{ 
            color: 'text.secondary',
            mb: 4
          }}
        >
          Your Personal Wardrobe Collection
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 6 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            flex: 1,
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
          }}
        >
          <UserCard />
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            flex: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
          }}
        >
          <UserActions
            handleFileUpload={handleFileUpload}
            handleGetCloset={handleGetCloset}
            loading={loading}
            uploadSuccess={uploadSuccess}
          />
          {error && <ErrorMessage message={error} />}
          {loading && <LoadingSpinner />}
        </Paper>
      </Box>

      {closet && closet.items && closet.items.length > 0 && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
          }}
        >
          <Typography 
            variant="h5" 
            component="h3" 
            sx={{ 
              mb: 4,
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Your Clothing Collection
          </Typography>
          <ClosetGrid items={closet.items} />
        </Paper>
      )}
      
      {closet && (!closet.items || closet.items.length === 0) && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            textAlign: 'center',
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              mb: 2
            }}
          >
            No clothing items found in your closet.
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary'
            }}
          >
            Upload some images to get started!
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Closet;

import React from "react";
import { Box, Button, Typography, Alert } from "@mui/material";
import { CloudUpload as CloudUploadIcon, Refresh as RefreshIcon } from "@mui/icons-material";

interface Props {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGetCloset: () => void;
  loading: boolean;
  uploadSuccess: boolean;
}

const UserActions: React.FC<Props> = ({
  handleFileUpload,
  handleGetCloset,
  loading,
  uploadSuccess,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Typography 
      variant="h6" 
      sx={{ 
        mb: 2,
        fontWeight: 'bold',
        color: 'primary.main'
      }}
    >
      Manage Your Closet
    </Typography>
    
    <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: "center" }}>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        disabled={loading}
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
        Upload Image
        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
      </Button>
      
      <Button 
        variant="outlined" 
        onClick={handleGetCloset} 
        disabled={loading}
        startIcon={<RefreshIcon />}
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
        Refresh Closet
      </Button>
    </Box>

    {uploadSuccess && (
      <Alert 
        severity="success" 
        sx={{ 
          mt: 2,
          '& .MuiAlert-icon': {
            color: 'success.main'
          }
        }}
      >
        Image uploaded successfully! Click "Refresh Closet" to see your updated collection.
      </Alert>
    )}

    <Typography 
      variant="body2" 
      sx={{ 
        mt: 2,
        color: 'text.secondary',
        textAlign: 'center'
      }}
    >
      Upload images of your clothing items to add them to your digital closet
    </Typography>
  </Box>
);

export default UserActions;

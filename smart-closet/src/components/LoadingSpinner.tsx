import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner: React.FC = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
    </Box>
);

export default LoadingSpinner;
import React from 'react';
import { Typography } from '@mui/material';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <Typography color="error" align="center" sx={{ mb: 2 }}>
        {message}
    </Typography>
);

export default ErrorMessage;

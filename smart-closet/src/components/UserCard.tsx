import React from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

// not sure on the types here
const UserCard: React.FC = () => {
  const { user } = useAuth0();

  if (!user) return null;

  return (
    <Card sx={{ maxWidth: 200, margin: "0 auto", mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        {user.picture && (
          <CardMedia
            component="img"
            sx={{ 
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              mb: 2
            }}
            image={user.picture}
            alt={`${user.name}'s profile`}
          />
        )}
        <CardContent sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="h6" component="div" sx={{ mb: 1 }}>
            {user.name || "User"}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
            {user.email || "No email available"}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default UserCard;

import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { ClothingItem } from '../types/types';

const ClothingCard: React.FC<{ item: ClothingItem }> = ({ item }) => (
    <Card key={item.clothing_id}>
        <CardMedia
            component="img"
            height="200"
            image={item.image_url}
            alt={item.clothing_type}
        />
        <CardContent>
            <Typography variant="h6">{item.clothing_type}</Typography>
            <Typography color="textSecondary">
            Color: {item.color}
            </Typography>
            <Typography color="textSecondary">
            Material: {item.material}
            </Typography>
            <Typography color="textSecondary">
            Style: {item.style}
            </Typography>
            {item.extra_info && (
            <Typography color="textSecondary">
                Details: {item.extra_info}
            </Typography>
            )}
        </CardContent>
    </Card>
);

export default ClothingCard;
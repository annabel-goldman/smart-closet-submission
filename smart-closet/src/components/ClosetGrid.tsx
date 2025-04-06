import React, { useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Typography, Divider } from '@mui/material';
import { ClothingItem } from '../types/types';
import CloseIcon from '@mui/icons-material/Close';

const ClosetGrid: React.FC<{ items: ClothingItem[] }> = ({ items }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);

    // Group items by their image
    const imageGroups = items.reduce((acc, item) => {
        if (!acc[item.new_image_s3_key]) {
            acc[item.new_image_s3_key] = [];
        }
        acc[item.new_image_s3_key].push(item);
        return acc;
    }, {} as Record<string, ClothingItem[]>);

    const handleImageClick = (imageKey: string) => {
        setSelectedImage(imageKey);
        setSelectedItems(imageGroups[imageKey]);
    };

    const handleClose = () => {
        setSelectedImage(null);
        setSelectedItems([]);
    };

    return (
        <>
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 3,
                padding: 2
            }}>
                {Object.keys(imageGroups).map((imageKey) => {
                    const firstItem = imageGroups[imageKey][0];
                    return (
                        <Box
                            key={imageKey}
                            sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                                padding: '16px',
                                height: '400px'
                            }}
                            onClick={() => handleImageClick(imageKey)}
                        >
                            <img
                                src={firstItem.image_url}
                                alt={`Clothing image ${imageKey}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                }}
                            />
                        </Box>
                    );
                })}
            </Box>

            <Dialog
                open={!!selectedImage}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Items in this Image
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 3,
                        mt: 2
                    }}>
                        <Box sx={{ 
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            padding: '16px',
                            height: '400px'
                        }}>
                            {selectedImage && (
                                <img
                                    src={imageGroups[selectedImage][0].image_url}
                                    alt="Selected clothing"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }}
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {selectedItems.map((item, index) => (
                                    <React.Fragment key={item.clothing_id}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="h6"
                                                        color="primary"
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        {item.clothing_type}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                            sx={{ display: 'block' }}
                                                        >
                                                            Color: {item.color}
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                            sx={{ display: 'block' }}
                                                        >
                                                            Material: {item.material}
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                            sx={{ display: 'block' }}
                                                        >
                                                            Style: {item.style}
                                                        </Typography>
                                                        {item.extra_info && (
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                                sx={{ display: 'block' }}
                                                            >
                                                                Details: {item.extra_info}
                                                            </Typography>
                                                        )}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        {index < selectedItems.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ClosetGrid;
import React from 'react';
import { Box, Typography } from '@mui/material';

const HomeLayout = () => {
    return (
        <Box
            sx={{
                p: 3,
                bgcolor: 'background.default',
                minHeight: 'calc(100vh - 64px)', // trừ chiều cao AppBar
            }}
        >
            {/* Tiêu đề góc trái */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.primary' }}
                >
                    DASHBOARD
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mt: 0.5 }}
                >
                    Welcome to your dashboard
                </Typography>
            </Box>

            {/* Nội dung chính của Dashboard */}
            <Box>
                {/* Bạn có thể thêm các widget, chart, cards... tại đây */}
            </Box>
        </Box>
    );
};

export default HomeLayout;

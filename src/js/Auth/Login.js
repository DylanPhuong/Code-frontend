import React, { useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    TextField,
    Button,
    Typography,
    Checkbox,
    FormControlLabel,
    Link,
    Divider,
    Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Icons (Material UI)
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Vui lòng nhập email và mật khẩu');
            return;
        }
        try {
            setLoading(true);

            // TODO: gọi API thật tại đây
            await new Promise((r) => setTimeout(r, 600));

            // Giả lập đăng nhập OK
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', email.split('@')[0] || 'User');
            if (remember) localStorage.setItem('remember_me', '1');
            else localStorage.removeItem('remember_me');

            navigate('/home', { replace: true });
            toast.success('Đăng nhập thành công');
        } catch (err) {
            toast.error('Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid
            container
            sx={{
                minHeight: '100vh',
                bgcolor: (t) =>
                    t.palette.mode === 'light'
                        ? 'rgba(2,132,199,0.03)' // very light background
                        : 'background.default',
            }}
        >
            {/* Cột trái – giới thiệu */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-end' },
                    pr: { md: 6 },
                    pl: { xs: 3, md: 8 },
                    py: { xs: 6, md: 0 },
                }}
            >
                <Box sx={{ maxWidth: 560, width: '100%' }}>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, mb: 4, letterSpacing: 0.2 }}
                    >
                        Sitemark
                    </Typography>

                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2}>
                            <SettingsOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Adaptable performance</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Our product effortlessly adjusts to your needs, boosting
                                    efficiency and simplifying your tasks.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <BoltOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Built to last</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Experience unmatched durability that goes above and beyond
                                    with lasting investment.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <ThumbUpAltOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Great user experience</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Integrate our product into your routine with an intuitive and
                                    easy-to-use interface.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <AutoAwesomeOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Innovative functionality</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Stay ahead with features that set new standards, addressing
                                    your evolving needs better than the rest.
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </Grid>

            {/* Cột phải – form đăng nhập */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    pl: { md: 6 },
                    pr: { xs: 3, md: 8 },
                    py: { xs: 6, md: 0 },
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        width: '100%',
                        maxWidth: 460,
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
                        Sign in
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            size="medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                            autoComplete="email"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            size="medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />

                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 1 }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Remember me"
                            />
                            <Link
                                component="button"
                                type="button"
                                onClick={() => toast.info('Chức năng quên mật khẩu (demo)')}
                                underline="hover"
                            >
                                Forgot your password?
                            </Link>
                        </Stack>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 2,
                                py: 1.2,
                                fontWeight: 700,
                                borderRadius: 2,
                                // Nút gradient giống demo
                                background:
                                    'linear-gradient(180deg, #1e3a8a 0%, #111827 100%)',
                                boxShadow:
                                    '0 6px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                                '&:hover': {
                                    background:
                                        'linear-gradient(180deg, #1f2a6d 0%, #0b1220 100%)',
                                },
                            }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        sx={{ mt: 2 }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Don&apos;t have an account?
                        </Typography>
                        <Link
                            component="button"
                            type="button"
                            underline="hover"
                            onClick={() => toast.info('Chức năng đăng ký (demo)')}
                        >
                            Sign up
                        </Link>
                    </Stack>

                    <Divider sx={{ my: 2 }}>or</Divider>

                    <Stack spacing={1.2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            onClick={() => toast.info('Sign in with Google (demo)')}
                            sx={{ py: 1, borderRadius: 2 }}
                        >
                            Sign in with Google
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FacebookIcon />}
                            onClick={() => toast.info('Sign in with Facebook (demo)')}
                            sx={{ py: 1, borderRadius: 2 }}
                        >
                            Sign in with Facebook
                        </Button>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    );
}

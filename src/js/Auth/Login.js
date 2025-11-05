// src/js/Auth/Login.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, TextField, Button, Typography, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    // ✅ Bảo đảm rỗng khi vào trang + “đè” lại sau 1 tick để thắng Autofill của Chrome
    useEffect(() => {
        setFormData({ username: '', password: '' });
        const t = setTimeout(() => {
            setFormData({ username: '', password: '' });
        }, 0);
        return () => clearTimeout(t);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Demo login
        if (formData.username === 'admin' && formData.password === 'admin') {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', formData.username);
            toast.success('Đăng nhập thành công!');
            navigate('/');
        } else {
            toast.error('Tên đăng nhập hoặc mật khẩu không đúng!');
        }
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 3
            }}
        >
            <Paper elevation={10} sx={{ padding: 4, maxWidth: 450, width: '100%', borderRadius: 3 }}>
                {/* Logo & Title */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        🎯 SCADA HCMUTE
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Đăng nhập vào hệ thống
                    </Typography>
                </Box>

                {/* ✅ Chặn Autofill ở form */}
                <form onSubmit={handleSubmit} autoComplete="off">
                    <TextField
                        fullWidth
                        label="Tên đăng nhập"
                        name="login-username"            // ✅ đặt name “lạ” để tránh password manager
                        value={formData.username}
                        onChange={(e) => handleChange({ target: { name: 'username', value: e.target.value } })}
                        error={!!errors.username}
                        helperText={errors.username}
                        sx={{ mb: 2 }}
                        autoComplete="off"               // ✅ tắt autofill cho ô này
                        inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
                    />

                    <TextField
                        fullWidth
                        label="Mật khẩu"
                        name="login-password"            // ✅ name “lạ”
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } })}
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{ mb: 3 }}
                        autoComplete="new-password"      // ✅ cực kỳ quan trọng cho Chrome
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowPassword} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        sx={{ py: 1.5, textTransform: 'none', fontSize: 16, fontWeight: 600, borderRadius: 2 }}
                    >
                        Đăng nhập
                    </Button>
                </form>

                {/* Demo Credentials (chỉ hiển thị, KHÔNG ảnh hưởng autofill) */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Demo Account:</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Username: <strong>admin</strong> | Password: <strong>admin</strong>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;

// src/js/Layout/DashboardLayout.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, IconButton,
    ListItemButton, ListItemIcon, ListItemText, Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import LabelIcon from '@mui/icons-material/Label';
import FunctionsIcon from '@mui/icons-material/Functions';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';

// 🔧 Thêm import toast để fix lỗi no-undef
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các component pages
import DeviceTab from '../Device/DeviceTab';
import TagName from '../TagName/TagName';
import FunctionSettings from '../FunctionSetting/FunctionSettings';
import HistoricalTab from '../Historical/HistoricalTab';
import HomeLayout from '../HomeLayout/HomeLayout';

const drawerWidth = 240;

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        navigate('/login');
        toast.info('Đã đăng xuất!');
    };

    // Lấy current page từ URL
    const currentPage = location.pathname.substring(1) || 'home';

    // Tự động mở submenu nếu đang ở trang con
    useEffect(() => {
        if (currentPage === 'tagname' || currentPage === 'funcSettings') {
            setConfigOpen(true);
        }
    }, [currentPage]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handlePageChange = (page) => {
        navigate(`/${page === 'home' ? '' : page}`);
        if (window.innerWidth < 900) {
            setMobileOpen(false);
        }
    };

    const handleConfigToggle = () => {
        setConfigOpen(!configOpen);
    };

    const mainMenuItems = [
        { id: 'home', text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { id: 'device', text: 'Thiết bị', icon: <DevicesIcon />, path: '/device' },
    ];

    const configMenuItems = [
        {
            id: 'config',
            text: 'Cấu hình',
            icon: <SettingsIcon />,
            hasSubmenu: true,
            submenu: [
                { id: 'tagname', text: 'Tag Name', icon: <LabelIcon />, path: '/tagname' },
                { id: 'funcSettings', text: 'Function Settings', icon: <FunctionsIcon />, path: '/funcSettings' },
            ]
        },
        { id: 'historical', text: 'Historical', icon: <HistoryIcon />, path: '/historical' },
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Typography
                    variant="h6"
                    noWrap
                    sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    🎯 IOT DATALOGER
                </Typography>
            </Toolbar>

            <Box sx={{ overflowY: 'auto', flex: 1 }}>
                {/* Main Items */}
                <Box sx={{ mt: 2 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            px: 2,
                            py: 1,
                            display: 'block',
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: 11,
                            letterSpacing: 0.5
                        }}
                    >
                        MENU CHÍNH
                    </Typography>
                    <List sx={{ px: 1 }}>
                        {mainMenuItems.map((item) => (
                            <ListItemButton
                                key={item.id}
                                selected={currentPage === item.id}
                                onClick={() => handlePageChange(item.id)}
                                sx={{
                                    borderRadius: 1.5,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                        borderLeft: '3px solid',
                                        borderColor: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'rgba(33, 150, 243, 0.12)',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: currentPage === item.id ? 'primary.main' : 'text.secondary'
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight: currentPage === item.id ? 600 : 400
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>

                {/* Config Items */}
                <Box sx={{ mt: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            px: 2,
                            py: 1,
                            display: 'block',
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: 11,
                            letterSpacing: 0.5
                        }}
                    >
                        CÀI ĐẶT
                    </Typography>
                    <List sx={{ px: 1 }}>
                        {configMenuItems.map((item) => (
                            <Box key={item.id}>
                                <ListItemButton
                                    selected={!item.hasSubmenu && currentPage === item.id}
                                    onClick={() => item.hasSubmenu ? handleConfigToggle() : handlePageChange(item.id)}
                                    sx={{
                                        borderRadius: 1.5,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                            borderLeft: '3px solid',
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{ fontSize: 14 }}
                                    />
                                    {item.hasSubmenu && (
                                        configOpen ? <ExpandLess /> : <ExpandMore />
                                    )}
                                </ListItemButton>

                                {item.hasSubmenu && (
                                    <Collapse in={configOpen} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.submenu.map((subItem) => (
                                                <ListItemButton
                                                    key={subItem.id}
                                                    sx={{
                                                        pl: 4,
                                                        borderRadius: 1.5,
                                                        mb: 0.5,
                                                        '&.Mui-selected': {
                                                            backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                                        }
                                                    }}
                                                    selected={currentPage === subItem.id}
                                                    onClick={() => handlePageChange(subItem.id)}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            minWidth: 40,
                                                            color: currentPage === subItem.id ? 'primary.main' : 'text.secondary'
                                                        }}
                                                    >
                                                        {subItem.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={subItem.text}
                                                        primaryTypographyProps={{
                                                            fontSize: 13,
                                                            fontWeight: currentPage === subItem.id ? 600 : 400
                                                        }}
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </Box>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );

    const renderContent = () => {
        switch (currentPage) {
            case 'home':
                return <HomeLayout />;
            case 'device':
                return <DeviceTab />;
            case 'tagname':
                return <TagName />;
            case 'funcSettings':
                return <FunctionSettings />;
            case 'historical':
                return <HistoricalTab />;
            default:
                return <HomeLayout />;
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Nút chuyển theme */}
                    <IconButton
                        onClick={() => setDarkMode(!darkMode)}
                        color="inherit"
                        title={darkMode ? 'Chuyển sáng' : 'Chuyển tối'}
                    >
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    {/* ✅ Nút Đăng xuất để dùng handleLogout & LogoutIcon */}
                    <IconButton
                        onClick={handleLogout}
                        color="inherit"
                        sx={{ ml: 1 }}
                        title="Đăng xuất"
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: 1,
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Toolbar />
                <Box sx={{ p: 3 }}>
                    {renderContent()}
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;

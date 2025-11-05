import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, IconButton,
    ListItemButton, ListItemIcon, ListItemText, Collapse, Tooltip, Divider, Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ColorModeContext from '../Theme/ColorModeContext';
import DeviceTab from '../Device/DeviceTab';
import TagName from '../TagName/TagName';
import FunctionSettings from '../FunctionSetting/FunctionSettings';
import HistoricalTab from '../Historical/HistoricalTab';
import HomeLayout from '../HomeLayout/HomeLayout';

const drawerWidth = 240;
const miniWidth = 72; // khi thu gọn

const textAnim = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
    transition: { duration: 0.18 }
};

const DashboardLayout = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [configOpen, setConfigOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        navigate('/login');
        toast.info('Đã đăng xuất!');
    };

    const currentPage = location.pathname.substring(1) || 'home';

    useEffect(() => {
        if (currentPage === 'tagname' || currentPage === 'funcSettings') {
            setConfigOpen(true);
        }
    }, [currentPage]);

    const handleDrawerToggleMobile = () => setMobileOpen(!mobileOpen);
    const handleDrawerToggleDesktop = () => setDrawerOpen(!drawerOpen);

    const handlePageChange = (page) => {
        navigate(`/${page === 'home' ? '' : page}`);
        if (window.innerWidth < 900) setMobileOpen(false);
    };

    const handleConfigToggle = () => setConfigOpen(!configOpen);

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

    // === Drawer content ===
    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ px: 1.5, gap: 1, justifyContent: drawerOpen ? 'space-between' : 'center' }}>
                <AnimatePresence initial={false}>
                    {drawerOpen && (
                        <motion.div {...textAnim}>
                            <Typography variant="subtitle1" noWrap sx={{ color: 'primary.main', fontWeight: 700, fontSize: 16, ml: .5 }}>
                                MENU
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
                <IconButton onClick={handleDrawerToggleDesktop} size="small" title={drawerOpen ? 'Thu gọn' : 'Mở rộng'}>
                    {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
            </Toolbar>
            <Divider />

            <Box sx={{ overflowY: 'auto', flex: 1 }}>
                {/* Menu chính */}
                <Box sx={{ mt: 1 }}>
                    {drawerOpen && (
                        <motion.div {...textAnim}>
                            <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600, fontSize: 11 }}>
                                MENU CHÍNH
                            </Typography>
                        </motion.div>
                    )}
                    <List sx={{ px: 1 }}>
                        {mainMenuItems.map((item) => {
                            const button = (
                                <ListItemButton
                                    key={item.id}
                                    selected={currentPage === item.id}
                                    onClick={() => handlePageChange(item.id)}
                                    sx={{
                                        borderRadius: 1.5,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(33,150,243,0.08)',
                                            borderLeft: '3px solid',
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: currentPage === item.id ? 'primary.main' : 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {drawerOpen && (
                                        <motion.div style={{ width: '100%' }} {...textAnim}>
                                            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14 }} />
                                        </motion.div>
                                    )}
                                </ListItemButton>
                            );
                            return drawerOpen ? button : (
                                <Tooltip key={item.id} title={item.text} placement="right">
                                    <div>{button}</div>
                                </Tooltip>
                            );
                        })}
                    </List>
                </Box>

                {/* Menu cấu hình */}
                <Box sx={{ mt: 1 }}>
                    {drawerOpen && (
                        <motion.div {...textAnim}>
                            <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600, fontSize: 11 }}>
                                CÀI ĐẶT
                            </Typography>
                        </motion.div>
                    )}
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
                                            backgroundColor: 'rgba(33,150,243,0.08)',
                                            borderLeft: '3px solid',
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {drawerOpen && (
                                        <motion.div style={{ width: '100%' }} {...textAnim}>
                                            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14 }} />
                                        </motion.div>
                                    )}
                                    {item.hasSubmenu && drawerOpen && (configOpen ? <ExpandLess /> : <ExpandMore />)}
                                </ListItemButton>

                                {/* submenu an toàn — có kiểm tra item.submenu */}
                                <Collapse in={drawerOpen && configOpen && !!item.submenu} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.submenu && item.submenu.map((subItem) => (
                                            <ListItemButton
                                                key={subItem.id}
                                                sx={{ pl: 4, borderRadius: 1.5, mb: 0.5 }}
                                                selected={currentPage === subItem.id}
                                                onClick={() => handlePageChange(subItem.id)}
                                            >
                                                <ListItemIcon sx={{ minWidth: 40, color: currentPage === subItem.id ? 'primary.main' : 'text.secondary' }}>
                                                    {subItem.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={subItem.text}
                                                    primaryTypographyProps={{ fontSize: 13, fontWeight: currentPage === subItem.id ? 600 : 400 }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </Box>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );

    const renderContent = () => {
        switch (currentPage) {
            case 'home': return <HomeLayout />;
            case 'device': return <DeviceTab />;
            case 'tagname': return <TagName />;
            case 'funcSettings': return <FunctionSettings />;
            case 'historical': return <HistoricalTab />;
            default: return <HomeLayout />;
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${(drawerOpen ? drawerWidth : miniWidth)}px)` },
                    ml: { sm: `${drawerOpen ? drawerWidth : miniWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    borderBottom: 1, borderColor: 'divider',
                    transition: theme.transitions.create(['width', 'margin-left'], { duration: 250 }),
                }}
            >
                <Toolbar>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            IOT-DATALOGER
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                        onClick={colorMode.toggleColorMode}
                        color="inherit"
                        title={theme.palette.mode === 'dark' ? 'Chuyển sáng' : 'Chuyển tối'}
                    >
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                    <IconButton onClick={handleLogout} color="inherit" sx={{ ml: 1 }} title="Đăng xuất">
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Box component="nav" sx={{ width: { sm: drawerOpen ? drawerWidth : miniWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggleMobile}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth }
                    }}
                >
                    {drawerContent}
                </Drawer>

                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            overflowX: 'hidden',
                            width: drawerOpen ? drawerWidth : miniWidth,
                            transition: theme.transitions.create('width', { duration: 250 }),
                            borderRight: 1, borderColor: 'divider'
                        }
                    }}
                >
                    <Paper elevation={0} square sx={{ height: '100%' }} component={motion.div}
                        animate={{ x: 0 }} transition={{ type: 'tween', duration: 0.25 }}>
                        {drawerContent}
                    </Paper>
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component={motion.main}
                transition={{ type: 'tween', duration: 0.25 }}
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${(drawerOpen ? drawerWidth : miniWidth)}px)` },
                    bgcolor: 'background.default',
                    transition: theme.transitions.create(['width'], { duration: 250 }),
                }}
            >
                <Toolbar />
                <Box sx={{ p: 3 }}>{renderContent()}</Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;

import {
    useState, useEffect, useContext, useTheme, useNavigate, useLocation,
    AppBar, Box, Drawer, Toolbar, List, ListItemButton, ListItemText, ListItemIcon,
    Collapse, Typography, IconButton, Tooltip, Divider, Avatar,
    Menu, MenuItem,
    Paper, ListItemIcon as MenuItemIcon,
    // Icons
    MenuIcon, MenuOpenIcon, DashboardIcon, DevicesIcon, SettingsIcon,
    HistoryIcon, LabelIcon, FunctionsIcon, ExpandLess, ExpandMore,
    Brightness4Icon, Brightness7Icon, PersonOutlineIcon,
    ShieldOutlinedIcon, LogoutIcon, toast,
} from "../ImportComponents/Imports";

import ColorModeContext from "../Theme/ColorModeContext";
import DeviceTab from "../Device/DeviceTab";
import TagName from "../TagName/TagName";
import FunctionSettings from "../FunctionSetting/FunctionSettings";
import HistoricalTab from "../Historical/HistoricalTab";
import HomeLayout from "../HomeLayout/HomeLayout";

// NEW: bell
import NotificationBell from "../Components/NotificationBell";

const drawerWidth = 240;
const miniWidth = 72;

export default function DashboardLayout() {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const navigate = useNavigate();
    const location = useLocation();

    // Drawer
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [configOpen, setConfigOpen] = useState(false);

    // User menu
    const [userMenuEl, setUserMenuEl] = useState(null);
    const userMenuOpen = Boolean(userMenuEl);
    const username = localStorage.getItem("username") || "User";

    const currentPage = location.pathname.split("/")[1] || "home";

    // ====== Real-time clock on header ======
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
    const timeLabel = `${pad2(now.getHours())}:${pad2(
        now.getMinutes()
    )}:${pad2(now.getSeconds())}`;
    const dateLabel = `${pad2(now.getDate())}/${pad2(
        now.getMonth() + 1
    )}/${now.getFullYear()}`;
    // =======================================

    useEffect(() => {
        if (currentPage === "tagname" || currentPage === "funcSettings") {
            setConfigOpen(true);
        }
    }, [currentPage]);

    const handleDrawerToggleMobile = () => setMobileOpen((v) => !v);
    const handleDrawerToggleDesktop = () => setDrawerOpen((v) => !v);
    const handleConfigToggle = () => setConfigOpen((v) => !v);

    const handlePageChange = (page) => {
        const to = page === "home" ? "/home" : `/${page}`;
        if (location.pathname !== to) navigate(to);
        if (window.innerWidth < 900) setMobileOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("username");
        toast.info("Đã đăng xuất!");
        navigate("/login");
    };

    const openUserMenu = (e) => setUserMenuEl(e.currentTarget);
    const closeUserMenu = () => setUserMenuEl(null);
    const goMyAccount = () => {
        closeUserMenu();
        navigate("/account");
    };
    const goResetPassword = () => {
        closeUserMenu();
        navigate("/reset-password");
    };
    const onLogoutClick = () => {
        closeUserMenu();
        handleLogout();
    };

    const mainMenuItems = [
        { id: "home", text: "Dashboard", icon: <DashboardIcon />, path: "/home" },
        { id: "device", text: "Thiết bị", icon: <DevicesIcon />, path: "/device" },
    ];

    const configMenuItems = [
        {
            id: "config",
            text: "Cấu hình",
            icon: <SettingsIcon />,
            hasSubmenu: true,
            submenu: [
                { id: "tagname", text: "Tag Name", icon: <LabelIcon />, path: "/tagname" },
                {
                    id: "funcSettings",
                    text: "Function Settings",
                    icon: <FunctionsIcon />,
                    path: "/funcSettings",
                },
            ],
        },
        { id: "historical", text: "Historical", icon: <HistoryIcon />, path: "/historical" },
    ];

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Toolbar
                sx={{
                    px: 1.5,
                    gap: 1,
                    justifyContent: drawerOpen ? "space-between" : "center",
                }}
            >
                {drawerOpen && (
                    <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{
                            color: "primary.main",
                            fontWeight: 700,
                            fontSize: 16,
                            ml: 0.5,
                        }}
                    >
                        SIDEBAR
                    </Typography>
                )}
                <IconButton
                    onClick={handleDrawerToggleDesktop}
                    size="small"
                    title={drawerOpen ? "Thu gọn" : "Mở rộng"}
                >
                    {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
            </Toolbar>
            <Divider />

            <Box sx={{ overflowY: "auto", flex: 1 }}>
                {/* MAIN */}
                <Box sx={{ mt: 1 }}>
                    {drawerOpen && (
                        <Typography
                            variant="caption"
                            sx={{
                                px: 2,
                                py: 1,
                                display: "block",
                                color: "text.secondary",
                                fontWeight: 600,
                                fontSize: 11,
                                letterSpacing: 0.5,
                            }}
                        >
                            OPTION-ICON
                        </Typography>
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
                                        "&.Mui-selected": {
                                            backgroundColor: "rgba(33,150,243,0.08)",
                                            borderLeft: "3px solid",
                                            borderColor: "primary.main",
                                            "&:hover": {
                                                backgroundColor: "rgba(33,150,243,0.12)",
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color:
                                                currentPage === item.id
                                                    ? "primary.main"
                                                    : "text.secondary",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {drawerOpen && (
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontSize: 14,
                                                fontWeight: currentPage === item.id ? 600 : 400,
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            );
                            return button;
                        })}
                    </List>
                </Box>

                {/* CONFIG */}
                <Box sx={{ mt: 1 }}>
                    {drawerOpen && (
                        <Typography
                            variant="caption"
                            sx={{
                                px: 2,
                                py: 1,
                                display: "block",
                                color: "text.secondary",
                                fontWeight: 600,
                                fontSize: 11,
                                letterSpacing: 0.5,
                            }}
                        >
                            CÀI ĐẶT
                        </Typography>
                    )}

                    <List sx={{ px: 1 }}>
                        {configMenuItems.map((item) => (
                            <Box key={item.id}>
                                <ListItemButton
                                    selected={!item.hasSubmenu && currentPage === item.id}
                                    onClick={() =>
                                        item.hasSubmenu
                                            ? handleConfigToggle()
                                            : handlePageChange(item.id)
                                    }
                                    sx={{
                                        borderRadius: 1.5,
                                        mb: 0.5,
                                        "&.Mui-selected": {
                                            backgroundColor: "rgba(33,150,243,0.08)",
                                            borderLeft: "3px solid",
                                            borderColor: "primary.main",
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {drawerOpen && (
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{ fontSize: 14 }}
                                        />
                                    )}
                                    {item.hasSubmenu && drawerOpen && (
                                        configOpen ? <ExpandLess /> : <ExpandMore />
                                    )}
                                </ListItemButton>

                                {item.hasSubmenu && item.submenu && (
                                    <Collapse
                                        in={drawerOpen && configOpen}
                                        timeout="auto"
                                        unmountOnExit
                                    >
                                        <List component="div" disablePadding>
                                            {item.submenu.map((subItem) => (
                                                <ListItemButton
                                                    key={subItem.id}
                                                    sx={{
                                                        pl: 4,
                                                        borderRadius: 1.5,
                                                        mb: 0.5,
                                                        "&.Mui-selected": {
                                                            backgroundColor: "rgba(33,150,243,0.08)",
                                                        },
                                                    }}
                                                    selected={currentPage === subItem.id}
                                                    onClick={() => handlePageChange(subItem.id)}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            minWidth: 40,
                                                            color:
                                                                currentPage === subItem.id
                                                                    ? "primary.main"
                                                                    : "text.secondary",
                                                        }}
                                                    >
                                                        {subItem.icon}
                                                    </ListItemIcon>
                                                    {drawerOpen && (
                                                        <ListItemText
                                                            primary={subItem.text}
                                                            primaryTypographyProps={{
                                                                fontSize: 13,
                                                                fontWeight:
                                                                    currentPage === subItem.id ? 600 : 400,
                                                            }}
                                                        />
                                                    )}
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
            case "home":
                return <HomeLayout />;
            case "device":
                return <DeviceTab />;
            case "tagname":
                return <TagName />;
            case "funcSettings":
                return <FunctionSettings />;
            case "historical":
                return <HistoricalTab />;
            default:
                return <HomeLayout />;
        }
    };

    /* ---------- NỀN CHUNG CHO MỌI TRANG ---------- */
    const isLight = theme.palette.mode === "light";
    const baseGradient = isLight
        ? "linear-gradient(180deg, #d2dff1e5 0%, #e9efd4ff 100%)"
        : "linear-gradient(180deg, #0b1220 0%, #0e172a 100%)";

    const dotColorA = isLight ? "rgba(2,6,23,0.04)" : "rgba(255,255,255,0.04)";
    const dotColorB = isLight ? "rgba(2,6,23,0.03)" : "rgba(255,255,255,0.03)";
    const bgImage = `
    radial-gradient(${dotColorA} 1px, transparent 1px),
    radial-gradient(${dotColorB} 1px, transparent 1px),
    ${baseGradient}
  `;

    return (
        // Toàn bộ layout dashboard chiếm 100% chiều cao khung 7 inch
        <Box sx={{ display: "flex", height: "100%", maxHeight: "100%" }}>
            {/* APP BAR */}
            <AppBar
                position="fixed"
                sx={{
                    width: {
                        sm: `calc(100% - ${drawerOpen ? drawerWidth : miniWidth
                            }px)`,
                    },
                    ml: { sm: `${drawerOpen ? drawerWidth : miniWidth}px` },
                    bgcolor: "background.paper",
                    color: "text.primary",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    borderBottom: 1,
                    borderColor: "divider",
                    transition: theme.transitions.create(["width", "margin-left"], {
                        duration: 250,
                        easing: theme.transitions.easing.easeInOut,
                    }),
                }}
            >
                <Toolbar>
                    {/* Title centered */}
                    <Box
                        sx={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            pointerEvents: "none",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: "primary.main" }}
                        >
                            BỘ GIÁM SÁT THU THẬP DỮ LIỆU - DATALOGER
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Real-time Clock */}
                    <Box
                        sx={{
                            mr: 1,
                            textAlign: "right",
                            display: { xs: "none", sm: "block" },
                        }}
                        aria-label="current time"
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "Roboto Mono, monospace",
                                lineHeight: 1.1,
                                color: "text.secondary",
                            }}
                        >
                            {timeLabel}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                fontFamily: "Roboto Mono, monospace",
                                color: "text.secondary",
                                opacity: 0.9,
                            }}
                        >
                            {dateLabel}
                        </Typography>
                    </Box>

                    {/* Notifications bell */}
                    <NotificationBell />

                    {/* Toggle theme */}
                    <IconButton
                        onClick={colorMode.toggleColorMode}
                        color="inherit"
                        title={
                            theme.palette.mode === "dark" ? "Chuyển sáng" : "Chuyển tối"
                        }
                        sx={{ ml: 0.5 }}
                    >
                        {theme.palette.mode === "dark" ? (
                            <Brightness7Icon />
                        ) : (
                            <Brightness4Icon />
                        )}
                    </IconButton>

                    {/* User menu */}
                    <Tooltip title="Tài khoản">
                        <IconButton
                            onClick={openUserMenu}
                            size="small"
                            sx={{ ml: 0.5 }}
                            aria-controls={userMenuOpen ? "user-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={userMenuOpen ? "true" : undefined}
                        >
                            <Avatar sx={{ width: 36, height: 36 }}>
                                {String(username).charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={userMenuEl}
                        id="user-menu"
                        open={userMenuOpen}
                        onClose={closeUserMenu}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        PaperProps={{ elevation: 4, sx: { mt: 1, minWidth: 220 } }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                                {username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                @{username}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 0.5 }} />

                        <MenuItem onClick={goMyAccount}>
                            <MenuItemIcon>
                                <PersonOutlineIcon fontSize="small" />
                            </MenuItemIcon>
                            My Account
                        </MenuItem>

                        <MenuItem onClick={goResetPassword}>
                            <MenuItemIcon>
                                <ShieldOutlinedIcon fontSize="small" />
                            </MenuItemIcon>
                            Reset Password
                        </MenuItem>

                        <Divider sx={{ my: 0.5 }} />

                        <MenuItem onClick={onLogoutClick}>
                            <MenuItemIcon>
                                <LogoutIcon fontSize="small" />
                            </MenuItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* NAV: Drawer */}
            <Box
                component="nav"
                sx={{
                    width: { sm: drawerOpen ? drawerWidth : miniWidth },
                    flexShrink: { sm: 0 },
                    height: "100%",
                }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggleMobile}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            overflowX: "hidden",
                            width: drawerOpen ? drawerWidth : miniWidth,
                            transition: theme.transitions.create("width", {
                                easing: theme.transitions.easing.easeInOut,
                                duration: 250,
                            }),
                            borderRight: 1,
                            borderColor: "divider",
                        },
                    }}
                >
                    <Paper elevation={0} square sx={{ height: "100%" }}>
                        {drawerContent}
                    </Paper>
                </Drawer>
            </Box>

            {/* MAIN – nền chung + vùng nội dung scroll trong khung */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: {
                        sm: `calc(100% - ${drawerOpen ? drawerWidth : miniWidth
                            }px)`,
                    },
                    height: "100%",
                    maxHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: theme.transitions.create(["width"], {
                        duration: 250,
                        easing: theme.transitions.easing.easeInOut,
                    }),

                    // Background cho toàn bộ trang con
                    backgroundImage: bgImage,
                    backgroundSize: "20px 20px, 40px 40px, 100% 100%",
                    backgroundPosition: "0 0, 10px 10px, 0 0",
                }}
            >
                {/* chừa khoảng cho AppBar cố định */}
                <Toolbar />

                {/* vùng nội dung thực sự: chiếm phần còn lại & scroll nếu dài */}
                <Box
                    sx={{
                        p: 0
                    }}
                >
                    {renderContent()}
                </Box>
            </Box>
        </Box>
    );
}


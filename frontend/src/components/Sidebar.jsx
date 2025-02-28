import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useMediaQuery, Box } from "@mui/material";
import { Home, Person, Menu, Brightness1, Brightness2, ExitToApp } from "@mui/icons-material";
import TableChartIcon from '@mui/icons-material/TableChart';
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useState, useContext } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { ColorModeContext } from "../App";
import { AuthContext } from "../context/auth_context/AuthContext";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from "../context/auth_context/useAuth";
import SchoolIcon from '@mui/icons-material/School';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
const Sidebar = () => {
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [open, setOpen] = useState(false);
    const colorMode = useContext(ColorModeContext);
    const { handleLogout } = useContext(AuthContext);
    const { user } = useAuth();

    const toggleDrawer = (state) => () => {
        setOpen(state);
    };

    const menuItems = [
        { text: "Trang chủ", icon: <Home />, path: "/" },
        { text: "Cá nhân", icon: <Person />, path: "/profile" },
        { text: "Thời khóa biểu", icon: <CalendarMonthIcon />, path: "/timetable" },
        { text: "Lịch sử checkin", icon: <PermContactCalendarIcon />, path: "/checkin" },
    ];
    if (user?.role === "student") {
        menuItems.push({ text: "Bảng điểm", icon: <TableChartIcon />, path: "/score" });
    }
    if (user?.role === "teacher") {
        menuItems.push({ text: "Quản lý lớp học", icon: <SchoolIcon />, path: "/classroom" });
    }
    if (user?.role === "admin") {
        menuItems.push({ text: "Quản trị", icon: <Home />, path: "/head" });
    }

    const drawerContent = (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%"}}>
            {/* LOGO */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
                <img src="/icons/logo.png" alt="Logo" style={{ height: 70 }} />
            </Box>

            <List sx={{ flexGrow: 1, px: 2 }}>
                {menuItems.map((item) => {
                    const isSelected = location.pathname === item.path;
                    return (
                        <ListItem
                            component={Link}
                            to={item.path}
                            key={item.text}
                            onClick={toggleDrawer(false)}
                            sx={{
                                cursor: "pointer",
                                borderRadius: 2,
                                width: "90%",
                                mx: "auto",
                                backgroundColor: isSelected ? "#007bff" : "transparent",
                                boxShadow: isSelected ? '0px 4px 10px rgba(0, 123, 255, 0.3)' : "none",
                                "&:hover": {
                                    backgroundColor: isSelected ? "#007bff" : theme.palette.action.hover,
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isSelected ? "white" : theme.palette.text.primary,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    color: isSelected ? "white" : theme.palette.text.primary,
                                    fontWeight: isSelected ? "bold" : "normal",
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>

            {/* Khu vực nút đổi theme + đăng xuất */}
            <Box sx={{ px: 2, pb: 2 }}>
                {/* Nút đổi theme */}
                <ListItem
                    onClick={colorMode.toggleColorMode}
                    sx={{
                        cursor: "pointer",
                        borderRadius: 2,
                        marginBottom: 2,
                        "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                        {theme.palette.mode === "dark" ? <Brightness1 /> : <Brightness2 />}
                    </ListItemIcon>
                    <ListItemText primary="Đổi nền" sx={{ color: theme.palette.text.primary }} />
                </ListItem>

                {/* Nút đăng xuất */}
                <ListItem
                    onClick={handleLogout}
                    sx={{
                        cursor: "pointer",
                        borderRadius: 2,
                        backgroundColor: theme.palette.error.dark,
                        color: theme.palette.error.contrastText,
                        "&:hover": {
                            backgroundColor: theme.palette.error.main,
                            color: theme.palette.error.contrastText,
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: theme.palette.error.contrastText }}>
                        <ExitToApp />
                    </ListItemIcon>
                    <ListItemText primary="Đăng xuất" />
                </ListItem>
            </Box>
        </Box >
    );

    return (
        <>
            {isMobile && !open && (
                <IconButton
                    onClick={toggleDrawer(true)}
                    sx={{
                        position: "fixed",
                        top: 16,
                        left: 16,
                        color: theme.palette.text.primary,
                        zIndex: 1301,
                        transition: "opacity 0.3s ease-in-out",
                    }}
                >
                    <Menu />
                </IconButton>
            )}

            {isMobile ? (
                <SwipeableDrawer
                    anchor="left"
                    open={open}
                    onClose={toggleDrawer(false)}
                    onOpen={toggleDrawer(true)}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: 260, // Sidebar rộng hơn
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
                        },
                    }}
                >
                    {drawerContent}
                </SwipeableDrawer>
            ) : (
                <Drawer
                    variant="permanent"
                    anchor="left"
                    sx={{
                        width: 260, // Sidebar rộng hơn
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: 260,
                            boxSizing: "border-box",
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            border: 'none',
                            boxShadow: theme.palette.mode === 'dark'
                                ? "0 4px 10px rgba(0, 0, 0, 0.6)"  // Bóng tối hơn khi theme dark
                                : '0px 4px 10px rgba(203, 228, 255, 0.3)',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}
        </>
    );
};

export default Sidebar;

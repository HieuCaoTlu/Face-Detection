import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useMediaQuery, Box } from "@mui/material";
import { Home, Person, Settings, Menu, Brightness4, Brightness7, ExitToApp } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useState, useContext } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { ColorModeContext } from "../App"; // Import context đổi theme
import { AuthContext } from "../context/auth_context/AuthContext"; // Import context Auth

const Sidebar = () => {
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [open, setOpen] = useState(false);
    const colorMode = useContext(ColorModeContext); // Lấy function đổi theme
    const { handleLogout } = useContext(AuthContext); // Lấy function logout từ AuthProvider

    const toggleDrawer = (state) => () => {
        setOpen(state);
    };

    const menuItems = [
        { text: "Home", icon: <Home />, path: "/" },
        { text: "Profile", icon: <Person />, path: "/profile" },
        { text: "Settings", icon: <Settings />, path: "/settings" },
    ];

    const drawerContent = (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem
                        component={Link}
                        to={item.path}
                        key={item.text}
                        onClick={toggleDrawer(false)}
                        sx={{
                            cursor: "pointer",
                            backgroundColor: location.pathname === item.path ? theme.palette.action.selected : "transparent",
                            "&:hover": {
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: theme.palette.text.primary }}>{item.icon}</ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            sx={{
                                fontWeight: location.pathname === item.path ? "bold" : "normal",
                                color: theme.palette.text.primary,
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            {/* Khu vực nút đổi theme + đăng xuất */}
            <Box sx={{ position: "absolute", bottom: 0, width: "100%" }}>
                {/* Nút đổi theme */}
                <ListItem
                    onClick={colorMode.toggleColorMode}
                    sx={{
                        cursor: "pointer",
                        "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                        {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                    </ListItemIcon>
                    <ListItemText primary="Toggle Theme" sx={{ color: theme.palette.text.primary }} />
                </ListItem>

                {/* Nút đăng xuất */}
                <ListItem
                    onClick={handleLogout}
                    sx={{
                        cursor: "pointer",
                        backgroundColor: theme.palette.error.dark, // 🔴 Màu đỏ nhẹ luôn hiển thị
                        color: theme.palette.error.contrastText,
                        "&:hover": {
                            backgroundColor: theme.palette.error.main, // 🔴 Hover đậm hơn
                            color: theme.palette.error.contrastText,
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: theme.palette.error.contrastText }}>
                        <ExitToApp />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </Box>
        </Box>
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
                            width: 240,
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
                        width: 240,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: 240,
                            boxSizing: "border-box",
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
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

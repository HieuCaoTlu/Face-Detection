import { useState, useEffect } from "react";
import { useAuth } from "../context/auth_context/useAuth";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Paper } from '@mui/material';
import { useSnackbar } from "../context/snackbar_context/useSnackbar";
import { useTheme } from "@mui/material/styles";

export default function Login() {
    const { handleLogin } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const theme = useTheme();

    // Trạng thái để điều khiển hiệu ứng
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 50); // Kích hoạt hiệu ứng sau khi component mount
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (username.length < 1 || password.length < 1) {
                showSnackbar(`Vui lòng nhập đủ thông tin!`, 'error');
                return;
            }
            await handleLogin(username, password);
            showSnackbar('Đăng nhập thành công!', 'success');
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            showSnackbar(error, 'error');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundImage: "url('/bgr/bgr.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative', // Để overlay che toàn bộ nền
                '&::before': theme.palette.mode === 'dark' ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000', // Lớp phủ tối
                    opacity: '80%', // Làm mờ nền
                } : {}
            }}

        >
            <Paper
                sx={{
                    padding: 3,
                    maxWidth: 400,
                    width: '100%',
                    boxShadow: theme.palette.mode === 'dark'
                        ? "0 4px 10px rgba(0, 0, 0, 0.6)"  // Bóng tối hơn khi theme dark
                        : "0 4px 6px rgba(255, 255, 255, 0.658)",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease'
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 3 }}>
                    <img src={
                        theme.palette.mode === 'dark'
                            ? './icons/white_logo.png'
                            : './icons/large_logo.png'
                    } alt="Logo" style={{ height: 70 }} />
                </Box>
                <form onSubmit={onSubmit}>
                    <TextField
                        label="Tên người dùng"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="current-username"
                        sx={{
                            marginBottom: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? 'rgba(66, 66, 66, 0.6)'
                                    : 'rgba(240, 240, 240, 0.6)',
                                '& fieldset': { border: 'none' },
                            }
                        }}
                    />
                    <TextField
                        label="Mật khẩu"
                        variant="outlined"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{
                            marginBottom: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? 'rgba(66, 66, 66, 0.6)'
                                    : 'rgba(240, 240, 240, 0.6)',
                                '& fieldset': { border: 'none' },
                            }
                        }}
                        autoComplete="current-password"
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Đăng nhập
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

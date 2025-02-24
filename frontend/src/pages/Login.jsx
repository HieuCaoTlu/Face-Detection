import { useState } from "react";
import { useAuth } from "../context/auth_context/useAuth"; // Giả sử useAuth cung cấp hàm handleLogin
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import { useSnackbar } from "../context/snackbar_context/useSnackbar";

export default function Login() {
    const { handleLogin } = useAuth(); // Lấy handleLogin từ useAuth
    const [username, setUsername] = useState(""); // Lưu trữ tên người dùng
    const [password, setPassword] = useState(""); // Lưu trữ mật khẩu
    const navigate = useNavigate(); // Dùng để điều hướng
    const { showSnackbar } = useSnackbar();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (username.length < 1 || password < 1) {
                showSnackbar(`Vui lòng nhập đủ thông tin!`, 'error');
                return;
            }
            // Gọi hàm handleLogin từ useAuth và truyền tên người dùng, mật khẩu
            await handleLogin(username, password);
            showSnackbar('Đăng nhập thành công!', 'success');
            setTimeout(() => {
                navigate('/');
            }, 1000); // Nếu đăng nhập thành công, điều hướng về trang chính
        } catch (error) {
            showSnackbar(error, 'error');
            // Có thể hiển thị thông báo lỗi ở đây nếu cần
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'background.default',
            }}
        >
            <Paper sx={{ padding: 3, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
                    Đăng nhập
                </Typography>
                <form onSubmit={onSubmit}>
                    <TextField
                        label="Tên người dùng"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ marginBottom: 2 }}
                        autoComplete="current-username"
                    />
                    <TextField
                        label="Mật khẩu"
                        variant="outlined"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ marginBottom: 3 }}
                        autoComplete="current-password" // Thêm thuộc tính autocomplete
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Đăng nhập
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

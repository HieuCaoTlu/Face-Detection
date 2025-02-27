import { useState } from "react";
import { TextField, Button, Box, Alert } from "@mui/material";
import { changePassword } from '../api/changePassword';
import { useTheme } from "@mui/material/styles";

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const theme = useTheme();

    const validatePassword = (password) => {
        return password.length > 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
    };

    const handleSubmit = async () => {
        setMessage("");
        setError("");

        if (!validatePassword(newPassword)) {
            setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm số và chữ.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }

        try {
            await changePassword(oldPassword, newPassword);
            setMessage("Đổi mật khẩu thành công!");
        } catch (error) {
            console.log(error)
            setError("Đổi mật khẩu thất bại, vui lòng thử lại.");
        }
    };

    return (
        <Box>
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="Mật khẩu cũ"
                type="password"
                fullWidth
                margin="normal"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(26, 26, 26, 0.6)'  // Màu tối hơn khi theme dark
                            : 'rgba(240, 240, 240, 0.6)', // Màu sáng khi theme light
                        '& fieldset': {
                            border: 'none', // Loại bỏ border
                        },
                    }
                }}
            />
            <TextField
                label="Mật khẩu mới"
                type="password"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(26, 26, 26, 0.6)'  // Màu tối hơn khi theme dark
                            : 'rgba(240, 240, 240, 0.6)', // Màu sáng khi theme light
                        '& fieldset': {
                            border: 'none', // Loại bỏ border
                        },
                    }
                }}
            />
            <TextField
                label="Xác nhận mật khẩu"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(26, 26, 26, 0.6)'  // Màu tối hơn khi theme dark
                            : 'rgba(240, 240, 240, 0.6)', // Màu sáng khi theme light
                        '& fieldset': {
                            border: 'none', // Loại bỏ border
                        },
                    }
                }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} sx={{ marginBlock: '10px', p: 2 }}>
                Đổi mật khẩu
            </Button>
        </Box>
    );
}
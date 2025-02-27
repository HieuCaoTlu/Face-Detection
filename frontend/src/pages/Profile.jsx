import { useState } from "react";
import { Typography, Chip, Button, Box, Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useAuth } from "../context/auth_context/useAuth";
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from "../context/snackbar_context/useSnackbar";
import TrainCamera from "../components/TrainCamera";
import ChangePassword from "./Password";

export default function Profile() {
  const { user, setUser } = useAuth();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSuccess = () => {
    setOpenDialog(false);
    const updatedUser = { ...user, face_auth: true };
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    showSnackbar("Cài đặt xác thực thành công!", "success");
  };


  return (
    <>
      {/* Tiêu đề */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "start", marginTop: { xs: 3, md: 5 } }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginRight: 2 }}>
          {user?.name || "Khách"}
        </Typography>

        {user?.role && (
          <Chip
            variant="outlined"
            label={user.role}
            color={user.role === "admin" ? "error" : user.role === "teacher" ? "primary" : "success"}
            sx={{ fontSize: "1.2rem", padding: "8px 16px" }}
          />
        )}
      </Box>

      <Grid container spacing={2}>
        {/* Thông tin xác thực khuôn mặt */}
        <Grid item xs={12} md={6}>
          <Box sx={{ padding: 2, borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)", backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", padding: 1 }}>
              <Avatar sx={{ width: 60, height: 60, marginRight: 2 }} src={user?.avatar} />
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="h6">Xác thực mặt</Typography>
                <Chip label={user?.face_auth ? "Đã kích hoạt" : "Chưa kích hoạt"} color={user?.face_auth ? "success" : "error"} size="small" sx={{ fontSize: "0.8rem", marginLeft: 1 }} />
              </Box>
            </Box>

            {!user?.face_auth && (
              <Button variant="contained" size="large" sx={{ marginTop: 1 }} onClick={() => setOpenDialog(true)}>
                Kích hoạt
              </Button>
            )}
          </Box>
        </Grid>

        {/* Box thông tin cá nhân */}
        <Grid item xs={12} md={6}>
          <Box sx={{ padding: 2, borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)", backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff" }}>
            <Typography variant="h6">Mã người dùng: {user?.id || "Chưa cập nhật"}</Typography>
            <Typography variant="body1">Ngày sinh: {user?.dob || "Chưa cập nhật"}</Typography>
            <Typography variant="body1">Số điện thoại: {user?.phone_number || "Chưa cập nhật"}</Typography>
          </Box>
        </Grid>

        {/* Box đổi mật khẩu */}
        <Grid item xs={12} md={6}>
          <Box sx={{ padding: 2, borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)", backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff" }}>
            <Typography variant="h6">Đổi mật khẩu</Typography>
            <ChangePassword />
          </Box>
        </Grid>
      </Grid >

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Xác thực khuôn mặt</DialogTitle>
        <DialogContent>
          <TrainCamera onSuccess={handleSuccess} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>

    </>
  );
}

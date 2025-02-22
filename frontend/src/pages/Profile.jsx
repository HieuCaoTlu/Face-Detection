import { Typography, Chip, Button, Box, Grid, Avatar } from "@mui/material";
import { useAuth } from "../context/auth_context/useAuth";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";


export default function Profile() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate()

  // Xác định màu sắc của Chip dựa trên role
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error'; // Đỏ cho admin
      case 'teacher':
        return 'primary'; // Xanh dương cho teacher
      case 'student':
        return 'success'; // Xanh lá cho student
      default:
        return 'default'; // Mặc định nếu không có role
    }
  };

  // Xử lý xác thực khuôn mặt
  const handleFaceAuth = () => {
    // Logic xác thực khuôn mặt, có thể mở một modal hoặc trang mới
    navigate('/test');
  };

  return (
    <>
      {/* Tiêu đề và Chip */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "start", marginTop: { xs: 3, md: 5 } }}>
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            marginRight: 2, // Khoảng cách giữa tiêu đề và Chip
          }}
        >
          {user?.name || "Khách"}
        </Typography>

        {/* Hiển thị Chip nếu có role */}
        {user?.role && (
          <Chip
            variant="outlined"
            label={user.role}
            color={getRoleColor(user.role)} // Màu sắc tùy theo role
            sx={{
              fontSize: "1.2rem", // Đặt kích thước chữ cho Chip lớn hơn
              padding: "8px 16px", // Đặt khoảng cách xung quanh chữ
            }}
          />
        )}
      </Box>

      {/* Thông tin cá nhân */}
      <Grid container spacing={2}>
        {/* Thông tin xác thực khuôn mặt */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "1px solid #ddd",
              padding: 2,
              borderRadius: 2,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)", // Bóng nhẹ
              backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", // Màu nền ngả đen khi dark, trắng khi light
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // Để các phần tử nằm cách nhau
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", padding: 1 }}>
              {/* Avatar */}
              <Avatar sx={{ width: 60, height: 60, marginRight: 2 }} src={user?.avatar} />
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap:1 }}>
                <Typography variant="h6">
                  Xác thực sinh học
                </Typography>
                {user?.face_auth ? (
                  <Chip
                    label="Đã kích hoạt"
                    color="success"
                    size="small"
                    sx={{ fontSize: "0.8rem", marginLeft: 1 }}
                  />
                ) : (
                  <Chip
                    label="Chưa kích hoạt"
                    color="error"
                    size="small"
                    sx={{ fontSize: "0.8rem", marginLeft: 1 }}
                  />
                )}
              </Box>
            </Box>


            {!user?.face_auth && (
              <Button
                variant="contained"
                onClick={handleFaceAuth}
                size="large"
                sx={{ marginTop: 1 }} // Khoảng cách giữa chip và nút
              >
                Kích hoạt
              </Button>
            )}
          </Box>
        </Grid>

        {/* Box 2 - Thông tin cá nhân khác */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              border: "1px solid #ddd",
              padding: 2,
              borderRadius: 2,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)", // Bóng nhẹ
              backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", // Bóng nhẹ
            }}
          >
            <Typography variant="h6">
              Mã người dùng: {user?.id || "Chưa cập nhật"}
            </Typography>

            <Typography variant="body1">
              Ngày sinh: {user?.dob || "Chưa cập nhật"}
            </Typography>

            <Typography variant="body1">
              Số điện thoại: {user?.phone_number || "Chưa cập nhật"}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

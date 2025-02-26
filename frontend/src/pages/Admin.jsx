import { Typography, Button, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

export default function Admin() {
    const navigate = useNavigate();
    const theme = useTheme();
    return (
        <>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
                Quản trị
            </Typography>
            <Box sx={{ marginTop: 2, border: "1px solid #ddd", padding: 3, borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)", backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Quản lí sinh viên
                    </Typography>
                    <Typography variant="body">
                        Danh sách sinh viên và nhập danh sách sinh viên
                    </Typography>
                </Box>
                <Button variant="contained" component="span" onClick={() => navigate("/admin_student")}>Truy cập</Button>
            </Box>
            <Box sx={{ marginTop: 2, border: "1px solid #ddd", padding: 3, borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)", backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Quản lí giáo viên
                    </Typography>
                    <Typography variant="body">
                        Danh sách giáo viên và nhập danh sách giáo viên
                    </Typography>
                </Box>
                <Button variant="contained" component="span" onClick={() => navigate("/admin_teacher")}>Truy cập</Button>
            </Box>
            <Box sx={{ marginTop: 2, border: "1px solid #ddd", padding: 3, borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)", backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Quản lí lớp học
                    </Typography>
                    <Typography variant="body">
                        Khởi tạo lớp học và thêm sinh viên.
                    </Typography>
                </Box>
                <Button variant="contained" component="span" onClick={() => navigate("/admin_class")}>Truy cập</Button>
            </Box>
        </>
    );
}

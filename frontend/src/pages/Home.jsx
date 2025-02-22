import { useState } from "react";
import { Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Button } from "@mui/material";
import { useAuth } from "../context/auth_context/useAuth"; // Lấy dữ liệu người dùng
import CurrentTime from "../components/CurrentTime"; // Import component CurrentTime
import { useTheme } from "@mui/material/styles";
import CheckinDialog from "../components/CheckinDialog"; // Import component CheckinDialog

export default function Home() {
    const { user } = useAuth(); // Lấy dữ liệu người dùng
    const [classrooms, setClassrooms] = useState([
        { name: "Math 101", startTime: "09:00", endTime: "10:30", checkin: false },
        { name: "Science 101", startTime: "11:00", endTime: "12:30", checkin: false },
        { name: "History 101", startTime: "13:00", endTime: "14:30", checkin: true },
    ]);
    const [openDialog, setOpenDialog] = useState(false); // Trạng thái mở box
    const [selectedClassroom, setSelectedClassroom] = useState(null); // Lớp học được chọn
    const theme = useTheme();

    // Lấy lớp học chưa check-in tiếp theo
    const nextClassroom = classrooms.find(classroom => !classroom.checkin);

    // Hàm xử lý check-in
    const handleCheckin = (classroom) => {
        setClassrooms(prevClassrooms =>
            prevClassrooms.map(c =>
                c.name === classroom.name ? { ...c, checkin: true } : c
            )
        );
        setSelectedClassroom(classroom); // Gán lớp học đã chọn
        setOpenDialog(true); // Mở box
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <>
            <Typography
                variant="h2"
                gutterBottom
                sx={{
                    fontWeight: "bold",
                    marginTop: { xs: 3, md: 5 },
                    WebkitBackgroundClip: "text",
                }}
            >
                Xin chào, {user?.name || "Khách"}
            </Typography>

            <Grid container spacing={2}>
                {/* Thời gian hiện tại và số lớp đã check-in */}
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        border: "1px solid #ddd", padding: 2, borderRadius: 2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)", // Bóng nhẹ
                        backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", // Màu nền ngả đen khi dark, trắng khi light
                    }}>
                        <Typography variant="h7" gutterBottom>
                            Thời gian hiện tại
                        </Typography>
                        <CurrentTime />
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            border: "1px solid #ddd",
                            padding: 2,
                            borderRadius: 2,
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
                            backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", // Bóng nhẹ
                        }}
                    >
                        <Typography variant="h7" gutterBottom>
                            Lớp cần điểm danh tiếp theo
                        </Typography>
                        <Typography variant="h5">
                            {nextClassroom ? `${nextClassroom.name} (${nextClassroom.startTime})` : "Không có lớp học cần điểm danh"}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    {/* Bảng hiển thị danh sách lớp học */}
                    <TableContainer sx={{
                        border: "1px solid #ddd", borderRadius: 2,
                        backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    }}>
                        <Typography variant="h6" sx={{
                            fontWeight: "bold", padding: 3,
                        }}>
                            Danh sách các lớp học
                        </Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontSize: "16px" }}>Lớp học</TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>Thời gian bắt đầu</TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>Thời gian kết thúc</TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>Check-in</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classrooms.map((classroom) => (
                                    <TableRow key={classroom.name}>
                                        <TableCell sx={{ fontSize: "16px" }}>{classroom.name}</TableCell>
                                        <TableCell sx={{ fontSize: "16px" }}>{classroom.startTime}</TableCell>
                                        <TableCell sx={{ fontSize: "16px" }}>{classroom.endTime}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleCheckin(classroom)}
                                                disabled={classroom.checkin}
                                            >
                                                {classroom.checkin ? "Đã check-in" : "Check-in"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                    </TableContainer>
                </Grid>
            </Grid>

            {/* Sử dụng CheckinDialog */}
            <CheckinDialog open={openDialog} onClose={handleCloseDialog} selectedClassroom={selectedClassroom} />
        </>
    );
};

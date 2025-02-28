import { useState, useEffect } from "react";
import { Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Button, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../context/auth_context/useAuth";
import CurrentTime from "../components/CurrentTime";
import { useTheme } from "@mui/material/styles";
import { getClassSessions } from "../api/sessionClass";
import CameraComponent from "../components/Camera";
import { useSnackbar } from "../context/snackbar_context/useSnackbar";

export default function Home() {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const { showSnackbar } = useSnackbar();
    const theme = useTheme();

    const fetchClassSessions = async () => {
        setLoading(true);
        try {
            const sessions = await getClassSessions();
            setClassrooms(sessions.map(session => ({
                id: session.id,
                name: session.classroom,
                startTime: session.start_time,
                endTime: session.end_time,
                checkin: session.checkin,
                ready: session.ready,
            })));
        } catch (err) {
            console.error("[API Error]:", err);
            setError("Lỗi khi gọi API.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassSessions();
    }, []);

    const handleReload = () => {
        sessionStorage.removeItem("classSessions");
        fetchClassSessions();
    };

    const handleCheckin = (classroom) => {
        if (user.face_auth) {
            setSelectedClassroom(classroom);
            setOpenDialog(true);
        }
        else showSnackbar("Bạn chưa cài đặt xác thực", "error")
    };

    const nextClassroom = classrooms.find(classroom => !classroom.checkin);

    const handleCloseDialog = () => {
        fetchClassSessions();
        setOpenDialog(false);
    };


    const handleCheckinSuccess = () => {
        setOpenDialog(false);
        setTimeout(() => {  // Đợi một chút trước khi cập nhật
            fetchClassSessions();
        }, 500);  // 0.5 giây để đảm bảo cập nhật sau khi Dialog đóng
    };


    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
                Xin chào, {user?.name || "Khách"}
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        padding: 2, borderRadius: 2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                        backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff",
                    }}>
                        <Typography variant="h7" gutterBottom>
                            Thời gian hiện tại
                        </Typography>
                        <CurrentTime />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        padding: 2, borderRadius: 2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                        backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff",
                    }}>
                        <Typography variant="h7" gutterBottom>
                            Lớp cần điểm danh tiếp theo
                        </Typography>
                        <Typography variant="h5">
                            {nextClassroom ? `${nextClassroom.name} (${nextClassroom.startTime})` : "Không có lớp học cần điểm danh"}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer sx={{
                        borderRadius: 2,
                        backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                        position: "relative"
                    }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 2 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    Danh sách các lớp hôm nay
                                </Typography>
                                <Typography variant="body2" color="error">
                                    *Lưu ý: Trễ 15 phút sẽ bị tính là điểm danh muộn.
                                </Typography>
                            </Box>
                            <IconButton onClick={handleReload}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontSize: "16px" }}>Lớp học</TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>Thời gian bắt đầu</TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>Thời gian kết thúc</TableCell>
                                    <TableCell sx={{ fontSize: "16px" }}>Điểm danh</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classrooms.map((classroom) => (
                                    <TableRow key={classroom.id}>
                                        <TableCell sx={{ fontSize: "16px" }}>{classroom.name}</TableCell>
                                        <TableCell sx={{ fontSize: "16px" }}>{classroom.startTime}</TableCell>
                                        <TableCell sx={{ fontSize: "16px" }}>{classroom.endTime}</TableCell>
                                        <TableCell>
                                            {classroom.ready ? (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleCheckin(classroom)}
                                                    disabled={classroom.checkin}
                                                >
                                                    {classroom.checkin ? "Đã điểm danh" : "Điểm danh"}
                                                </Button>
                                            ) : <Button
                                                variant="contained"
                                                color="primary"
                                                disabled
                                            >
                                                Chưa tới giờ học
                                            </Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Điểm danh</DialogTitle>
                <DialogContent>
                    <CameraComponent id={selectedClassroom?.id || -1} onSuccess={handleCheckinSuccess} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

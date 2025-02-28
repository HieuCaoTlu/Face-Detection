import { useEffect, useState } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box } from "@mui/material";
import { getFaceAuth } from "../api/checkin"; // Import hàm gọi API

export default function Checkin() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getFaceAuth();
                setLogs(data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <Box sx={{ mt: { xs: 3, md: 5 } }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold" }}>
                Lịch sử điểm danh
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={3}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>STT</strong></TableCell>
                                <TableCell><strong>Phòng học</strong></TableCell>
                                <TableCell><strong>Giờ học</strong></TableCell>
                                <TableCell><strong>Thời gian điểm danh</strong></TableCell>
                                <TableCell><strong>Trạng thái</strong></TableCell>
                                <TableCell><strong>Ghi chú</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{log.classroom}</TableCell>
                                    <TableCell>{log.class_session.start_time}</TableCell>
                                    <TableCell>{log.created_at}</TableCell>
                                    <TableCell sx={{ color: log.is_valid ? "green" : "red", fontWeight: "bold" }}>
                                        {log.is_valid ? "Hợp lệ" : "Không hợp lệ"}
                                    </TableCell>
                                    <TableCell sx={{ color: log.comment === "Đúng giờ" ? "green" : "red", fontWeight: "bold" }}>
                                        {log.comment}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

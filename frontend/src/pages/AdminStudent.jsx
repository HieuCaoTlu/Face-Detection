import { Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogContent, DialogTitle, DialogActions, CircularProgress } from "@mui/material";
import { createStudent, getStudent } from "../api/admin";
import { useEffect, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import Confetti from "react-confetti";

export default function AdminStudent() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const response = await getStudent();
                setStudents(response);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách sinh viên:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        setLoading(true);
        try {
            const response = await createStudent(uploadedFile);
            setDownloadUrl(response.data.url);
            setOpenDialog(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);

            const updatedStudents = await getStudent();
            setStudents(updatedStudents);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
                Danh sách sinh viên
            </Typography>
            <Box display="flex" gap={2} mb={2} justifyContent="start" alignItems="center" flexWrap="wrap">
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                        height: 55,
                    }}
                >
                    Nhập danh sách sinh viên từ Excel
                    <input type="file" accept=".xlsx" style={{ display: "none" }} onChange={handleUpload} />
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ height: 55 }}
                    href="https://docs.google.com/spreadsheets/d/1HfBwt_eB7i9sl1XfYZRzNQ4V7BIy6BEY/edit?usp=sharing&ouid=116080108977609860433&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer"
                >
                    Lấy Excel nhập thông tin mẫu
                </Button>
                <TextField
                    label="Tìm kiếm sinh viên"
                    variant="outlined"
                    sx={{ flex:1, width: '100%' }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
                    <CircularProgress />
                </Box>
            ) : (
                students.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Họ tên</TableCell>
                                    <TableCell>Mã sinh viên</TableCell>
                                    <TableCell>Giới tính</TableCell>
                                    <TableCell>Điện thoại</TableCell>
                                    <TableCell>Ngày sinh</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.username}</TableCell>
                                        <TableCell>{student.gender === "M" ? "Nam" : "Nữ"}</TableCell>
                                        <TableCell>{student.phone_number}</TableCell>
                                        <TableCell>{student.dob}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            )}

            {showConfetti && <Confetti />}

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    <Typography fontWeight="bold" align="center">
                        Tạo sinh viên thành công
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Paper sx={{ display: "flex", alignItems: "center", padding: 2, gap: 2 }}>
                        <InsertDriveFileIcon fontSize="large" color="primary" />
                        <Typography variant="body1">
                            Bảng thông tin sinh viên.XLSX
                        </Typography>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center" }}>
                    <Button variant="contained" color="primary" href={downloadUrl} download>
                        Tải xuống
                    </Button>
                    <Button variant="outlined" color="info" onClick={handleCloseDialog}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

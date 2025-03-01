import { Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, FormControl, MenuItem, InputLabel, Select, Dialog, DialogContent, DialogTitle, DialogActions, CircularProgress } from "@mui/material";
import { createStudent, getTeacher, changeUserInfo } from "../api/admin";
import { useEffect, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import Confetti from "react-confetti";
import { useTheme } from "@mui/material/styles";


export default function AdminTeacher() {
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");
    const [editGender, setEditGender] = useState("");
    const [editDob, setEditDob] = useState("");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const response = await getTeacher();
                // Kiểm tra nếu teacher.dob là null, đặt thành "2025-01-01"
                const updatedTeachers = response.map((teacher) => ({
                    ...teacher,
                    dob: teacher.dob ? teacher.dob : "2025-01-01",
                    phone_number: teacher.phone_number ? teacher.phone_number : "123456789"
                }));
                setTeachers(updatedTeachers);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách giáo viên:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredTeachers = teachers.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false)
    }

    const handleEditClick = (student) => {
        setEditStudent(student);
        setEditName(student.name);
        setEditPhoneNumber(student.phone_number);
        setEditGender(student.gender);
        setEditDob(formatDate(student.dob));
        setOpenEditDialog(true);
    };

    const formatDate = (date) => {
        // Convert date from yyyy-mm-dd to dd/mm/yyyy
        if (date === null) return
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            console.log(editDob)
            const updatedStudent = {
                name: editName,
                phone_number: editPhoneNumber,
                gender: editGender,
                dob: editDob,
            };

            await changeUserInfo(editStudent.id, updatedStudent);
            // Update the student list after successful update
            const updatedStudents = await getTeacher();
            const updated = updatedStudents.map((teacher) => ({
                ...teacher,
                dob: teacher.dob ? teacher.dob : "2025-01-01",
                phone_number: teacher.phone_number ? teacher.phone_number : "123456789"
            }));
            setTeachers(updated);
            handleCloseEditDialog();
        } catch (error) {
            console.error("Error updating student information:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        setLoading(true);
        try {
            const response = await createStudent(uploadedFile, "teacher");
            setDownloadUrl(response.data.url);
            setOpenDialog(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);

            const updatedStudents = await getTeacher();
            setTeachers(updatedStudents);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
                Danh sách giáo viên
            </Typography>
            <Box display="flex" gap={2} mb={2} justifyContent="center" alignItems="center">
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ flex: 1, height: 55 }}
                >
                    Nhập danh sách giáo viên từ Excel
                    <input type="file" accept=".xlsx" style={{ display: "none" }} onChange={handleUpload} />
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ flex: 1, height: 55 }}
                    href="https://docs.google.com/spreadsheets/d/1HfBwt_eB7i9sl1XfYZRzNQ4V7BIy6BEY/edit?usp=sharing&ouid=116080108977609860433&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer"
                >
                    Lấy Excel nhập thông tin mẫu
                </Button>
                <TextField
                    label="Tìm kiếm giáo viên"
                    variant="outlined"
                    sx={{
                        width: '50%',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: theme.palette.mode === "dark"
                                ? 'rgba(50, 50, 50, 0.6)'  // Màu tối hơn khi dark mode
                                : 'rgb(255, 255, 255)', // Màu sáng khi light mode
                            '& fieldset': {
                                border: 'none', // Loại bỏ border
                            },
                        }
                    }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
                    <CircularProgress />
                </Box>
            ) : (
                teachers.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Họ tên</TableCell>
                                    <TableCell>Mã giáo viên</TableCell>
                                    <TableCell>Giới tính</TableCell>
                                    <TableCell>Điện thoại</TableCell>
                                    <TableCell>Ngày sinh</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTeachers.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.username}</TableCell>
                                        <TableCell>{student.gender === "M" ? "Nam" : "Nữ"}</TableCell>
                                        <TableCell>{student.phone_number}</TableCell>
                                        <TableCell>{formatDate(student.dob)}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary" onClick={() => handleEditClick(student)}>
                                                Sửa
                                            </Button>
                                        </TableCell>
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
                        Tạo giáo viên thành công
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Paper sx={{ display: "flex", alignItems: "center", padding: 2, gap: 2 }}>
                        <InsertDriveFileIcon fontSize="large" color="primary" />
                        <Typography variant="body1">
                            Bảng thông tin giáo viên.XLSX
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

            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} sx={{p: 3}}>
                <DialogTitle>
                    <Typography fontWeight="bold" align="center">
                        {editStudent ? "Chỉnh sửa thông tin giáo viên" : "Tạo giáo viên thành công"}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Họ tên"
                        variant="outlined"
                        fullWidth
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Số điện thoại"
                        variant="outlined"
                        fullWidth
                        value={editPhoneNumber}
                        onChange={(e) => setEditPhoneNumber(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel>Giới tính</InputLabel>
                        <Select
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value)}
                            label="Giới tính"
                        >
                            <MenuItem value="M">Nam</MenuItem>
                            <MenuItem value="F">Nữ</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Ngày sinh"
                        variant="outlined"
                        fullWidth
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center" }}>
                    <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                        Lưu thay đổi
                    </Button>
                    <Button variant="outlined" color="info" onClick={handleCloseEditDialog}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

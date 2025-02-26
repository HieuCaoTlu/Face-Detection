import { useEffect, useState } from "react";
import {
    Typography,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Breadcrumbs,
    Link,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    Grid,
    Chip
} from "@mui/material";
import { getTeacherClassroomsWithStudent, getStudent, addStudentClassroom, getStudentPrint } from "../api/admin";
import { useNavigate } from "react-router-dom";

export default function AdminClass() {
    const navigate = useNavigate(); // Dùng để điều hướng
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState(["Lớp học"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [studentSearchTerm, setStudentSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const handlePrint = async () => {
        if (selectedClass) {
            try {
                const response = await getStudentPrint(selectedClass.id);
                if (response?.data?.url) {
                    window.location.href = response.data.url;
                } else {
                    console.error("Không tìm thấy URL tải file.");
                }
            } catch (error) {
                console.error("Lỗi tải danh sách sinh viên:", error);
            }
        }
    };


    async function fetchClasses() {
        const response = await getTeacherClassroomsWithStudent();
        if (response?.data.classrooms) {
            const formattedClasses = response.data.classrooms.map((cls) => ({
                id: cls.id,
                name: cls.name,
                teacher: cls.teacher,
                studentCount: cls.students.length,
                sessionCount: cls.class_sessions.length,
                students: cls.students,
            }));
            setClasses(formattedClasses);
        }
    }

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleShowStudents = (classroom) => {
        setSelectedClass(classroom);
        setBreadcrumbs(["Lớp học", "Danh sách sinh viên"]);
        setStudents(classroom.students);
    };

    const handleBackToClasses = () => {
        setSelectedClass(null);
        setBreadcrumbs(["Lớp học"]);
    };

    const handleOpenDialog = async () => {
        const allAvailableStudents = await getStudent();
        const filteredStudents = allAvailableStudents.filter(
            (student) => !selectedClass.students.some((s) => s.id === student.id)
        );
        setAllStudents(filteredStudents);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudents([]);
    };

    const handleSelectStudent = (student) => {
        setSelectedStudents((prev) =>
            prev.some((s) => s.id === student.id) ? prev : [...prev, student]
        );
    };

    const handleDeselectStudent = (studentId) => {
        setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
    };


    const handleConfirmAddStudents = async () => {
        if (selectedClass && selectedStudents.length > 0) {
            const studentIds = selectedStudents.map((s) => s.id);
            console.log("Calling API addStudentClassroom with:", selectedClass.id, studentIds);

            await addStudentClassroom(selectedClass.id, studentIds.join(","));

            setStudents((prevStudents) => [...prevStudents, ...selectedStudents]);
            handleCloseDialog();
        }
    };

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: 2 }}>
                <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
                    {selectedClass ? selectedClass.name : "Quản lý lớp"}
                </Typography>
                {selectedClass && <Chip
                    variant="outlined"
                    label={`Mã lớp: ${selectedClass.id}`}
                    color="primary"
                    sx={{ fontSize: "1.2rem", padding: "8px 16px" }}
                />}
            </Box>

            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 2 }}>
                {breadcrumbs.map((crumb, index) => (
                    <Link
                        key={index}
                        underline="hover"
                        color="inherit"
                        onClick={handleBackToClasses}
                        sx={{ cursor: "pointer" }}
                    >
                        {crumb}
                    </Link>
                ))}
            </Breadcrumbs>

            {!selectedClass && (
                <>
                    <Box display="flex" gap={2} alignItems="stretch">
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ height: "100%" }} // Đảm bảo nút lấp đầy chiều cao
                                onClick={() => navigate("/admin_make")}
                            >
                                Tạo lớp học
                            </Button>
                        </Box>
                        <Box flex={1}>
                            <TextField
                                fullWidth
                                label="Tìm lớp học"
                                variant="outlined"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Box>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã lớp</TableCell>
                                    <TableCell>Tên lớp</TableCell>
                                    <TableCell>Giáo viên</TableCell>
                                    <TableCell>Số sinh viên</TableCell>
                                    <TableCell>Số buổi học</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classes
                                    .filter((cls) => cls.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((classroom) => (
                                        <TableRow key={classroom.id}>
                                            <TableCell>{classroom.id}</TableCell>
                                            <TableCell>{classroom.name}</TableCell>
                                            <TableCell>{classroom.teacher}</TableCell>
                                            <TableCell>{classroom.studentCount}</TableCell>
                                            <TableCell>{classroom.sessionCount}</TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={() => handleShowStudents(classroom)}>
                                                    Xem danh sách
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {selectedClass && (
                <>
                    <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                        <Grid item xs={12} sm={4} sx={{ display: "flex", gap: 1 }}>
                            <Button variant="contained" color="secondary" sx={{ flexGrow: 1 }} onClick={handleOpenDialog}>
                                Thêm sinh viên mới
                            </Button>
                            <Button variant="contained" sx={{ flexGrow: 1 }} onClick={handlePrint} >
                                In danh sách sinh viên
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Tìm sinh viên"
                                variant="outlined"
                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Tên</TableCell>
                                    <TableCell>Mã SV</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students
                                    .filter((student) =>
                                        student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                        student.username.toLowerCase().includes(studentSearchTerm.toLowerCase())
                                    )
                                    .map((student, index) => (
                                        <TableRow key={student.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.username}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Thêm sinh viên</DialogTitle>
                <DialogContent>
                    {/* Thanh tìm kiếm sinh viên */}
                    <TextField
                        fullWidth
                        label="Tìm sinh viên"
                        variant="outlined"
                        sx={{ marginTop: 2, marginBottom: 2 }}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                    />

                    {/* Chỉ hiển thị danh sách khi có kết quả tìm kiếm */}
                    {studentSearchTerm && (
                        <List sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", borderRadius: 1 }}>
                            {allStudents
                                .filter((student) =>
                                    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                    student.username.toLowerCase().includes(studentSearchTerm.toLowerCase())
                                )
                                .map((student) => (
                                    <ListItem key={student.id} button="true" onClick={() => handleSelectStudent(student)}>
                                        <Checkbox checked={selectedStudents.some((s) => s.id === student.id)} />
                                        <ListItemText primary={`${student.username} - ${student.name}`} />
                                    </ListItem>
                                ))}
                        </List>
                    )}

                    {/* Danh sách sinh viên đã chọn */}
                    {selectedStudents.length > 0 && allStudents.length > 0 && (<><Typography variant="h6" sx={{ marginTop: 3 }}>Sinh viên đã chọn:</Typography>
                        <List sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc", borderRadius: 1 }}>
                            {selectedStudents.map((student) => (
                                <ListItem key={student.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <ListItemText primary={`${student.username} - ${student.name}`} />
                                    <Button variant="outlined" color="error" size="small" onClick={() => handleDeselectStudent(student.id)}>
                                        Xóa
                                    </Button>
                                </ListItem>
                            ))}
                        </List></>)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button variant="contained" onClick={handleConfirmAddStudents}>Xác nhận</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
import { useState, useEffect, useMemo, useCallback } from "react";
import { TextField, Button, MenuItem, Typography, Grid, Paper, Box, Chip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getTeacher, makeClassroom, postStudentPrint } from "../api/admin";
import { useSnackbar } from "../context/snackbar_context/useSnackbar";
import { useNavigate } from "react-router-dom";

const availableTimes = ["08:00:00", "10:00:00", "13:00:00", "15:30:00", "17:30:00"];
const availableDays = [
    { label: "Thứ Hai", value: 2 },
    { label: "Thứ Ba", value: 3 },
    { label: "Thứ Tư", value: 4 },
    { label: "Thứ Năm", value: 5 },
    { label: "Thứ Sáu", value: 6 },
    { label: "Thứ Bảy", value: 7 },
    { label: "Chủ Nhật", value: 8 },
];

export default function ClassroomManager() {
    const navigate = useNavigate(); // Dùng để điều hướng
    const { showSnackbar } = useSnackbar();
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [className, setClassName] = useState("");
    const [sessions, setSessions] = useState([]);
    const [studentIds, setStudentIds] = useState(new Set());
    const [students, setStudents] = useState([]);
    const [teacherSearch, setTeacherSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        getTeacher().then(setTeachers);
    }, []);

    const filteredTeachers = useMemo(() =>
        teachers.filter((teacher) => teacher.name.toLowerCase().includes(teacherSearch.toLowerCase())),
        [teacherSearch, teachers]
    );

    const addSession = () => {
        setSessions([...sessions, { day_of_week: "", start_time: "", end_time: "" }]);
    };

    const updateSession = (index, key, value) => {
        setSessions(prev => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const response = await postStudentPrint(file);
        setStudents(response);
        setStudentIds(new Set(response.map(student => student.id)));
        event.target.value = "";
    };


    const removeStudent = useCallback((username) => {
        setStudents(prev => prev.filter(student => student.username !== username));
        setStudentIds(prev => new Set([...prev].filter(id => id !== username)));
    }, []);

    const removeAll = () => {
        setSelectedTeacher(null);
        setClassName("");
        setSessions([]);
        setStudents([]);
        setStudentIds(new Set());
        setTeacherSearch("")
    };

    const handleSubmit = async () => {
        if (!selectedTeacher || sessions.length === 0) return alert("Vui lòng nhập đủ thông tin");
        try {
            await makeClassroom(className, sessions, selectedTeacher, Array.from(studentIds).join(","));
            showSnackbar("Tạo lớp thành công!", "success")
            setTimeout(() => {
                navigate("/admin_class");
            }, 1000);
        } catch (error) {
            showSnackbar(`Tạo lớp thất bại! ${error}`, "error")
        }
    };

    return (
        <>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
                Tạo lớp học
            </Typography>
            <TextField label="Tên lớp học" fullWidth margin="normal" value={className} onChange={(e) => setClassName(e.target.value)} />

            <div style={{ position: "relative" }}>
                <TextField
                    label="Tìm giáo viên"
                    fullWidth
                    margin="normal"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && filteredTeachers.length > 0 && (
                    <Paper sx={{ position: "absolute", zIndex: 10, width: "100%" }}>
                        {filteredTeachers.map((teacher) => (
                            <MenuItem key={teacher.id} onClick={() => {
                                setSelectedTeacher(teacher.id);
                                setTeacherSearch(teacher.name);
                                setShowDropdown(false);
                            }}>
                                {teacher.name}
                            </MenuItem>
                        ))}
                    </Paper>
                )}
            </div>

            <Typography variant="h6" sx={{ marginBlock: 3 }}>Danh sách ca học</Typography>
            {sessions.map((session, index) => (
                <Grid container spacing={2} key={index} alignItems="center" sx={{ marginBottom: 2 }}>
                    <Grid item xs={4}>
                        <TextField
                            select
                            label="Thứ"
                            fullWidth
                            value={session.day_of_week}
                            onChange={(e) => updateSession(index, "day_of_week", e.target.value)}
                        >
                            {availableDays.map((day) => (
                                <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField select label="Giờ bắt đầu" fullWidth value={session.start_time} onChange={(e) => updateSession(index, "start_time", e.target.value)}>
                            {availableTimes.map((time) => (<MenuItem key={time} value={time}>{time}</MenuItem>))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField select label="Giờ kết thúc" fullWidth value={session.end_time} onChange={(e) => updateSession(index, "end_time", e.target.value)}>
                            {availableTimes.map((time) => (<MenuItem key={time} value={time}>{time}</MenuItem>))}
                        </TextField>
                    </Grid>
                </Grid>
            ))}

            <Box display="flex" flexWrap="wrap" gap={2} sx={{ marginTop: 2 }}>
                <Button variant="outlined" onClick={addSession}>Thêm ca học</Button>
                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                    Tải lên danh sách sinh viên
                    <input type="file" hidden accept=".xlsx" onChange={handleFileUpload} />
                </Button>
                <Button variant="outlined" color="secondary" sx={{ cursor: "default" }}>Danh sách sinh viên: {students.length}</Button>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1} sx={{ marginBlock: 2 }}>
                {students.map(student => (<Chip key={student.username} label={`${student.username} - ${student.name}`} onDelete={() => removeStudent(student.username)} />))}
            </Box>
            <Typography variant="h6" sx={{ marginBlock: 3 }}>Xác nhận thay đổi</Typography>
            <Box display="flex" flexWrap="wrap" gap={1} sx={{ marginBlock: 2 }}>
                <Button variant="contained" onClick={handleSubmit}>Xác nhận</Button>
                <Button variant="contained" onClick={removeAll} color="secondary">Đặt lại</Button>
            </Box>
        </>
    );
}
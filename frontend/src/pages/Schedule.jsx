import { useEffect, useState } from "react";
import { Typography, Table, TableBody, TableCell, Box, TableContainer, TableHead, TableRow, Paper, CircularProgress, useMediaQuery } from "@mui/material";
import { getClassroom } from "../api/timetable";

const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
const daysOfWeekShort = ["2", "3", "4", "5", "6", "7", "CN"];
const daysOfWeekMap = {
    "Monday": "Thứ Hai",
    "Tuesday": "Thứ Ba",
    "Wednesday": "Thứ Tư",
    "Thursday": "Thứ Năm",
    "Friday": "Thứ Sáu",
    "Saturday": "Thứ Bảy",
    "Sunday": "Chủ Nhật"
};

const colors = ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(255, 159, 64, 0.2)"];

export default function Schedule() {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const classroomColors = {};
    const isSmallScreen = useMediaQuery("(max-width: 600px)");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getClassroom();
                setClassrooms(response.data.classrooms);
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <CircularProgress />;

    // Gán màu sắc cho từng lớp
    let colorIndex = 0;
    classrooms.forEach(classroom => {
        if (!classroomColors[classroom.name]) {
            classroomColors[classroom.name] = colors[colorIndex % colors.length];
            colorIndex++;
        }
    });

    // Gom các ca học theo thứ trong tuần
    const sessionsByDay = {};
    daysOfWeek.forEach(day => { sessionsByDay[day] = []; });
    classrooms.forEach(classroom => {
        classroom.class_sessions.forEach(session => {
            const vietnameseDay = daysOfWeekMap[session.day_of_week];
            sessionsByDay[vietnameseDay].push({
                id: session.id,
                classroom: classroom.name,
                teacher: classroom.teacher,
                start_time: session.start_time,
                end_time: session.end_time,
                backgroundColor: classroomColors[classroom.name]
            });
        });
    });

    // Sắp xếp các ca học trong mỗi ngày theo thời gian bắt đầu
    Object.keys(sessionsByDay).forEach(day => {
        sessionsByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return (
        <Box>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 }}}>
                Thời khóa biểu
            </Typography>
            <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {(isSmallScreen ? daysOfWeekShort : daysOfWeek).map((day) => (
                                <TableCell key={day} align="center" sx={{ width: isSmallScreen ? "10px" : "auto", fontSize: isSmallScreen ? "0.75rem" : "1rem" }}>
                                    <strong>{day}</strong>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Xác định số lượng hàng tối đa */}
                        {Array.from({ length: Math.max(...Object.values(sessionsByDay).map(sessions => sessions.length), 1) }).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {daysOfWeek.map(day => (
                                    <TableCell 
                                        key={day} 
                                        align="center" 
                                        sx={{ 
                                            backgroundColor: sessionsByDay[day][rowIndex]?.backgroundColor || "transparent",
                                            fontSize: isSmallScreen ? "0.7rem" : "1rem",
                                            padding: isSmallScreen ? "4px" : "8px"
                                        }}
                                    >
                                        {sessionsByDay[day][rowIndex] ? (
                                            <>
                                                <div><strong>{sessionsByDay[day][rowIndex].classroom}</strong></div>
                                                <div>{sessionsByDay[day][rowIndex].teacher}</div>
                                                <div>{sessionsByDay[day][rowIndex].start_time} - {sessionsByDay[day][rowIndex].end_time}</div>
                                            </>
                                        ) : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

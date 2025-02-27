import { useEffect, useState } from "react";
import { Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Breadcrumbs, Link, useMediaQuery, TextField } from "@mui/material";
import { getClassroomScore, getTeacherClassrooms, getClassroomCheckin } from "../api/classroom";
import EditIcon from '@mui/icons-material/Edit';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { updateScores } from "../api/score";
import { getStudentPrint } from "../api/admin";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

const daysOfWeekMap = {
  "Monday": "Thứ Hai",
  "Tuesday": "Thứ Ba",
  "Wednesday": "Thứ Tư",
  "Thursday": "Thứ Năm",
  "Friday": "Thứ Sáu",
  "Saturday": "Thứ Bảy",
  "Sunday": "Chủ Nhật"
};

export default function Classroom() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [scores, setScores] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState(["Lớp học"]);
  const [editingScores, setEditingScores] = useState(false);
  const [loadingClass, setLoadingClass] = useState(null);
  const isDesktopScreen = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getTeacherClassrooms();
        setClassrooms(response.data.classrooms);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
      }
    }
    fetchData();
  }, []);

  const handleShowSessions = (classroom) => {
    setSelectedClass(classroom);
    setSessions(classroom.class_sessions || []);
    setScores([]);
    setBreadcrumbs(["Lớp học", classroom.name, "Ca học"]);
  };

  const handleShowScores = async (classroom) => {
    try {
      const response = await getClassroomScore(classroom.id);
      setScores(response.data.scores);
      setSelectedClass(classroom);
      setSessions([]);
      setBreadcrumbs(["Lớp học", classroom.name, "Bảng điểm"]);
    } catch (error) {
      console.log("Lỗi khi tìm bảng điểm của lớp học", error);
    }
  };

  const handleShowCheckin = async (classroom) => {
    try {
      setLoadingClass(classroom.id); // Đánh dấu lớp đang tải
      const response = await getClassroomCheckin(classroom.id);
      const url = response.data.url;
      window.location.href = url;
    } catch (error) {
      console.log("Lỗi khi tìm điểm danh của lớp học", error);
    } finally {
      setLoadingClass(null); // Reset loading khi hoàn tất
    }
  };

  const handleBackToClassrooms = () => {
    setSelectedClass(null);
    setSessions([]);
    setScores([]);
    setBreadcrumbs(["Lớp học"]);
  };

  const handleToggleEditingScores = () => {
    setEditingScores(!editingScores);
  };

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

  const handleSaveScores = async () => {
    // Chuẩn bị dữ liệu cập nhật
    const updatedScores = scores.map((score) => ({
      student_id: score.student_id,
      score: parseFloat(score.score)
    }));

    const studentIds = updatedScores.map((score) => score.student_id);
    const scoresList = updatedScores.map((score) => score.score);

    try {
      const isUpdated = await updateScores(selectedClass.id, studentIds, scoresList);
      if (isUpdated) {
        // Sau khi cập nhật thành công, tắt chế độ chỉnh sửa
        setEditingScores(false);
      } else {
        // Nếu API không trả về true, bạn có thể hiển thị thông báo lỗi hoặc tắt chỉnh sửa
        setEditingScores(false);
        // Thông báo lỗi tùy ý
      }
      // Cập nhật lại bảng điểm
      const response = await getClassroomScore(selectedClass.id);
      setScores(response.data.scores);
    } catch (error) {
      console.error("Cập nhật điểm thất bại", error);
      // Tùy chọn: bạn có thể tắt chế độ chỉnh sửa ngay cả khi có lỗi, hoặc giữ nguyên để cho phép chỉnh sửa lại
      setEditingScores(false);
    }
  };


  const handleStopEditingScores = () => {
    setEditingScores(false);
  };

  const handleScoreChange = (index, value) => {
    const updatedScores = [...scores];
    updatedScores[index].score = value;
    setScores(updatedScores);
  };

  return (
    <Box>
      <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
        Quản lý lớp
      </Typography>

      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 2 }}>
        {breadcrumbs.map((crumb, index) => (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            onClick={handleBackToClassrooms}
            sx={{ cursor: "pointer" }}
          >
            {crumb}
          </Link>
        ))}
      </Breadcrumbs>

      <Box display="flex" alignItems="center" gap={2}>
        {selectedClass && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackToClassrooms}
            sx={{ marginBottom: 2 }}
          >
            Quay lại
          </Button>
        )}

        {selectedClass && scores.length > 0 && !editingScores && (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleToggleEditingScores}
              startIcon={<EditIcon />}
              sx={{ marginBottom: 2 }}
            >
              Nhập điểm
            </Button>

          </>

        )}

        {selectedClass && (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={handlePrint}
              startIcon={<LocalPrintshopIcon />}
              sx={{ marginBottom: 2 }}
            >
              In danh sách sinh viên
            </Button>

          </>

        )}


        {selectedClass && scores.length > 0 && editingScores && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleStopEditingScores}
            startIcon={<DoDisturbIcon />}
            sx={{ marginBottom: 2 }}

          >
            Dừng nhập
          </Button>
        )}
      </Box>

      {/* Hiển thị bảng lớp học */}
      {!selectedClass && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên lớp</TableCell>
                {isDesktopScreen ? <TableCell>Ngày bắt đầu</TableCell> : null}
                {isDesktopScreen ? <TableCell>Ngày kết thúc</TableCell> : null}
                <TableCell>Ca học</TableCell>
                <TableCell>Bảng điểm & Sinh viên</TableCell>
                <TableCell>Thống kê điểm danh</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classrooms.map((classroom) => (
                <TableRow key={classroom.id}>
                  <TableCell>{classroom.id}</TableCell>
                  <TableCell>{classroom.name}</TableCell>
                  {isDesktopScreen ? <TableCell>{classroom.start_date}</TableCell> : null}
                  {isDesktopScreen ? <TableCell>{classroom.weeks}</TableCell> : null}
                  <TableCell>
                    <Button variant="contained" onClick={() => handleShowSessions(classroom)}>
                      {isDesktopScreen ? 'Xem ca học' : 'Xem'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="secondary" onClick={() => handleShowScores(classroom)}>
                      {isDesktopScreen ? 'Xem danh sách' : 'Xem'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => handleShowCheckin(classroom)}
                      disabled={loadingClass === classroom.id} // Chỉ disable nút của lớp đang tải
                    >
                      {loadingClass === classroom.id ? "Đang tải..." : isDesktopScreen ? "Xem thống kê" : "Xem"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Hiển thị bảng ca học */}
      {selectedClass && sessions.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", padding: 2 }}>
            Danh sách ca học - {selectedClass.name}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Thứ trong tuần</TableCell>
                <TableCell>Giờ bắt đầu</TableCell>
                <TableCell>Giờ kết thúc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{daysOfWeekMap[session.day_of_week]}</TableCell>
                  <TableCell>{session.start_time}</TableCell>
                  <TableCell>{session.end_time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Hiển thị bảng điểm */}
      {selectedClass && scores.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", padding: 2 }}>
            Bảng điểm - {selectedClass.name}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Điểm</TableCell>
                {editingScores && <TableCell>Nhập điểm</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((score, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{score.student}</TableCell>
                  <TableCell>{score.score < 0 ? "Chưa nhập điểm" : score.score}</TableCell>
                  {editingScores && (
                    <TableCell>
                      <TextField
                        type="number"
                        value={score.score}
                        onChange={(e) => handleScoreChange(index, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: 10,
                          step: "0.1"
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {editingScores && (
            <Button variant="contained" color="primary" onClick={handleSaveScores} sx={{ marginTop: 2 }}>
              Lưu thay đổi
            </Button>
          )}
        </TableContainer>
      )}
    </Box>
  );
}

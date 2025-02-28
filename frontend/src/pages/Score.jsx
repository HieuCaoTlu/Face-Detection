import { useState, useEffect } from "react";
import { Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, TextField, MenuItem } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getScores } from "../api/score";
import { useTheme } from "@mui/material/styles";


export default function Score() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterClassroom, setFilterClassroom] = useState("");
  const theme = useTheme();

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const data = await getScores();
      setScores(data);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu điểm số.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchScores();
  };

  const uniqueClassrooms = [...new Set(scores.map((s) => s.classroom))];
  const filteredScores = filterClassroom ? scores.filter((s) => s.classroom === filterClassroom) : scores;

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <>
      <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold", marginTop: { xs: 3, md: 5 } }}>
        Bảng điểm
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            name="classroom_filter"
            select
            fullWidth
            value={filterClassroom}
            onChange={(e) => setFilterClassroom(e.target.value)}
            sx={{
              borderRadius: 2,
              backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff",
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {uniqueClassrooms.map((classroom) => (
              <MenuItem key={classroom} value={classroom}>{classroom}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleReload}>
            Làm mới
          </Button>
        </Grid>
      </Grid>

      <TableContainer sx={{ marginTop: 3,  borderRadius: 2, backgroundColor: theme.palette.mode === "dark" ? "#333" : "#fff", }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>STT</strong></TableCell>
              <TableCell><strong>Lớp học</strong></TableCell>
              <TableCell><strong>Điểm</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScores.map((score, index) => (
              <TableRow key={score.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{score.classroom}</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: score.score >= 0 ? "green" : "red" }}>
                  {score.score >= 0 ? score.score : "Chưa có điểm"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
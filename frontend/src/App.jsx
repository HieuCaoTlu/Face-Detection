import { useState, useMemo, createContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import CameraComponent from "./Camera";
import { AuthProvider } from "./context/auth_context/AuthProvider";
import Login from "./pages/Login";
import Layout from "./layouts/Layout";
import Profile from "./pages/Profile";
import "./index.css";
import Home from "./pages/Home";
import { SnackbarProvider } from "./context/snackbar_context/SnackbarProvider";
import Score from "./pages/Score"
import TrainCamera from "./components/TrainCamera"
import Schedule from "./pages/Schedule";
import Classroom from "./pages/Classroom";
import Admin from "./pages/Admin";
import AdminClass from "./pages/AdminClass";
import ClassroomManager from "./pages/MakeClassroom";
import AdminStudent from "./pages/AdminStudent";
import AdminTeacher from "./pages/AdminTeacher";
import Checkin from "./pages/Checkin";

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

export default function App() {
  const [mode, setMode] = useState(localStorage.getItem("theme") || "light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("theme", newMode);
      },
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: ({ ownerState }) => ({
                borderRadius: '12px',
                boxShadow: ownerState.color === 'secondary'
                  ? '0px 4px 10px rgba(123, 31, 162, 0.3)'  // Bóng tím nhạt khi secondary
                  : '0px 4px 10px rgba(0, 123, 255, 0.3)',  // Bóng xanh mặc định (primary)
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: ownerState.color === 'secondary'
                    ? '0px 6px 15px rgba(123, 31, 162, 0.5)'  // Bóng tím đậm hơn khi hover (secondary)
                    : '0px 6px 15px rgba(0, 123, 255, 0.5)',  // Bóng xanh mạnh hơn khi hover (primary)
                },
              }),
            }
          },
          MuiTextField: {
            styleOverrides: {
              root: ({ theme }) => ({
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? '#000'
                    : '#fff',
                  '& fieldset': {
                    border: 'none',
                  },
                }
              }),
            }
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                borderRadius: '12px', // Làm bo góc bảng
                boxShadow: 'none', // Xóa shadow
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '12px', // Nếu bảng nằm trong Paper, bo góc luôn
                boxShadow: 'none', // Xóa shadow mặc định của Paper
              },
            },
          },

        }
      }),
    [mode]
  );

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SnackbarProvider>
        <AuthProvider>
          <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/' element={<Layout><Home /></Layout>} />
                <Route path='/profile' element={<Layout><Profile /></Layout>} />
                <Route path='/score' element={<Layout> <Score /> </Layout>} />
                <Route path='/train' element={<Layout> <TrainCamera /> </Layout>} />
                <Route path='/timetable' element={<Layout> <Schedule /> </Layout>} />
                <Route path='/checkin' element={<Layout> <Checkin /> </Layout>} />
                <Route path='/classroom' element={<Layout> <Classroom /> </Layout>} />
                <Route path='/head' element={<Layout> <Admin /> </Layout>} />
                <Route path='/admin_class' element={<Layout> <AdminClass /> </Layout>} />
                <Route path='/admin_make' element={<Layout> <ClassroomManager /> </Layout>} />
                <Route path='/admin_student' element={<Layout> <AdminStudent /> </Layout>} />
                <Route path='/admin_teacher' element={<Layout> <AdminTeacher /> </Layout>} />
              </Routes>
            </ThemeProvider>
          </ColorModeContext.Provider>
        </AuthProvider>
      </SnackbarProvider>
    </Router>
  );
}
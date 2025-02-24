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
                <Route path='/classroom' element={<Layout> <Classroom /> </Layout>} />
              </Routes>
            </ThemeProvider>
          </ColorModeContext.Provider>
        </AuthProvider>
      </SnackbarProvider>
    </Router>
  );
}
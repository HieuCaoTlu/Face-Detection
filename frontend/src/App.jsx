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
import TrainCamera from "./components/TrainCamera";

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
    <AuthProvider>
      <SnackbarProvider>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/' element={<Layout><Home /></Layout>} />
                <Route path='/profile' element={<Layout><Profile /></Layout>} />
                <Route path='/test' element={<Layout><TrainCamera/> </Layout>} />
              </Routes>
            </Router>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </SnackbarProvider>
    </AuthProvider>
  );
}
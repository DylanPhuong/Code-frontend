// src/App.js
import { useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ToastContainer, Bounce } from "./js/ImportComponents/Imports";

import ColorModeContext from "./js/Theme/ColorModeContext";
import PrivateRoute from "./js/Components/PrivateRoute";
import DashboardLayout from "./js/Layout/DashboardLayout";
import Login from "./js/Auth/Login";
import NotFound from "./js/Components/NotFound";

function App() {
  // ===== Theme mode (light/dark) =====
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("mui-mode");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("mui-mode", next);
          return next;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        components: {
          MuiPaper: {
            styleOverrides: { root: { transition: "background-color .2s ease" } },
          },
        },
      }),
    [mode]
  );

  // ===== Auth guard for /login =====
  const isAuthed = localStorage.getItem("isAuthenticated") === "true";

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Nếu đã đăng nhập thì chặn vào /login */}
              <Route
                path="/login"
                element={isAuthed ? <Navigate to="/home" replace /> : <Login />}
              />

              {/* Các route cần đăng nhập */}
              <Route element={<PrivateRoute />}>
                {/* Root -> /home */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<DashboardLayout />} />
                <Route path="/device" element={<DashboardLayout />} />
                <Route path="/tagname" element={<DashboardLayout />} />
                <Route path="/funcSettings" element={<DashboardLayout />} />
                <Route path="/historical" element={<DashboardLayout />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Fallback cho các route khác */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>

      {/* Toasts */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  );
}

export default App;

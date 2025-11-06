// src/App.js
import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Bounce } from './js/ImportComponents/Imports';
import { socket } from './js/Ultils/Socket/Socket';
import DashboardLayout from './js/Layout/DashboardLayout';
import Login from './js/Auth/Login';
import NotFound from './js/Components/NotFound';
import PrivateRoute from './js/Components/PrivateRoute';

// Theme
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ColorModeContext from './js/Theme/ColorModeContext';

function App() {
  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
  }, []);


  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('mui-mode');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(prev => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem('mui-mode', next);
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
          MuiPaper: { styleOverrides: { root: { transition: 'background-color .2s ease' } } },
        },
      }),
    [mode]
  );

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                {/* / -> /home */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<DashboardLayout />} />
                <Route path="/device" element={<DashboardLayout />} />
                <Route path="/tagname" element={<DashboardLayout />} />
                <Route path="/funcSettings" element={<DashboardLayout />} />
                <Route path="/historical" element={<DashboardLayout />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>

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

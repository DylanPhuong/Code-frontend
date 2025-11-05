// src/App.js
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Bounce } from './js/ImportComponents/Imports';
import { socket } from './js/Ultils/Socket/Socket';
import DashboardLayout from './js/Layout/DashboardLayout';
import Login from './js/Auth/Login';
import NotFound from './js/Components/NotFound';
import PrivateRoute from './js/Components/PrivateRoute';

function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect()
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Route công khai - Login */}
          <Route path="/login" element={<Login />} />

          {/* Routes được bảo vệ - Cần đăng nhập */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          />

          {/* Route 404 - Phải đặt cuối cùng */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

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
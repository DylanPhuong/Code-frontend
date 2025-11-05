// src/js/Components/PrivateRoute.js
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Kiểm tra authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    // Nếu chưa đăng nhập, redirect về trang login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, hiển thị component
    return children;
};

export default PrivateRoute;
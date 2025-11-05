

// src/js/routes/AppRoutes.js
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../Layout/DashboardLayout";

const AppRoutes = (props) => {
    return (
        <Routes>
            {/* Tất cả routes đều dùng DashboardLayout, không thay đổi URL */}
            <Route path="/*" element={<DashboardLayout />} />

            {/* Route riêng cho login nếu cần */}
            {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
    )
}

export default AppRoutes;
// import { Routes, Route } from "react-router-dom";
// import FunctionSettings from "../FunctionSetting/FunctionSettings";
// import DeviceTab from "../Device/DeviceTab";
// import TagName from "../TagName/TagName";
// import HomeLayout from "../HomeLayout/HomeLayout";
// import InputPopover from "../Ultils/Popover/Popover";
// import HistoricalTab from "../Historical/HistoricalTab";

// const AppRoutes = (props) => {
//     return (
//         <Routes>
//             <Route path="/login" element={<div>Login</div>} />

//             <Route path="/historical" element={<HistoricalTab />} />

//             <Route path="/device" element={<DeviceTab />} />

//             <Route path="/tagname" element={<TagName />} />

//             <Route path="/funcSettings" element={<FunctionSettings />} />

//             <Route path="/" element={<InputPopover />} />
//             {/* Hoặc: <Route path="/" element={<HomeLayout />} /> */}

//             <Route path="*" element={<div>404 Not Found!!</div>} />
//         </Routes>
//     )
// }

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
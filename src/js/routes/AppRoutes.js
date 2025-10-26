import { Routes, Route } from "react-router-dom";
import FunctionSettings from "../FunctionSetting/FunctionSettings";
import DeviceTab from "../Config/DeviceTab";
import SetupTab from "../Setup/SetupTab";
import HomeLayout from "../HomeLayout/HomeLayout";
import InputPopover from "../Ultils/Popover/Popover";
import HistoricalTab from "../Historical/HistoricalTab";

const AppRoutes = (props) => {
    return (
        <Routes>
            <Route path="/login" element={<div>Login</div>} />

            <Route path="/historical" element={<HistoricalTab />} />

            <Route path="/config" element={<DeviceTab />} />

            <Route path="/setup" element={<SetupTab />} />

            <Route path="/funcSettings" element={<FunctionSettings />} />

            <Route path="/" element={<InputPopover />} />
            {/* Hoặc: <Route path="/" element={<HomeLayout />} /> */}

            <Route path="*" element={<div>404 Not Found!!</div>} />
        </Routes>
    )
}

export default AppRoutes;
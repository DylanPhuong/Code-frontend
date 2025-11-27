import {
    useState,
    Tabs,
    Tab,
    Box,
    Paper,
} from "../ImportComponents/Imports";

import ListDevices from "./Components/ListDevices/ListDevice";
import ListCom from "./Components/ListCom/ListCom";

// Panel chung cho từng tab
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`device-tabpanel-${index}`}
            aria-labelledby={`device-tab-${index}`}
            {...other}
            style={{ width: "100%" }}
        >
            {value === index && (
                <Box
                    sx={{
                        px: 0,   // bỏ padding trái/phải
                        py: 2,   // giữ chút padding trên/dưới
                    }}
                >
                    {children}
                </Box>
            )}
        </div>
    );
};

const DeviceTab = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (_event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box
            // thay cho <div className="container">
            sx={{
                p: 0,                         // ✅ không padding → table sát sidebar
                m: 0,
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            }}
        >
            {/* Thanh tabs phía trên */}
            <Paper
                sx={{
                    px: 0,                      // không padding ngang
                    py: 0,
                    borderRadius: 2,
                    filter: "drop-shadow(0 0 8px rgba(0,0,0,0.25))",
                    mt: 2,
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="fullWidth"
                    sx={{ width: "100%" }}
                >
                    <Tab
                        sx={{
                            textTransform: "none",
                            fontWeight: "bold",
                            fontSize: 15,
                            whiteSpace: "nowrap",
                        }}
                        label="Cấu hình Device"
                        id="device-tab-0"
                        aria-controls="device-tabpanel-0"
                    />
                    <Tab
                        sx={{
                            textTransform: "none",
                            fontWeight: "bold",
                            fontSize: 15,
                            whiteSpace: "nowrap",
                        }}
                        label="Cấu hình COM"
                        id="device-tab-1"
                        aria-controls="device-tabpanel-1"
                    />
                </Tabs>
            </Paper>

            {/* Nội dung từng tab */}
            <TabPanel value={tabValue} index={0}>
                <ListDevices />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ListCom />
            </TabPanel>
        </Box>
    );
};

export default DeviceTab;

import {
    useState,
    Tabs,
    Paper,
    Tab,
    Box,
} from "../ImportComponents/Imports";

import ListChannels from "./Components/Monitoring/ListChannels";
import ListHistorical from "./Components/Histotical/ListHistorical";
import ListAlarm from "./Components/Alarm/ListAlarm";

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ width: "100%" }}
        >
            {value === index && (
                <Box
                    sx={{
                        px: 0,           // bỏ padding trái/phải
                        py: 2,           // giữ chút padding trên/dưới cho thoáng
                    }}
                >
                    {children}
                </Box>
            )}
        </div>
    );
};

const SetupTab = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box
            // thay cho <div className="container">
            sx={{
                p: 0,                          //  không padding → sát sidebar
                m: 0,
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            }}
        >
            {/* Thanh tabs */}
            <Paper
                sx={{
                    px: 0,                       // không padding ngang
                    py: 2,
                    borderRadius: 2,
                    filter: "drop-shadow(0 0 8px rgba(0,0,0,0.25))",
                    mt: 2,
                }}
            >
                <Box sx={{ height: 20, display: "flex", alignItems: "center" }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleChange}
                        variant="fullWidth"
                        sx={{ width: "100%" }}
                    >
                        <Tab sx={{ textTransform: "none", fontWeight: "bold", fontSize: 15, whiteSpace: "nowrap", }} label="Cấu hình Tagname" />
                        <Tab sx={{ textTransform: "none", fontWeight: "bold", fontSize: 15, whiteSpace: "nowrap", }} label="Cấu hình Historical" />
                        <Tab sx={{ textTransform: "none", fontWeight: "bold", fontSize: 15, whiteSpace: "nowrap", }} label="Cấu hình Alarm" />
                    </Tabs>
                </Box>
            </Paper>

            {/* Nội dung từng tab */}
            <TabPanel value={tabValue} index={0}>
                <ListChannels />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ListHistorical />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <ListAlarm />
            </TabPanel>
        </Box>
    );
};

export default SetupTab;

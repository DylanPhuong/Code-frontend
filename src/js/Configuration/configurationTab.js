import {
    useState,
    Tabs,
    Paper,
    Tab,
    Box,
} from "../ImportComponents/Imports";
import ListFTP from "./FTP/FTP";
import ListMySQL from "./MySQL/MySQL";
import ListSQL from "./SQL/SQL";

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    const active = value === index;

    return (
        <Box
            role="tabpanel"
            hidden={!active}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            sx={{
                width: "100%",
                height: "100%",
                display: active ? "block" : "none",
                boxSizing: "border-box",
                p: 2,
            }}
        >
            {active && children}
        </Box>
    );
};

const SendTab = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            }}
        >
            <Paper
                sx={{
                    p: 2,
                    borderRadius: 2,
                    filter: "drop-shadow(0 0 8px rgba(0,0,0,0.25))",
                    mb: 1.5,
                }}
            >
                <Box
                    sx={{
                        height: 20,
                        display: "flex",
                        alignItems: "center",
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
                            label="Cấu hình FTP"
                        />
                        <Tab
                            sx={{
                                textTransform: "none",
                                fontWeight: "bold",
                                fontSize: 15,
                                whiteSpace: "nowrap",
                            }}
                            label="Cấu hình MySQL"
                        />
                        <Tab
                            sx={{
                                textTransform: "none",
                                fontWeight: "bold",
                                fontSize: 15,
                                whiteSpace: "nowrap",
                            }}
                            label="Cấu hình SQL"
                        />
                    </Tabs>
                </Box>
            </Paper>

            <Box sx={{ flex: 1, minHeight: 0 }}>
                <TabPanel value={tabValue} index={0}>
                    <ListFTP />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <ListMySQL />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <ListSQL />
                </TabPanel>
            </Box>
        </Box>
    );
};

export default SendTab;

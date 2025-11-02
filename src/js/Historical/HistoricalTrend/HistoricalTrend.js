import {
    useState, useEffect, Paper, dayjs, TextField, MenuItem,
    Box, Button, Stack, FindInPageIcon, Chart, Card, CardContent, Typography
} from '../../ImportComponents/Imports';
import { fetchAllHistoricalValue, fetchAllHistorical, findHistoricalTime } from '../../../Services/APIDevice';
import Loading from '../../Ultils/Loading/Loading';
import CustomDateTimePicker from '../../Ultils/DateTimePicker/DateTimePicker';
import useValidator from '../../Valiedate/Validation';

const HistoricalTrend = (props) => {
    const [loading, setLoading] = useState(true);
    const [listHistoricalValue, setListHistoricalValue] = useState([]);
    const [listTagHistorical, setListTagHistorical] = useState([]);
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [selectedTag, setSelectedTag] = useState("");
    const [startDate, setStartDate] = useState(dayjs().startOf("day"));
    const [endDate, setEndDate] = useState(dayjs().endOf("day"));

    useEffect(() => {
        fetchTagHistorical();
    }, []);

    const validateAll = () => {
        const newErrors = {};
        newErrors.selectedTag = validate("name", selectedTag);
        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const fetchTagHistorical = async () => {
        let response = await fetchAllHistorical();
        if (response && response.EC === 0 && response.DT?.DT) {
            const listTagHistorical = response.DT.DT.map((item) => ({
                id: item.id,
                name: item.name,
            }));
            setListTagHistorical(listTagHistorical);
        }
    };

    const handleFindHistorical = async () => {
        if (!validateAll()) return;
        try {
            const startTime = startDate.format("YYYY-MM-DD HH:mm:ss");
            const endTime = endDate.format("YYYY-MM-DD HH:mm:ss");
            const selectedTagObj = listTagHistorical.find(tag => tag.id === selectedTag);
            const tagNameId = selectedTagObj ? selectedTagObj.id : "";
            const tagName = selectedTagObj ? selectedTagObj.name : "";

            const response = await findHistoricalTime({ startTime, endTime, tagNameId });
            console.log('Check data search response for Trend: ', response);

            if (response && response.EC === 0 && Array.isArray(response.DT)) {
                const dataFinds = response.DT.map(item => ({
                    time: item.ts,
                    value: item.value.value,  // lấy giá trị đo
                    tagname: item.value.tagname || tagName,
                    unit: item.value.unit
                }));
                setListHistoricalValue(dataFinds);
                console.log('Check data search for Trend:', dataFinds);
            } else {
                setListHistoricalValue([]);
            }
        } catch (error) {
            console.error("Error fetching historical:", error);
        }
    };

    const chartData = {
        series: [
            {
                name:
                    listHistoricalValue.length > 0
                        ? listHistoricalValue[0]?.tagname || "Giá trị"
                        : "Giá trị",
                data: listHistoricalValue.map(item => ({
                    x: new Date(item.time).getTime(),
                    y: Number(item.value)
                })),
            },
        ],
        options: {
            chart: {
                type: "line",
                height: 400,
                zoom: { enabled: true },
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                background: '#fff',
            },
            dataLabels: { enabled: false },
            stroke: { curve: "smooth", width: 2 },
            grid: {
                borderColor: "#e0e0e0",
                row: { colors: ["#f9f9f9", "transparent"], opacity: 0.5 },
            },
            markers: { size: 0, hover: { sizeOffset: 5 } },
            xaxis: {
                type: "datetime",
                labels: {
                    rotate: 0,
                    style: { fontSize: "12px" },
                    datetimeFormatter: { hour: "HH:mm", day: "dd/MM" },
                },
                title: {
                    text: "Thời gian",
                    style: { fontSize: "13px", fontWeight: 500 },
                },
            },
            yaxis: {
                labels: {
                    formatter: (val) => `${val.toFixed(2)} ${listHistoricalValue[0]?.unit || ""}`,
                    style: { fontSize: "13px" },
                },
                title: {
                    text: listHistoricalValue[0]?.unit
                        ? `Giá trị (${listHistoricalValue[0]?.unit})`
                        : "Giá trị đo",
                    style: { fontSize: "13px", fontWeight: 500 },
                },
            },
            tooltip: {
                theme: "light",
                x: { show: true, format: "dd/MM HH:mm" },
                y: { formatter: (val) => `${val.toFixed(2)} ${listHistoricalValue[0]?.unit || ""}` },
            },
            legend: {
                position: "bottom",
                horizontalAlign: "center",
                markers: { radius: 12 },
            },
            colors: ["#2979ff"],
            title: {
                text: `Biểu đồ: ${listHistoricalValue[0]?.tagname || "—"}`,
                align: "center",
                style: { fontSize: "16px", fontWeight: "bold", color: "#263238" },
            },
            subtitle: {
                text: `(${startDate.format("DD/MM/YYYY")} - ${endDate.format("DD/MM/YYYY")})`,
                align: "center",
                style: { fontSize: "13px", color: "#757575" },
            },
        },
    };

    return (
        <>
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))',
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                    <Box sx={{ width: '45%' }}>
                        <CustomDateTimePicker
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </Box>

                    <TextField
                        select
                        fullWidth
                        label="Name"
                        variant="standard"
                        sx={{ width: '35%', mr: 5 }}
                        value={selectedTag}
                        onChange={(e) => {
                            setSelectedTag(e.target.value);
                            if (errors.selectedTag) {
                                setErrors((prev) => ({ ...prev, selectedTag: "" }));
                            }
                        }}
                        error={!!errors.selectedTag}
                        helperText={errors.selectedTag}
                    >
                        {listTagHistorical.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FindInPageIcon />}
                        onClick={handleFindHistorical}
                        sx={{
                            textTransform: 'none',
                            height: 'fit-content',
                            minWidth: '120px',
                            ml: 33,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </Stack>
            </Paper>

            <Card sx={{ maxWidth: 800, margin: "30px auto", boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                        Biểu đồ giá trị Tag: {listHistoricalValue[0]?.tagname || "—"}
                    </Typography>
                    {listHistoricalValue.length > 0 ? (
                        <Chart
                            options={chartData.options}
                            series={chartData.series}
                            type="line"
                            height={350}
                        />
                    ) : (
                        <Typography align="center" color="text.secondary">
                            Chưa có dữ liệu hiển thị
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default HistoricalTrend;

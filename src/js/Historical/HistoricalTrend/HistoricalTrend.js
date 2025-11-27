import {
    useState,
    useEffect,
    Paper,
    dayjs,
    TextField,
    MenuItem,
    CustomDateTimePicker,
    useValidator,
    Box,
    Button,
    Stack,
    FindInPageIcon,
    Chart,
    Card,
    CardContent,
    Typography,
} from "../../ImportComponents/Imports";

import {
    fetchAllHistorical,
    findHistoricalTime,
} from "../../../Services/APIDevice";

const HistoricalTrend = () => {
    const [loading, setLoading] = useState(false);
    const [listHistoricalValue, setListHistoricalValue] = useState([]);
    const [listTagHistorical, setListTagHistorical] = useState([]);
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();

    const [selectedTag, setSelectedTag] = useState("");
    const [startDate, setStartDate] = useState(dayjs().startOf("day"));
    const [endDate, setEndDate] = useState(dayjs().endOf("day"));

    // Lấy danh sách tag historical
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
        const response = await fetchAllHistorical();
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

        setLoading(true);
        try {
            const startTime = startDate.format("YYYY-MM-DD HH:mm:ss");
            const endTime = endDate.format("YYYY-MM-DD HH:mm:ss");

            const selectedTagObj = listTagHistorical.find(
                (tag) => tag.id === selectedTag
            );
            const tagNameId = selectedTagObj ? selectedTagObj.id : "";
            const tagName = selectedTagObj ? selectedTagObj.name : "";

            const response = await findHistoricalTime({
                startTime,
                endTime,
                tagNameId,
            });

            if (response && response.EC === 0 && Array.isArray(response.DT)) {
                const dataFinds = response.DT.map((item) => ({
                    time: item.ts,
                    value: item.value.value,
                    tagname: item.value.tagname || tagName,
                    unit: item.value.unit,
                }));
                setListHistoricalValue(dataFinds);
            } else {
                setListHistoricalValue([]);
            }
        } catch (error) {
            setListHistoricalValue([]);
        } finally {
            setLoading(false);
        }
    };

    // Data & option cho ApexCharts
    const chartData = {
        series: [
            {
                name:
                    listHistoricalValue.length > 0
                        ? listHistoricalValue[0]?.tagname || "Giá trị"
                        : "Giá trị",
                data: listHistoricalValue.map((item) => ({
                    x: dayjs(item.time).add(7, "hour").valueOf(),
                    y: Number(item.value),
                })),
            },
        ],
        options: {
            chart: {
                type: "line",
                height: 320,
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
                        reset: true,
                    },
                },
                background: "#fff",
                parentHeightOffset: 0,
            },
            dataLabels: { enabled: false },
            stroke: { curve: "smooth", width: 2 },
            grid: {
                borderColor: "#e0e0e0",
                row: { colors: ["#f9f9f9", "transparent"], opacity: 0.5 },
                padding: {
                    bottom: 20,
                    top: 0,
                    left: 10,
                    right: 10,
                },
            },
            markers: { size: 0, hover: { sizeOffset: 5 } },
            xaxis: {
                type: "datetime",
                labels: {
                    rotate: 0,
                    style: { fontSize: "12px" },
                    datetimeFormatter: {
                        hour: "HH:mm",
                        day: "dd/MM",
                    },
                },
                title: {
                    text: "Thời gian",
                    offsetY: 15,
                    style: { fontSize: "13px", fontWeight: 700 },
                },
            },
            yaxis: {
                labels: {
                    formatter: (val) =>
                        `${val.toFixed(2)} ${listHistoricalValue[0]?.unit || ""}`,
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
                y: {
                    formatter: (val) =>
                        `${val.toFixed(2)} ${listHistoricalValue[0]?.unit || ""}`,
                },
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
                style: {
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#263238",
                },
            },
            subtitle: {
                text: `(${startDate.format(
                    "DD/MM/YYYY HH:mm:ss"
                )} - ${endDate.format("DD/MM/YYYY HH:mm:ss")})`,
                align: "center",
                style: {
                    fontSize: "13px",
                    color: "#757575",
                    fontFamily: "Roboto, sans-serif",
                },
            },
        },
    };

    return (
        <Box
            sx={{
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Bộ lọc phía trên */}
            <Paper
                sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    filter: "drop-shadow(0 0 8px rgba(0,0,0,0.25))",
                    flexShrink: 0,
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                        height: "100%",
                        // xs có thể wrap, md trở lên thì luôn giữ 1 hàng
                        flexWrap: { xs: "wrap", md: "nowrap" },
                    }}
                >
                    {/* DateTime range */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "50%" },
                        }}
                    >
                        <CustomDateTimePicker
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </Box>

                    {/* Select Tag */}
                    <TextField
                        select
                        fullWidth
                        label="Name"
                        variant="standard"
                        sx={{
                            width: { xs: "100%", md: "25%" },
                        }}
                        value={selectedTag}
                        onChange={(e) => {
                            setSelectedTag(e.target.value);
                            if (errors.selectedTag) {
                                setErrors((prev) => ({
                                    ...prev,
                                    selectedTag: "",
                                }));
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

                    {/* Button tìm kiếm */}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FindInPageIcon />}
                        onClick={handleFindHistorical}
                        sx={{
                            textTransform: "none",
                            height: "fit-content",
                            minWidth: "120px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </Stack>
            </Paper>

            {/* Card chứa biểu đồ */}
            <Card
                sx={{
                    flex: 1,
                    minHeight: 0,
                    maxWidth: "100%",
                    boxShadow: 3,
                    borderRadius: 2,
                    filter: "drop-shadow(0 0 8px rgba(0,0,0,0.25))",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <CardContent sx={{ flex: 1, minHeight: 0, p: 1.5 }}>
                    {loading ? (
                        <Typography align="center" color="text.secondary">
                            Đang tải dữ liệu...
                        </Typography>
                    ) : listHistoricalValue.length > 0 ? (
                        <Chart
                            options={chartData.options}
                            series={chartData.series}
                            type="line"
                            height={320}
                        />
                    ) : (
                        <Typography align="center" color="text.secondary">
                            Không có dữ liệu
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default HistoricalTrend;

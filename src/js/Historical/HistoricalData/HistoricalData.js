import {
    useState, useEffect, Paper, dayjs, TextField, Chip, MenuItem,
    Box, Button, IosShareIcon, Stack, FindInPageIcon,
    CheckCircleIcon, ErrorIcon, WarningAmberIcon, SensorsOffIcon, HelpOutlineIcon,
} from '../../ImportComponents/Imports';
import { fetchAllHistoricalValue, fetchAllHistorical, findHistoricalTime } from '../../../Services/APIDevice'
import Loading from '../../Ultils/Loading/Loading';
import CustomDataGrid from '../../ImportComponents/CustomDataGrid';
import CustomDateTimePicker from '../../Ultils/DateTimePicker/DateTimePicker';
import useValidator from '../../Valiedate/Validation'
import exportToCSV from '../../Ultils/ExportCSV/exportCSV';

const ListHistorical = () => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
    const [loading, setLoading] = useState(true);
    const [listHistoricalValue, setListHistoricalValue] = useState([]);
    const [listTagHistorical, setListTagHistorical] = useState([]);
    const [selectedTag, setSelectedTag] = useState("");
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();

    const [startDate, setStartDate] = useState(dayjs().startOf("day"));
    const [endDate, setEndDate] = useState(dayjs().endOf("day"));

    useEffect(() => {
        fetchHistorialValue();
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
            const listTagHistorical = response.DT.DT.map((item, index) => ({
                id: item.id,
                name: item.name,
            }));
            setListTagHistorical(listTagHistorical);
        }
    };

    const fetchHistorialValue = async () => {
        setLoading(true);
        let response = await fetchAllHistoricalValue();
        if (response && response.EC === 0 && response.DT?.DT) {
            const records = [];
            // Lặp qua từng ngày
            response.DT.DT.forEach((dayItem) => {
                // Lặp qua từng giá trị trong ngày
                dayItem.values.forEach((v, idx) => {
                    const tagKeys = Object.keys(v.value);
                    tagKeys.forEach((tagKey) => {
                        const tag = v.value[tagKey];
                        let string_status;
                        if (tag.status === 1) {
                            string_status = "Normal";
                        } else if (tag.status === 2) {
                            string_status = "Over range";
                        } else if (tag.status === 3) {
                            string_status = "Disconnect";
                        } else {
                            string_status = "Sample";
                        }
                        records.push({
                            id: records.length + 1, // tự tạo id
                            tagname: tag.tagname,
                            symbol: tag.symbol,
                            value: tag.value,
                            unit: tag.unit,
                            status: string_status,
                            // timestamp: dayjs(v.ts).format("DD-MM-YYYY - HH [giờ] : mm [phút] : ss [giây] "),
                            timestamp: dayjs(v.ts).format("DD-MM-YYYY - HH : mm : ss "),
                        });
                    });
                });
            });

            setListHistoricalValue(records);
        }

        setLoading(false);
    };

    const handleFindHistorical = async () => {
        if (!validateAll()) return;
        try {
            const startTime = startDate.format("YYYY-MM-DD HH:mm:ss");
            const endTime = endDate.format("YYYY-MM-DD HH:mm:ss");
            const selectedTagObj = listTagHistorical.find(tag => tag.id === selectedTag);
            const tagNameId = selectedTagObj ? selectedTagObj.id : "";
            const response = await findHistoricalTime({ startTime, endTime, tagNameId });
            console.log('check data: ', response)
            if (response && response.EC === 0 && response.DT) {
                const dataFinds = [];
                response.DT.forEach((item) => {
                    if (item.value) {
                        const tag = item.value;
                        let string_status;
                        if (tag.status === 1) {
                            string_status = "Normal";
                        } else if (tag.status === 2) {
                            string_status = "Over range";
                        } else if (tag.status === 3) {
                            string_status = "Disconnect";
                        } else {
                            string_status = "Sample";
                        }

                        dataFinds.push({
                            id: dataFinds.length + 1,
                            tagname: tag.tagname,
                            symbol: tag.symbol,
                            value: tag.value,
                            unit: tag.unit,
                            status: string_status,
                            timestamp: dayjs(item.ts).format("DD-MM-YYYY - HH : mm : ss"),
                        });
                    }
                });
                setListHistoricalValue(dataFinds);
            }
        } catch (error) {

        }
    };

    const handleExportCSV = () => {
        const headers = ['STT', 'Ngày và Giờ', 'Tên', 'Symbol', 'Giá trị', 'Đơn vị', 'Trạng thái'];

        const csvData = listHistoricalValue.map(item => [
            item.id,
            item.timestamp,
            item.tagname,
            item.symbol,
            item.value,
            item.unit,
            item.status
        ]);

        exportToCSV(headers, csvData, 'historical_data');
    };

    const columns = [
        { field: 'id', headerName: 'STT', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'timestamp', headerName: 'Ngày và Giờ', width: 250, align: 'center', headerAlign: 'center' },
        { field: 'tagname', headerName: 'Tên', width: 200, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'value', headerName: 'Giá trị', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Đơn vị', flex: 1, align: 'center', headerAlign: 'center' },
        {
            field: "status",
            headerName: "Trạng thái",
            width: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                let color = "default";
                let icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;
                let label = params.value || "Unknown";

                switch (params.value) {
                    case "Normal":
                        color = "success";
                        icon = <CheckCircleIcon sx={{ fontSize: 18 }} />;
                        break;
                    case "Over range":
                        color = "warning";
                        icon = <WarningAmberIcon sx={{ fontSize: 18 }} />;
                        break;
                    case "Disconnect":
                        color = "error";
                        icon = <ErrorIcon sx={{ fontSize: 18 }} />;
                        break;
                    case "Sample":
                        color = "secondary";
                        icon = < SensorsOffIcon sx={{ fontSize: 18 }} />;
                        break;
                    default:
                        color = "default";
                        icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;
                }

                return (
                    <Chip
                        icon={icon}
                        label={label}
                        color={color}
                        variant="filled"
                        sx={{
                            fontWeight: 600,
                            textTransform: "capitalize",
                            minWidth: 120,
                            justifyContent: "center",
                            pl: 1,
                            "& .MuiChip-icon": {
                                ml: 0.3,
                            },
                        }}
                    />
                );
            }
        }
    ];

    return (
        <div>
            <Paper sx={{ height: 100, width: '100%', p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                    <Box sx={{ width: '45%' }}>
                        <CustomDateTimePicker
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </Box>
                    {/* Danh sách thẻ */}
                    <TextField
                        select
                        fullWidth
                        label="Name"
                        variant="standard"
                        sx={{ width: '31%' }}
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


                    {/* Nút tìm kiếm */}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FindInPageIcon />}
                        onClick={handleFindHistorical}
                        sx={{
                            textTransform: 'none',
                            height: 'fit-content',
                            minWidth: '120px',
                            ml: 2
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    {/* Nút xuất file */}
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<IosShareIcon />}
                        onClick={handleExportCSV}
                        sx={{
                            textTransform: 'none',
                            height: 'fit-content',
                            minWidth: '120px'
                        }}
                    >
                        Xuất Excel
                    </Button>

                </Stack>
            </Paper>

            <Paper sx={{ height: 631, width: '100%' }}>
                <CustomDataGrid
                    rows={listHistoricalValue}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[20, 50, 100]}
                    pagination
                    disableRowSelectionOnClick
                    checkboxSelection={false}
                    hideFooterSelectedRowCount={true}
                    loading={loading}
                    sx={{
                        '& .MuiTablePagination-toolbar': {
                            justifyContent: 'space-between',
                        },
                        '& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer': {
                            display: 'none', // Ẩn nút sort
                        },
                        '& .MuiDataGrid-columnHeader .MuiDataGrid-menuIcon': {
                            display: 'none', // Ẩn menu icon
                        },
                    }}
                />

                {loading && <Loading text="Đang tải dữ liệu..." />
                }
            </Paper>

        </div>
    );
}

export default ListHistorical;
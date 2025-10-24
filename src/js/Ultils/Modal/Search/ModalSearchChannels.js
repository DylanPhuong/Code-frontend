import {
    useState, useEffect,
    Paper, Button, IconButton, Modal, Box, Typography, InputAdornment, TextField, DataGrid,
    AddBoxIcon, SearchIcon, CancelIcon, CancelPresentation, MenuItem,
    toast
} from '../../../ImportComponents/Imports';
import '../../../../scss/main.scss'
import { fetchAllChannels, createNewHistorical } from '../../../../Services/APIDevice';
import Loading from '../../Loading/Loading';
import useValidator from '../../../Valiedate/Validation'
import { socket } from '../../Socket/Socket';

const ModalSearchChannels = (props) => {
    const { openModalAdd, handleCloseModalAdd, dataConfig } = props;

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        maxHeight: '90vh', // chiều cao tối đa theo viewport
        overflowY: 'auto',
    };

    const defaultData = {
        type: ""
    };

    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [dataEditTag, setDataEditTag] = useState(defaultData);

    const [listChannelSearch, setlistChannelSearch] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searched, setSearched] = useState("");
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        if (openModalAdd) {
            setDataEditTag(defaultData);
            setSelectedRows([]);
            fetchChannel();
        }
    }, [openModalAdd]);

    const fetchChannel = async () => {
        setLoading(true);
        let response = await fetchAllChannels();
        // console.log('checkkkkkkkkkkkkkkkk: ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                channel: item.channel,
                name: item.name,
                deviceId: item.device?._id,
                deviceName: item.device?.name,
                symbol: item.symbol,
                unit: item.unit,
            }));
            setlistChannelSearch(rowsWithId);
            setFilteredList(rowsWithId);
        }
        setLoading(false);
    };

    const handleOnchangeInput = (value, name) => {
        setDataEditTag((prev) => ({ ...prev, [name]: value, }));
        const errorMessage = validate(name, value);
        setErrors((prev) => ({ ...prev, [name]: errorMessage, }));
    };

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataEditTag).forEach(([key, value]) => {
            newErrors[key] = validate(key, value);

        });
        setErrors(newErrors);
        // Kiểm tra xem có lỗi nào không
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleClose = () => {
        handleCloseModalAdd();
        setErrors({});
        setSelectedRows([]);
        setDataEditTag(defaultData);
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearched(value);
        const filteredRows = listChannelSearch.filter((row) =>
            row.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredList(filteredRows);
    };

    const handleAdd = async () => {
        if (!validateAll()) {
            return;
        }

        const selectedData = filteredList
            .filter((row) => selectedRows.includes(row.id))
            .map((row) => ({
                id: row.id,
                name: row.name,
                type: dataEditTag.type,
                device: { _id: row.deviceId },
            }));

        // console.log("check addddddd: ", selectedData);
        const res = await createNewHistorical(selectedData);
        if (res && res.EC === 0) {
            toast.success(res.EM);
            socket.emit("CHANGE HISTORICAL TYPE");
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    const columns = [
        { field: 'channel', headerName: 'Channel', width: 80, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', width: 200, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Unit', width: 100, align: 'center', headerAlign: 'center' },
    ];

    return (
        <Modal open={openModalAdd} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                    Tìm kiếm Channels
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: 20,
                        width: { xs: 36, md: 48 },
                        height: { xs: 36, md: 48 },
                    }}
                >
                    <CancelIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                </IconButton>

                {/* Thanh tìm kiếm */}
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={searched}
                    onChange={handleSearchChange}
                    placeholder="Nhập tên kênh cần tìm..."
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Paper sx={{ height: 350, width: '100%' }}>
                    <DataGrid
                        rows={filteredList}
                        columns={columns}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[5, 10, 20]}
                        pagination
                        checkboxSelection
                        onSelectionModelChange={(newSelection) => {
                            setSelectedRows(newSelection);
                        }}
                        sx={{
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#777777ff",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 15,
                            },
                            "& .MuiDataGrid-columnSeparator": { display: "none" },
                            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                                margin: 0,
                            },
                        }}
                        loading={loading}
                        localeText={{
                            noRowsLabel: 'Không có dữ liệu'
                        }}
                        componentsProps={{
                            pagination: {
                                labelRowsPerPage: 'Số hàng mỗi trang:',
                                labelDisplayedRows: ({ from, to, count }) =>
                                    `${from}–${to} trong tổng ${count !== -1 ? count : `hơn ${to}`}`,
                            }
                        }}
                    />

                    {loading && <Loading text="Đang tải dữ liệu..." />}
                </Paper>

                <Paper sx={{ mt: 2, width: "100%", p: 2, borderRadius: 2, boxShadow: 2, }} >
                    <Box sx={{ ml: 15, display: "flex", alignItems: "center", height: 50, }} >
                        <Typography sx={{ fontSize: 16, fontWeight: 500, }} >
                            Chọn Group lưu trữ:
                        </Typography>
                        <TextField
                            select
                            label="Type"
                            variant="outlined"
                            sx={{ ml: 3, mt: 0, minWidth: 200 }}
                            value={dataEditTag.type || ""}
                            onChange={(event) => handleOnchangeInput(event.target.value, 'type')}
                            error={!!errors.type}
                            helperText={errors.type}
                        >
                            {dataConfig.map((item) => (
                                <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>

                    </Box>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelPresentation />}
                        sx={{ ml: 1.5, textTransform: 'none' }}
                        onClick={handleClose}
                    >
                        Thoát

                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddBoxIcon />}
                        sx={{ ml: 1.5, textTransform: 'none' }}
                        onClick={handleAdd}
                        disabled={selectedRows.length === 0}
                    >
                        Thêm
                    </Button>

                </Box>

            </Box>
        </Modal>
    );
};

export default ModalSearchChannels;

import {
    Modal,
    Box,
    Typography,
    Paper,
    IconButton,
    TextField,
    InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import { fetchAllChannels } from '../../../Services/APIDevice';
import Loading from '../Loading/Loading';

const ModalSearchChannels = (props) => {
    const { openModalSearch, handleCloseModalSearch } = props;

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
    };

    const [listChannelSearch, setlistChannelSearch] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searched, setSearched] = useState("");
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (openModalSearch) {
            fetchChannel();
        }
    }, [openModalSearch]);

    const fetchChannel = async () => {
        setLoading(true);
        let response = await fetchAllChannels();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                channel: item.channel,
                name: item.name,
                symbol: item.symbol,
                unit: item.unit,
            }));
            setlistChannelSearch(rowsWithId);
            setFilteredList(rowsWithId);
        }
        setLoading(false);
    };

    const handleClose = () => {
        handleCloseModalSearch();
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearched(value);
        const filteredRows = listChannelSearch.filter((row) =>
            row.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredList(filteredRows);
    };

    const columns = [
        {
            field: "action",
            headerName: "Action",
            minWidth: 90,
            sortable: false,
            filterable: false,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => (
                <IconButton
                    color="primary"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Edit row:", params.row);
                    }}
                >
                    <EditIcon />
                </IconButton>
            ),
        },
        { field: 'channel', headerName: 'Channel', width: 80, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', width: 200, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Unit', width: 100, align: 'center', headerAlign: 'center' },
    ];

    return (
        <Modal open={openModalSearch} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                    Tìm kiếm Channels
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                    }}
                >
                    <CloseIcon />
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

                <Paper sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={filteredList}
                        columns={columns}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[5, 10, 20]}
                        pagination
                        disableColumnMenu
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
                            noRowsLabel: 'Không có dữ liệu',
                            footerRowSelected: (count) => `${count} hàng đã chọn`,
                            MuiTablePagination: {
                                labelRowsPerPage: 'Số hàng mỗi trang:',
                            },
                        }}
                    />
                    {loading && <Loading text="Đang tải dữ liệu..." />}
                </Paper>
            </Box>
        </Modal>
    );
};

export default ModalSearchChannels;

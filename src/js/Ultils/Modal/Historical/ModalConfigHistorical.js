import {
    useState, useEffect,
    Paper, IconButton, Modal, Box, Typography,
    DataGrid,
    BorderColorIcon, CancelIcon,

} from '../../../ImportComponents/Imports';
import { fetchConfigHistorical } from '../../../../Services/APIDevice';
import Loading from '../../Loading/Loading';

const ModalConfigHistorical = (props) => {

    const { openModalConfig, handleCloseModalConfig, handleOpenModalEditConfig, reloadConfig } = props;

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

    const [listConfig, setlistConfig] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (openModalConfig) {
            fetchConfig();
        }
    }, [openModalConfig, reloadConfig]);

    const fetchConfig = async () => {
        setLoading(true);
        let response = await fetchConfigHistorical();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
                type: item.type,
                cycle: item.cycle,
            }));
            setlistConfig(rowsWithId);
        }
        setLoading(false);
    };

    const handleClose = () => {
        handleCloseModalConfig();
    };

    const handleEditConfig = (row) => {
        handleOpenModalEditConfig(row);
    };

    const columns = [

        { field: 'name', headerName: 'Name', width: 200, align: 'center', headerAlign: 'center' },
        { field: 'type', headerName: 'Type', width: 150, align: 'center', headerAlign: 'center' },
        { field: 'cycle', headerName: 'Cycle (s)', width: 150, align: 'center', headerAlign: 'center' },
        {
            field: "action",
            headerName: "Action",
            minWidth: 100,
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
                        handleEditConfig(params.row)
                    }}
                >
                    <BorderColorIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <Modal open={openModalConfig} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                    Cấu hình lưu trữ dữ liệu
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

                <Paper sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={listConfig}
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

                {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>

                    <Button
                        variant="contained"
                        color="success"
                        sx={{ textTransform: 'none' }}
                    >
                        Thoát
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        sx={{ ml: 1.5, textTransform: 'none' }}
                    >
                        Thêm
                    </Button>

                </Box> */}

            </Box>
        </Modal>
    );
};

export default ModalConfigHistorical;

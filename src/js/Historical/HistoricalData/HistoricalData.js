import { useState, useEffect, Paper, DataGrid, dayjs, Box } from '../../ImportComponents/Imports';
// import '../../../scss/main.scss';
import { fetchAllHistoricalValue } from '../../../Services/APIDevice'
import Loading from '../../Ultils/Loading/Loading';

const ListHistorical = () => {

    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [listHistoricalValue, setListHistoricalValue] = useState([]);

    useEffect(() => {
        fetchHistorialValue();
    }, []);

    const fetchHistorialValue = async () => {
        setLoading(true);
        let response = await fetchAllHistoricalValue();
        console.log('check response: ', response)
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
                let bgColor = "";
                switch (params.value) {
                    case "Normal":
                        bgColor = "#4CAF50"; // xanh lá
                        break;
                    case "Over range":
                        bgColor = "#FF9800"; // cam
                        break;
                    case "Disconnect":
                        bgColor = "#F44336"; // đỏ
                        break;
                    case "Sample":
                        bgColor = "#795548"; // nâu
                        break;
                    default:
                        bgColor = "#9E9E9E"; // xám cho an toàn
                }
                return (
                    <Box
                        sx={{
                            bgcolor: bgColor,
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: "8px",
                            fontWeight: 600,
                            textAlign: "center",
                            width: "50%",
                        }}
                    >
                        {params.value}
                    </Box>
                );
            },
        },
    ];

    return (
        <div>
            <Paper sx={{ height: 631, width: '100%' }}>
                <DataGrid
                    rows={listHistoricalValue}
                    columns={columns}
                    pageSize={pageSize}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    rowsPerPageOptions={[10, 50, 100]}
                    pagination
                    disableRowSelectionOnClick
                    checkboxSelection={false}
                    hideFooterSelectedRowCount={true}
                    // loading={loading}
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

                {loading && <Loading text="Đang tải dữ liệu..." />
                }
            </Paper>

        </div>
    );
}

export default ListHistorical;

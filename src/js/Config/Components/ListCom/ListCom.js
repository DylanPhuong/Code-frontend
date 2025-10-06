import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
// import toast from 'react-hot-toast';
import { fetchAllComs } from '../../../../Services/APIDevice'
import ModalCom from '../../../Ultils/Modal/ModalCom';
import Loading from '../../../Ultils/Loading/Loading';

const ListCom = (props) => {
    const [pageSize, setPageSize] = useState(5);
    const [listComs, setListComs] = useState([]);
    const [dataModalCom, setdataModalCom] = useState([]);
    const [isShowModalCom, setisShowModalCom] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComs();
    }, []);

    const fetchComs = async () => {
        let response = await fetchAllComs();
        setLoading(false);
        console.log('check data com read: ', response)
        if (response && response.EC === 0 && response.DT?.DT) {
            const rowsWithId = response.DT.DT.map((item, index) => ({
                id: item._id,
                name: item.name,
                type: item.type,
                baudRate: item.baudRate,
                parity: item.parity,
                dataBit: item.dataBit,
                stopBit: item.stopBit,
                serialPort: item.serialPort,
            }));
            setListComs(rowsWithId);
        }

    };
    const handleCloseModalCom = () => {
        setisShowModalCom(false);
        fetchComs();
    }

    const handleEditCom = (com) => {
        setdataModalCom(com)
        setisShowModalCom(true);
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'type', headerName: 'Type', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'baudRate', headerName: 'Baud Rate', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'dataBit', headerName: 'Data Bit', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'parity', headerName: 'Parity', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'stopBit', headerName: 'Stop Bit', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'serialPort', headerName: 'Serial Port', flex: 1, headerAlign: 'center', align: 'center' },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <>
                    {/* stopPropagation để không làm DataGrid thay đổi selection */}
                    <IconButton
                        color="primary"
                        onClick={(e) => { e.stopPropagation(); handleEditCom(params.row); }}
                    >
                        <EditIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <>
            <div className=''>

                <Paper sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={listComs}
                        columns={columns}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[5, 10, 20]}
                        pagination
                        hideFooterSelectedRowCount={true}
                        sx={{
                            "& .MuiDataGrid-columnSeparator": { display: "none" },
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

                    {loading && (
                        <Loading text="Đang tải dữ liệu..." />
                    )}
                </Paper>
            </div>

            <ModalCom
                handleCloseModalCom={handleCloseModalCom}
                isShowModalCom={isShowModalCom}
                dataModalCom={dataModalCom}
            />
        </>
    );
};

export default ListCom;

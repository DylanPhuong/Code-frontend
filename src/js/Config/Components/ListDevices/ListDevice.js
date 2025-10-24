import {
    useState, useEffect,
    Paper, Button, IconButton,
    DataGrid,
    AddCardIcon, BorderColorIcon, DeleteForeverIcon,
    toast
} from '../../../ImportComponents/Imports';
import { fetchAllDevices, deleteDevice, fetchAllComs, fetchAllProtocol } from "../../../../Services/APIDevice";
import ModalDelete from '../../../Ultils/Modal/Delete/ModalDelete';
import ModalProtocol from '../../../Ultils/Modal/Protocol/ModalProtocol';
import ModalDevice from '../../../Ultils/Modal/Device/ModalDevice';
import Loading from '../../../Ultils/Loading/Loading';

const ListDevices = (props) => {
    const [pageSize, setPageSize] = useState(5);
    const [listDevices, setListDevices] = useState([]);
    const [listComs, setListComs] = useState([])
    const [listProtocol, setListProtocol] = useState([])
    const [listModbus, setListModbus] = useState([])
    const [listSiemens, setListSiemens] = useState([])
    const [actionModalDevice, setactionModalDevice] = useState('CREATE');
    const [actionDeleteDevice, setactionDeleteDevice] = useState('');
    // State cho các modal
    const [isShowModalDelete, setisShowModalDelete] = useState(false);
    const [isShowModalProtocol, setisShowModalProtocol] = useState(false);
    const [isShowModalDevice, setisShowModalDevice] = useState(false);

    const [dataModalDelete, setdataModalDelete] = useState([]);
    const [dataModalDevice, setdataModalDevice] = useState([])
    const [selectionModel, setSelectionModel] = useState([]);
    const [selectedCount, setSelectedCount] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDevices();
        fetchComs();
        fetchProtocol();
    }, []);

    const fetchDevices = async () => {
        setLoading(true);
        let response = await fetchAllDevices();
        // console.log('Check Lisst COM: ', response)
        if (response && response.EC === 0 && response.DT?.DT) {
            const rowsWithId = response.DT.DT.map((item, index) => ({
                id: item._id,
                name: item.name,
                protocol: item.protocol,
                driverName: item.driverName,
                ipAddress: item.ipAddress,
                port: item.port,
                serialPort: item.serialPort,
                timeOut: item.timeOut
            }));
            setListDevices(rowsWithId);
        }
        setSelectionModel([]);
        setSelectedCount(0);
        setLoading(false);
    };

    const fetchComs = async () => {
        let response = await fetchAllComs();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rows = response.DT.DT.map((item) => ({
                name: item.name,
                serialPort: item.serialPort,
            }));
            setListComs(rows);
        }
    };

    const fetchProtocol = async () => {
        let response = await fetchAllProtocol();
        if (response && response.EC === 0 && response.DT) {
            const protocol = response.DT.Protocol?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            const modbus = response.DT.Modbus?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            const siemens = response.DT.Siemens?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            setListProtocol(protocol);
            setListModbus(modbus);
            setListSiemens(siemens);
        }
    };

    const handleCloseModalDevice = () => {
        setisShowModalDevice(false);
        fetchDevices();
    };

    const handleCloseModalDelete = () => setisShowModalDelete(false);
    const handleCloseModalProtocol = () => setisShowModalProtocol(false);

    const handleAddDevice = () => {
        setactionModalDevice("CREATE");
        setisShowModalProtocol(true);
    };

    const handleEditDevice = (device) => {
        // console.log('check device update: ', device)
        setSelectionModel([device.id]);
        setactionModalDevice("EDIT");
        setdataModalDevice(device)
        setisShowModalDevice(true);
    };

    const handleDeleteDevice = (device) => {
        if (device) {
            setSelectionModel([device.id]);
            setdataModalDelete([device.id]);
            setSelectedCount(1);
        } else {
            setdataModalDelete(selectionModel);
            setSelectedCount(selectionModel.length);
        }
        setactionDeleteDevice('DEVICE')
        setisShowModalDelete(true);
    };


    const conformDeleteDevice = async () => {
        let res = await deleteDevice({ ids: dataModalDelete });
        let serverData = res
        if (+serverData.EC === 0) {
            toast.success(serverData.EM)
            setisShowModalDelete(false)
            await fetchDevices()
        }
        else {
            toast.error(serverData.EM)
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'driverName', headerName: 'Driver Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'ipAddress', headerName: 'IP Address', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'port', headerName: 'Port', flex: 1, headerAlign: 'center', align: 'center' },
        {
            field: 'serialPort',
            headerName: 'Serial Port',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => {
                const com = listComs.find(c => c.serialPort === params.row.serialPort);
                return com ? com.name : params.row.serialPort;
            }
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <>
                    {/* stopPropagation để không làm DataGrid thay đổi selection */}
                    <IconButton
                        sx={{ mr: 2 }}
                        color="primary"
                        onClick={(e) => { e.stopPropagation(); handleEditDevice(params.row); }}
                    >
                        <BorderColorIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(params.row); }}
                    >
                        <DeleteForeverIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <>
            < >
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddCardIcon />}
                    onClick={handleAddDevice}
                    sx={{ mb: 1.5, textTransform: 'none' }}
                >
                    Thêm thiết bị
                </Button>

                {selectedCount > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(); }}
                        sx={{ mb: 1.5, ml: 1.5, textTransform: 'none' }}
                    >
                        Xóa thiết bị
                    </Button>
                )}

                <Paper sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={listDevices}
                        columns={columns}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[5, 10, 20]}
                        pagination
                        checkboxSelection
                        selectionModel={selectionModel}
                        onSelectionModelChange={(newSelection) => {
                            // cho phép chọn nhiều khi dùng checkbox/checkall
                            setSelectionModel(newSelection);
                            setSelectedCount(newSelection.length);

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

                    {loading && (
                        <Loading text="Đang tải dữ liệu..." />
                    )}
                </Paper>
            </>

            {/* Modal chọn protocol */}
            <ModalProtocol
                action={actionModalDevice}
                listProtocol={listProtocol}
                listModbus={listModbus}
                listSiemens={listSiemens}
                dataModalDevice={dataModalDevice}
                isShowModalProtocol={isShowModalProtocol}
                handleCloseModalProtocol={handleCloseModalProtocol}
                fetchDevices={fetchDevices}
                // thêm props để mở ModalDevice khi Add → chọn xong Protocol
                setisShowModalDevice={setisShowModalDevice}
                setdataModalDevice={setdataModalDevice}
            />

            {/* Modal nhập thông tin thiết bị (Edit sẽ mở trực tiếp) */}
            <ModalDevice
                listProtocol={listProtocol}
                listModbus={listModbus}
                action={actionModalDevice}
                dataModalDevice={dataModalDevice}
                isShowModalDevice={isShowModalDevice}
                handleCloseModalDevice={handleCloseModalDevice}
            />

            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                action={actionDeleteDevice}
                handleCloseModalDelete={handleCloseModalDelete}
                conformDeleteDevice={conformDeleteDevice}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
            />

        </>
    );
};

export default ListDevices;

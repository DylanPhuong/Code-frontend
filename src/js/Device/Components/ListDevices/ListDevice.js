import {
    useState,
    useEffect,
    Paper,
    Button,
    Box,
    AddCardIcon,
    BorderColorIcon,
    DeleteForeverIcon,
    toast,
} from "../../../ImportComponents/Imports";

import {
    fetchAllDevices,
    deleteDevice,
    fetchAllComs,
    fetchAllProtocol,
} from "../../../../Services/APIDevice";

import ModalDelete from "../../../Ultils/Modal/Delete/ModalDelete";
import ModalProtocol from "../../../Ultils/Modal/Protocol/ModalProtocol";
import ModalDevice from "../../../Ultils/Modal/Device/ModalDevice";
import Loading from "../../../Ultils/Loading/Loading";
import CustomDataGrid from "../../../ImportComponents/CustomDataGrid";

const ListDevices = () => {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [listDevices, setListDevices] = useState([]);
    const [listComs, setListComs] = useState([]);
    const [listProtocol, setListProtocol] = useState([]);
    const [listModbus, setListModbus] = useState([]);
    const [listSiemens, setListSiemens] = useState([]);
    const [listMqtt, setListMqtt] = useState([]);

    const [actionModalDevice, setactionModalDevice] = useState("CREATE");
    const [actionDeleteDevice, setactionDeleteDevice] = useState("");

    const [isShowModalDelete, setisShowModalDelete] = useState(false);
    const [isShowModalProtocol, setisShowModalProtocol] = useState(false);
    const [isShowModalDevice, setisShowModalDevice] = useState(false);

    const [dataModalDelete, setdataModalDelete] = useState([]);
    const [dataModalDevice, setdataModalDevice] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await fetchComs();
            await fetchDevices();
            await fetchProtocol();
        };
        init();
    }, []);

    const fetchDevices = async () => {
        setLoading(true);
        const response = await fetchAllDevices();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rowsWithId = response.DT.DT
                .filter((item) => !!item._id)
                .map((item) => ({
                    ...item,
                    id: item._id,
                    name: item.name,
                    protocol: item.protocol,
                    driverName: item.driverName,
                    ipAddress: item.ipAddress,
                    port: item.port,
                    username: item.username,
                    password: item.password,
                    serialPort: item.serialPort,
                    timeOut: item.timeOut,
                }));
            setListDevices(rowsWithId);
        }
        setSelectionModel([]);
        setSelectedCount(0);
        setLoading(false);
    };

    const fetchComs = async () => {
        const response = await fetchAllComs();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rows = response.DT.DT.map((item) => ({
                name: item.name,
                serialPort: item.serialPort,
            }));
            setListComs(rows);
        }
    };

    const fetchProtocol = async () => {
        const response = await fetchAllProtocol();
        if (response && response.EC === 0 && response.DT) {
            const protocol =
                response.DT.Protocol?.map((item) => ({
                    id: item._id,
                    name: item.name,
                })) || [];
            const modbus =
                response.DT.Modbus?.map((item) => ({
                    id: item._id,
                    name: item.name,
                })) || [];
            const siemens =
                response.DT.Siemens?.map((item) => ({
                    id: item._id,
                    name: item.name,
                })) || [];
            const mqtt =
                response.DT.MQTT?.map((item) => ({
                    id: item._id,
                    name: item.name,
                })) || [];
            setListProtocol(protocol);
            setListModbus(modbus);
            setListSiemens(siemens);
            setListMqtt(mqtt);
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
        setSelectionModel([device.id]);
        setactionModalDevice("EDIT");
        setdataModalDevice(device);
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
        setactionDeleteDevice("DEVICE");
        setisShowModalDelete(true);
    };

    const conformDeleteDevice = async () => {
        const res = await deleteDevice({ ids: dataModalDelete });
        if (+res.EC === 0) {
            toast.success(res.EM);
            setisShowModalDelete(false);
            await fetchDevices();
        } else {
            toast.error(res.EM);
        }
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            headerAlign: "center",
            align: "center",
            minWidth: 140,
        },
        {
            field: "driverName",
            headerName: "Driver Name",
            flex: 1,
            headerAlign: "center",
            align: "center",
            minWidth: 160,
        },
        {
            field: "ipAddress",
            headerName: "IP Address",
            flex: 1,
            headerAlign: "center",
            align: "center",
            minWidth: 130,
        },
        {
            field: "port",
            headerName: "Port",
            flex: 0.8,
            headerAlign: "center",
            align: "center",
            minWidth: 80,
        },
        {
            field: "serialPort",
            headerName: "Serial Port",
            flex: 0.9,
            headerAlign: "center",
            align: "center",
            minWidth: 110,
            renderCell: (params) => {
                const serialPort = params.row?.serialPort;
                const com = Array.isArray(listComs)
                    ? listComs.find((c) => c.serialPort === serialPort)
                    : null;
                return com?.name || serialPort || "";
            },
        },
        {
            field: "action",
            headerName: "Action",
            width: 170,
            minWidth: 170,
            headerAlign: "center",
            align: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                if (!params || !params.row) return null;
                return (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 0.5,
                            width: "100%",
                            height: "100%", // giúp canh giữa theo chiều dọc
                        }}
                    >
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<BorderColorIcon />}
                            sx={{
                                textTransform: "none",
                                minWidth: 70,
                                px: 1,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditDevice(params.row);
                            }}
                        >
                            Sửa
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            sx={{
                                textTransform: "none",
                                minWidth: 70,
                                px: 1,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDevice(params.row);
                            }}
                        >
                            Xóa
                        </Button>
                    </Box>
                );
            },
        },
    ];

    return (
        <>
            <Button
                variant="contained"
                color="success"
                startIcon={<AddCardIcon />}
                onClick={handleAddDevice}
                sx={{ mb: 1.5, textTransform: "none" }}
            >
                Thêm thiết bị
            </Button>

            {selectedCount > 0 && (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDevice();
                    }}
                    sx={{
                        mb: 1.5,
                        ml: 1.5,
                        textTransform: "none",
                    }}
                >
                    Xóa thiết bị
                </Button>
            )}

            <Paper sx={{ height: 400, width: "100%" }}>
                <CustomDataGrid
                    getRowId={(row) => row.id}
                    rows={listDevices || []}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    pagination
                    checkboxSelection
                    selectionModel={selectionModel}
                    rowSelectionModel={selectionModel}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectionModel(newSelection);
                        setSelectedCount(newSelection.length);
                    }}
                    loading={loading}
                />
                {loading && <Loading text="Đang tải dữ liệu..." />}
            </Paper>

            {/* Modal chọn protocol */}
            <ModalProtocol
                action={actionModalDevice}
                listProtocol={listProtocol}
                listModbus={listModbus}
                listSiemens={listSiemens}
                listMqtt={listMqtt}
                dataModalDevice={dataModalDevice}
                isShowModalProtocol={isShowModalProtocol}
                handleCloseModalProtocol={handleCloseModalProtocol}
                fetchDevices={fetchDevices}
                setisShowModalDevice={setisShowModalDevice}
                setdataModalDevice={setdataModalDevice}
            />

            {/* Modal nhập thông tin thiết bị */}
            <ModalDevice
                listProtocol={listProtocol}
                listModbus={listModbus}
                listSiemens={listSiemens}
                listMqtt={listMqtt}
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

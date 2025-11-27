import {
    useState,
    useEffect,
    Chip,
    Box,
    Button,
    Paper,
    LinearProgress,
    AddCardIcon,
    BorderColorIcon,
    DeleteForeverIcon,
    toast,
    CheckCircleIcon,
    ErrorIcon,
    WarningAmberIcon,
    SensorsOffIcon,
    HelpOutlineIcon,
    socket,
    CustomDataGrid,
    ModalChannel,
    ModalDelete,
    Loading,
    InputPopover,
} from "../ImportComponents/Imports";

import {
    fetchAllDevices,
    fetchAllChannels,
    fetchAllDataFormat,
    fetchAllDataType,
    fetchAllFunctionCode,
    deleteChannel,
} from "../../Services/APIDevice";

const FunctionSettings = () => {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const [listChannel, setListChannel] = useState([]);
    const [listDataSocket, setListDataSocket] = useState([]);
    const [listDataFormat, setlistDataFormat] = useState([]);
    const [listDataType, setlistDataType] = useState([]);
    const [listFunctionCode, setlistFunctionCode] = useState({
        modbus: [],
        mqtt: [],
    });
    const [listDevices, setListDevices] = useState([]);

    const [actionFuncSetting, setactionactionFuncSetting] =
        useState("FUNC");
    const [actionModalChannel, setactionModalChannel] =
        useState("CREATE");
    const [actionDeleteChannel, setactionDeleteChannel] =
        useState("");

    // Modal
    const [isShowModalDelete, setisShowModalDelete] =
        useState(false);
    const [isShowModalChannel, setisShowModalChannel] =
        useState(false);
    const [dataModalChannel, setdataModalChannel] = useState([]);
    const [dataModalDelete, setdataModalDelete] = useState([]);
    const [selectionChannel, setSelectionChannel] = useState([]);
    const [selectedCount, setSelectedCount] = useState([]);

    const [loading, setLoading] = useState(true);

    // Popover ghi giá trị
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    // ===== SOCKET REALTIME =====
    useEffect(() => {
        socket.connect();

        socket.on("SERVER SEND HOME DATA", (data) => {
            const mapped = (Array.isArray(data) ? data : []).map(
                (item, index) => {
                    let string_status;
                    if (item.status === 1) string_status = "Normal";
                    else if (item.status === 2)
                        string_status = "Over range";
                    else if (item.status === 3)
                        string_status = "Disconnect";
                    else string_status = "Sample";

                    return {
                        id: item.tagnameId || index,
                        name: item.tagname,
                        realValue: item.rawValue,
                        value: item.value,
                        channel: item.channel,
                        symbol: item.symbol,
                        deviceId: item.deviceId,
                        slaveId: item.slaveId,
                        address: item.address,
                        functionCode: item.functionCode,
                        dataFormat: item.dataFormat,
                        dataType: item.dataType,
                        permission: item.permission,
                        status: string_status,
                    };
                }
            );
            setListDataSocket(mapped);
            setLoading(false);
        });

        socket.on("SERVER WRITE RESULT", (res) => {
            if (res?.success) {
                toast.success(res.message || "Ghi thành công!");
            } else {
                toast.error("Ghi thất bại: " + (res?.error || ""));
            }
        });

        return () => {
            socket.off("SERVER WRITE RESULT");
            socket.off("SERVER SEND HOME DATA");
            socket.disconnect();
        };
    }, []);

    // ===== FETCH CONFIG =====
    useEffect(() => {
        const init = async () => {
            const functionCodes = await fetchFunctionCode();
            const dataFormats = await fetchDataFormat();
            const dataTypes = await fetchDataType();
            const devices = await fetchDevices();
            await fetchChannel(
                functionCodes,
                dataFormats,
                dataTypes,
                devices
            );
            setLoading(false);
        };
        init();
    }, [isShowModalChannel]);

    const fetchChannel = async (
        functionCodes = { modbus: [], mqtt: [] },
        dataFormats = [],
        dataTypes = [],
        devices = []
    ) => {
        setLoading(true);
        const response = await fetchAllChannels();

        if (
            response &&
            response.EC === 0 &&
            Array.isArray(response.DT?.DT)
        ) {
            const rowsWithId = response.DT.DT.map((item) => {
                const deviceInfo = devices.find(
                    (device) => device.id === item.device?._id
                );
                const deviceProtocol = deviceInfo
                    ? deviceInfo.protocol
                    : null;

                let func;
                if (deviceProtocol === "MQTT") {
                    func = functionCodes.mqtt.find(
                        (f) =>
                            f.id === item.functionCode ||
                            Number(f.id) ===
                            Number(item.functionCode) ||
                            String(f.id) ===
                            String(item.functionCode)
                    );
                } else {
                    func = functionCodes.modbus.find(
                        (f) =>
                            f.id === item.functionCode ||
                            Number(f.id) ===
                            Number(item.functionCode) ||
                            String(f.id) ===
                            String(item.functionCode)
                    );
                }

                const format = dataFormats.find(
                    (f) =>
                        Number(f.id) === Number(item.dataFormat)
                );
                const type = dataTypes.find(
                    (t) =>
                        Number(t.id) === Number(item.dataType)
                );

                return {
                    id: item._id,
                    channel: item.channel,
                    name: item.name,
                    deviceId: item.device?._id,
                    deviceName: item.device?.name,
                    deviceProtocol: deviceProtocol,
                    symbol: item.symbol,
                    unit: item.unit,
                    offset: item.offset,
                    gain: item.gain,
                    slaveId: item.slaveId,
                    address: item.address,
                    topic: item.topic,
                    functionCodeId: func
                        ? func.id
                        : item.functionCode,
                    functionCodeName: func
                        ? func.name
                        : `Unknown (${item.functionCode})`,
                    dataFormatId: format
                        ? format.id
                        : item.dataFormat,
                    dataFormatName: format ? format.name : "",
                    dataTypeId: type ? type.id : item.dataType,
                    dataTypeName: type ? type.name : "",
                    functionText: item.functionText,
                    permission: item.permission,
                    selectFTP: item.selectFTP,
                    selectMySQL: item.selectMySQL,
                    selectSQL: item.selectSQL,
                };
            });

            setListChannel(rowsWithId);
        }

        setSelectionChannel([]);
        setSelectedCount(0);
        setLoading(false);
    };

    const fetchDevices = async () => {
        const response = await fetchAllDevices();
        if (
            response &&
            response.EC === 0 &&
            response.DT?.DT
        ) {
            const listDevices = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
                protocol: item.protocol,
            }));
            setListDevices(listDevices);
            return listDevices;
        }
        return [];
    };

    const fetchDataFormat = async () => {
        const response = await fetchAllDataFormat();
        if (
            response &&
            response.EC === 0 &&
            Array.isArray(response.DT?.DT)
        ) {
            const listDataFormats = response.DT.DT.map(
                (item) => ({
                    id: item._id,
                    name: item.name,
                })
            );
            setlistDataFormat(listDataFormats);
            return listDataFormats;
        }
        return [];
    };

    const fetchDataType = async () => {
        const response = await fetchAllDataType();
        if (
            response &&
            response.EC === 0 &&
            Array.isArray(response.DT?.DT)
        ) {
            const listDataTypes = response.DT.DT.map(
                (item) => ({
                    id: item._id,
                    name: item.name,
                })
            );
            setlistDataType(listDataTypes);
            return listDataTypes;
        }
        return [];
    };

    const fetchFunctionCode = async () => {
        const response = await fetchAllFunctionCode();
        if (response && response.EC === 0 && response.DT) {
            const listFuncModbus =
                response.DT.Modbus?.map((item) => ({
                    id: item._id,
                    name: item.name,
                })) || [];

            const listFuncMQTT =
                response.DT.MQTT?.map((item) => ({
                    id: item._id,
                    name: item.name,
                })) || [];

            setlistFunctionCode({
                modbus: listFuncModbus,
                mqtt: listFuncMQTT,
            });

            return {
                modbus: listFuncModbus,
                mqtt: listFuncMQTT,
            };
        }
        return { modbus: [], mqtt: [] };
    };

    // ===== MODAL HANDLER =====
    const handleCloseModalChannel = () => {
        setisShowModalChannel(false);
    };

    const handleCloseModalDelete = () => {
        setisShowModalDelete(false);
    };

    const handleAddChannel = () => {
        setactionactionFuncSetting("FUNC");
        setactionModalChannel("CREATE");
        setisShowModalChannel(true);
    };

    const handleEditChannel = (device) => {
        setSelectionChannel([device.id]);
        setactionModalChannel("EDIT");
        setactionactionFuncSetting("FUNC");
        setdataModalChannel(device);
        setisShowModalChannel(true);
    };

    const handleDeleteDevice = (device) => {
        if (device) {
            setSelectionChannel([device.id]);
            setdataModalDelete([device.id]);
            setSelectedCount(1);
        } else {
            setdataModalDelete(selectionChannel);
            setSelectedCount(selectionChannel.length);
        }
        setactionDeleteChannel("CHANNEL");
        setisShowModalDelete(true);
    };

    const conformDeleteChannel = async () => {
        const res = await deleteChannel({ ids: dataModalDelete });
        if (+res.EC === 0) {
            toast.success(res.EM);
            setisShowModalDelete(false);
            await fetchChannel();
        } else {
            toast.error(res.EM);
        }
    };

    // ===== POPOVER GHI GIÁ TRỊ =====
    const handleRowClick = (params, event) => {
        if (params?.row?.permission === true) {
            setSelectedRow(params.row);
            setAnchorEl(event?.currentTarget || event?.target);
        }
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleConfirmValue = (newValue) => {
        const payload = {
            tagnameId: selectedRow?.id,
            deviceId: selectedRow?.deviceId,
            slaveId: selectedRow?.slaveId,
            address: selectedRow?.address,
            functionCode: selectedRow?.functionCode,
            dataFormat: selectedRow?.dataFormat,
            dataType: selectedRow?.dataType,
            newValue: newValue,
        };
        socket.emit("CLIENT WRITE TAG", payload);
        handleClosePopover();
    };

    // ===== CỘT BẢNG CONFIG TAG =====
    const columns = [
        {
            field: "channel",
            headerName: "Channel",
            flex: 1,
            width: 80,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            width: 150,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "deviceName",
            headerName: "Device",
            flex: 1,
            width: 150,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "slaveId",
            headerName: "Slave Id",
            flex: 1,
            width: 80,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "address",
            headerName: "Address",
            flex: 1,
            width: 100,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "functionCodeName",
            headerName: "Function Code",
            width: 250,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "acction",
            headerName: "Action",
            width: 190,
            headerAlign: "center",
            align: "center",
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1,
                        height: "100%",
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<BorderColorIcon />}
                        sx={{ textTransform: "none", minWidth: 80 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditChannel(params.row);
                        }}
                    >
                        Sửa
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        sx={{ textTransform: "none", minWidth: 80 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDevice(params.row);
                        }}
                    >
                        Xóa
                    </Button>
                </Box>
            ),
        },
    ];

    // ===== CỘT BẢNG GIÁ TRỊ REALTIME =====
    const column_value = [
        {
            field: "channel",
            headerName: "Channel",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "symbol",
            headerName: "Symbol",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "realValue",
            headerName: "Real Value",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "value",
            headerName: "Value",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                let color = "default";
                let icon = (
                    <HelpOutlineIcon sx={{ fontSize: 18 }} />
                );
                let label = params.value || "Unknown";

                switch (params.value) {
                    case "Normal":
                        color = "success";
                        icon = (
                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                        );
                        break;
                    case "Over range":
                        color = "warning";
                        icon = (
                            <WarningAmberIcon sx={{ fontSize: 18 }} />
                        );
                        break;
                    case "Disconnect":
                        color = "error";
                        icon = (
                            <ErrorIcon sx={{ fontSize: 18 }} />
                        );
                        break;
                    case "Sample":
                        color = "secondary";
                        icon = (
                            <SensorsOffIcon sx={{ fontSize: 18 }} />
                        );
                        break;
                    default:
                        color = "default";
                        icon = (
                            <HelpOutlineIcon
                                sx={{ fontSize: 18 }}
                            />
                        );
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
            },
        },
    ];

    return (
        <Box
            sx={{
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Nút thao tác */}
            <Box
                sx={{
                    mb: 1.5,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                }}
            >
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddCardIcon />}
                    onClick={handleAddChannel}
                    sx={{ textTransform: "none" }}
                >
                    Thêm Tag
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
                        sx={{ textTransform: "none" }}
                    >
                        Xóa thiết bị
                    </Button>
                )}
            </Box>

            {/* Bảng cấu hình Tag */}
            <Paper
                sx={{
                    height: 360,
                    width: "100%",
                    mb: 1.5,
                }}
            >
                <CustomDataGrid
                    rows={listChannel}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    pagination
                    checkboxSelection
                    rowSelectionModel={selectionChannel}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectionChannel(newSelection);
                        setSelectedCount(newSelection.length);
                    }}
                    loading={loading}
                />
                {loading && (
                    <Loading text="Đang tải dữ liệu..." />
                )}
            </Paper>

            {/* Bảng giá trị realtime */}
            <Paper
                sx={{
                    width: "100%",
                    flexShrink: 0,
                }}
            >
                <LinearProgress color="success" />
                <Box
                    sx={{
                        mt: 1.5,
                        fontSize: 20,
                        textAlign: "center",
                        fontWeight: 600,
                    }}
                >
                    GIÁ TRỊ CHƯA QUA XỬ LÝ
                </Box>

                <Box
                    sx={{
                        mt: 2,
                        height: 250,
                        width: "100%",
                    }}
                >
                    <CustomDataGrid
                        rows={listDataSocket}
                        columns={column_value}
                        hideFooterSelectedRowCount
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 20]}
                        pagination
                        onRowClick={handleRowClick}
                        loading={loading}
                    />
                    {loading && (
                        <Loading text="Đang tải dữ liệu..." />
                    )}
                </Box>
            </Paper>

            {/* MODAL / POPOVER */}
            <ModalChannel
                isShowModalChannel={isShowModalChannel}
                action={actionModalChannel}
                actionFuncSetting={actionFuncSetting}
                dataModalChannel={dataModalChannel}
                handleCloseModalChannel={handleCloseModalChannel}
                listDevices={listDevices}
                listDataFormat={listDataFormat}
                listDataType={listDataType}
                listFunctionCodeModbus={listFunctionCode.modbus}
                listFunctionCodeMQTT={listFunctionCode.mqtt}
            />

            <ModalDelete
                action={actionDeleteChannel}
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                conformDeleteChannel={conformDeleteChannel}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
            />

            <InputPopover
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                onConfirm={handleConfirmValue}
                functionCode={selectedRow?.functionCode}
                dataFormat={selectedRow?.dataFormat}
                dataType={selectedRow?.dataType}
                defaultValue={selectedRow?.value || 0}
            />
        </Box>
    );
};

export default FunctionSettings;

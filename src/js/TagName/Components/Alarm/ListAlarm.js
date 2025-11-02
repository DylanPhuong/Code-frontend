import {
    useState, useEffect, _, Typography, Checkbox,
    Paper, Button, IconButton, BorderColorIcon,
    AddCardIcon, DeleteForeverIcon, Box, toast
} from '../../../ImportComponents/Imports';
import { fetchAllTagAlarm, deleteTagAlarm } from "../../../../Services/APIDevice";
import ModalSearchChannels from '../../../Ultils/Modal/Search/ModalSearchChannels'
import ModalAddTagAlarm from '../../../Ultils/Modal/Alarm/ModalAddTagAlarm';
import Loading from '../../../Ultils/Loading/Loading';
import ModalDelete from '../../../Ultils/Modal/Delete/ModalDelete';
// import { socket } from '../../../Ultils/Socket/Socket';
import CustomDataGrid from '../../../ImportComponents/CustomDataGrid'

const ListAlarm = () => {
    const [action, setAction] = useState();
    const [actionAlarm, setactionAlarm] = useState();
    const [openModalAddAlarm, setopenModalAddAlarm] = useState(false);
    const [openModalSearchTag, setopenModalSearchTag] = useState(false);
    const [dataModalAlarm, setDataModalAlarm] = useState([]);

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listAlarm, setlistAlarm] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchTagAlarm();
        // fetchHistorical();
        // fetchConfig();
    }, []);

    const fetchTagAlarm = async () => {
        setLoading(true);
        let response = await fetchAllTagAlarm();
        //console.log('check fetchAllTagAlarm: ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                tagnameId: item.id,
                name: item.name,
                deviceId: item.deviceId,
                deviceName: item.deviceName,
                condition: item.condition,
                content: item.content,
                rangeAlarm: item.rangeAlarm,
                selection: item.selection,
            }));
            setlistAlarm(rowsWithId);
        }
        setLoading(false);
        setSelectedCount(0);
    };

    // mở/đóng Modal Add
    const handleopenModalAddAlarm = () => {
        setAction('CREATE')
        setopenModalAddAlarm(true);
    }

    const handleEditAlarm = (tagAlarm) => {
        console.log('Check alarm update: ', tagAlarm)
        // setSelectionChannel([listAlarm.id]);
        setAction('UPDATE')
        setopenModalAddAlarm(true);
        setDataModalAlarm(tagAlarm);
    };

    const handleCloseModalAddAlarm = () => {
        setopenModalAddAlarm(false);
        fetchTagAlarm();
    }
    const handleCloseModalSearchTag = () => { setopenModalSearchTag(false); }
    const handleCloseModalDelete = () => { setIsShowModalDelete(false); }

    const handleDeleteTagAlarm = (rawData) => {
        console.log('check id delete alarm: ', rawData);
        let dataToDelete = [];
        if (rawData) {
            dataToDelete = [{ id: rawData.id, tagnameId: rawData.tagnameId }];
            setSelectedCount(1);
        } else {
            dataToDelete = listAlarm
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({
                    id: item.id,
                    tagnameId: item.tagnameId
                }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setIsShowModalDelete(true);
        setactionAlarm('ALARM');
    };


    const conformDeleteAlarm = async () => {
        // Gửi xuống cả id và tagnameId
        let res = await deleteTagAlarm({ list: dataModalDelete });
        let serverData = res;

        if (+serverData.EC === 0) {
            toast.success(serverData.EM);
            setIsShowModalDelete(false);
            await fetchTagAlarm();
        } else {
            toast.error(serverData.EM);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, width: 200, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, width: 150, align: 'center', headerAlign: 'center' },
        { field: 'condition', headerName: 'Condition', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        { field: 'rangeAlarm', headerName: 'Range', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        {
            field: 'selection',
            headerName: 'Notify',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const selection = params.row.selection || {};
                const notifyList = [
                    { name: "Line", color: "success" },
                    { name: "Telegram", color: "primary" },
                ];
                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                        {notifyList.map(({ name, color }) => (
                            <Box
                                key={name}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{name}</Typography>
                                <Checkbox
                                    color={color}
                                    checked={!!selection[name]} // true → tích, false/undefined → trống
                                // disabled
                                />
                            </Box>
                        ))}
                    </Box>
                );
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <>
                    <IconButton
                        sx={{ mr: 2 }}
                        color="primary"
                        title="Chỉnh sửa"
                        onClick={(e) => { e.stopPropagation(); handleEditAlarm(params.row); }}
                    >
                        <BorderColorIcon />
                    </IconButton>

                    <IconButton
                        color="error"
                        title="Xóa"
                        onClick={(e) => { e.stopPropagation(); handleDeleteTagAlarm(params.row); }}
                    >
                        <DeleteForeverIcon />
                    </IconButton>
                </>
            ),
        }
    ];

    return (
        <div>
            <Button
                variant="contained"
                color="success"
                startIcon={<AddCardIcon />}
                onClick={handleopenModalAddAlarm}
                sx={{ mb: 1.5, textTransform: 'none' }}
            >
                Thêm Tag
            </Button>

            {selectedCount > 0 && (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={(e) => { e.stopPropagation(); handleDeleteTagAlarm(); }}
                    sx={{ mb: 1.5, mx: 1.5, textTransform: 'none' }}
                >
                    Xóa Tag
                </Button>
            )}

            <Paper sx={{ height: 400, width: '100%' }}>
                <CustomDataGrid
                    rows={listAlarm}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    pagination
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                        setSelectedCount(newSelection.length);
                    }}

                    loading={loading}
                />

                {loading && <Loading text="Đang tải dữ liệu..." />}
            </Paper>

            {/* Modal thêm mới */}
            <ModalAddTagAlarm
                action={action}
                setactionAlarm={setactionAlarm}
                openModalAddAlarm={openModalAddAlarm}
                handleCloseModalAddAlarm={handleCloseModalAddAlarm}
                setopenModalSearchTag={setopenModalSearchTag}
                dataModalAlarm={dataModalAlarm}
            //dataConfig={dataConfig}
            />

            <ModalSearchChannels
                actionAlarm={actionAlarm}
                openModalSearchTag={openModalSearchTag}
                handleCloseModalAdd={handleCloseModalSearchTag}
                setDataModalAlarm={setDataModalAlarm}
            />

            {/* Modal xác nhận xóa */}
            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                dataModalDelete={dataModalDelete}
                conformDeleteAlarm={conformDeleteAlarm}
                selectedCount={selectedCount}
                action={actionAlarm}
            />
        </div>
    );
}

export default ListAlarm;

import {
    useState, useEffect, useMemo,
    Paper, Button, IconButton,
    AddCardIcon, DeleteForeverIcon, SettingsApplicationsIcon, toast
} from '../../../ImportComponents/Imports';
import { fetchAllHistorical, deleteHistorical, fetchConfigHistorical, fetchAllChannels } from "../../../../Services/APIDevice";
import ModalConfigHistorical from "../../../Ultils/Modal/Historical/ModalConfigHistorical";
import ModalEditConfig from "../../../Ultils/Modal/Historical/ModalEditConfig";
import ModalSearchChannels from '../../../Ultils/Modal/Search/ModalSearchChannels'
import ModalTagHistorical from '../../../Ultils/Modal/Historical/ModalTagHistorical'
import Loading from '../../../Ultils/Loading/Loading';
import ModalDelete from '../../../Ultils/Modal/Delete/ModalDelete';
import { socket } from '../../../Ultils/Socket/Socket';
import CustomDataGrid from '../../../ImportComponents/CustomDataGrid'

const ListHistorical = () => {
    const [openModalAdd, setOpenModalAdd] = useState(false);
    const [isShowModalEdit, setIsShowModalEdit] = useState(false);
    const [openModalConfig, setOpenModalConfig] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [dataModalEditConfig, setDataModalEditConfig] = useState({});
    const [dataModalEditTag, setDataModalEditTag] = useState([]);
    const [dataConfig, setDataConfig] = useState([]);
    const [reloadConfig, setReloadConfig] = useState(false);

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);
    const [actionDeleteChannel, setactionDeleteHistorical] = useState([]);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listChannel, setListChannel] = useState([]);
    const [listHistorical, setListHistorical] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    const [dataListHistorical, setDataListHistorical] = useState([]);

    useEffect(() => {
        fetchChannel();
        fetchHistorical();
        fetchConfig();
    }, []);

    const fetchChannel = async () => {
        setLoading(true);
        let response = await fetchAllChannels();
        console.log('check fetchAllChannels: ', response)
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
            setListChannel(rowsWithId);
        }
        setLoading(false);
    };

    const fetchHistorical = async () => {
        let response = await fetchAllHistorical();
        setLoading(false);
        //console.log('check listHistorical: ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rows = response.DT.DT.map((item) => ({
                id: item._id,
                tagnameId: item.id,
                channel: item.channel,
                name: item.name,
                type: item.type
            }));
            setListHistorical(rows);
        }
        setSelectedCount(0);
    };

    const fetchConfig = async () => {
        let response = await fetchConfigHistorical();
        setLoading(false);
        //console.log('check listHistorical: ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rows = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
                type: item.type,
                cycle: item.cycle,
            }));
            setDataConfig(rows);
        }
    };

    // mở/đóng Modal Add
    const handleOpenModalAdd = () => {
        setOpenModalAdd(true);
    }
    const handleCloseModalAdd = () => { setOpenModalAdd(false); fetchHistorical(); }

    // mở/đóng Modal Edit
    const handleShowModalEditTag = (row) => {
        //console.log('check data row:', row)
        setDataModalEditTag(row)
        setIsShowModalEdit(true);
    }
    const handleCloseModalEditTag = () => { setIsShowModalEdit(false); fetchHistorical(); }

    // mở/đóng Modal Config
    const handleOpenModalConfig = () => { setOpenModalConfig(true); }
    const handleCloseModalConfig = () => { setOpenModalConfig(false); }

    // mở/đóng Modal Edit
    const handleOpenModalEditConfig = (rowData) => {
        setDataModalEditConfig(rowData);
        setOpenModalEdit(true);
    };

    const handleCloseModalEditConfig = () => {
        setOpenModalEdit(false);
        setReloadConfig(prev => !prev);
    }
    const handleCloseModalDelete = () => { setIsShowModalDelete(false); }
    const handleDeleteHistorical = (historical) => {
        console.log('check id delete historical: ', historical);
        let dataToDelete = [];
        if (historical) {
            dataToDelete = [{ id: historical.id, tagnameId: historical.tagnameId }];
            setSelectedCount(1);
        } else {
            dataToDelete = _listHistorical
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({
                    id: item.id,
                    tagnameId: item.tagnameId
                }));
            setSelectedCount(dataToDelete.length);
        }

        setDataModalDelete(dataToDelete);
        setIsShowModalDelete(true);
        setactionDeleteHistorical('HISTORICAL');
    };

    const conformDeleteHistorical = async () => {
        // Gửi xuống cả id và tagnameId
        let res = await deleteHistorical({ list: dataModalDelete });
        let serverData = res;

        if (+serverData.EC === 0) {
            socket.emit("CHANGE HISTORICAL TYPE");
            toast.success(serverData.EM);
            setIsShowModalDelete(false);
            await fetchHistorical();
        } else {
            toast.error(serverData.EM);
        }
    };


    const _listHistorical = useMemo(() => {
        return listHistorical.map(his => {
            // Tìm thông tin channel có cùng tên Tag
            const channelInfo = listChannel.find(ch => ch.name === his.name);
            return {
                ...his,
                channel: channelInfo?.channel || '',
                deviceName: channelInfo?.deviceName || '',
                symbol: channelInfo?.symbol || '',
                unit: channelInfo?.unit || '',
            };
        });
    }, [listHistorical, listChannel]);

    const columns = [
        { field: 'channel', headerName: 'Channel', flex: 1, width: 80, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, width: 200, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, width: 150, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Unit', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        { field: 'type', headerName: 'Group', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <>
                    {/* <IconButton
                        sx={{ mr: 2 }}
                        color="primary"
                        title="Chỉnh sửa"
                        onClick={(e) => { e.stopPropagation(); handleShowModalEditTag(params.row); }}
                    >
                        <BorderColorIcon />
                    </IconButton> */}
                    <IconButton
                        color="error"
                        title="Xóa"
                        onClick={(e) => { e.stopPropagation(); handleDeleteHistorical(params.row); }}
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
                onClick={handleOpenModalAdd}
                sx={{ mb: 1.5, textTransform: 'none' }}
            >
                Thêm Tag
            </Button>

            <Button
                variant="contained"
                color="success"
                startIcon={<SettingsApplicationsIcon />}
                onClick={handleOpenModalConfig}
                sx={{ mb: 1.5, ml: 1.5, textTransform: 'none' }}
            >
                Cấu hình
            </Button>

            {selectedCount > 0 && (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={(e) => { e.stopPropagation(); handleDeleteHistorical(); }}
                    sx={{ mb: 1.5, mx: 1.5, textTransform: 'none' }}
                >
                    Xóa Tag
                </Button>
            )}

            <Paper sx={{ height: 400, width: '100%' }}>
                <CustomDataGrid
                    rows={_listHistorical}
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
            <ModalSearchChannels
                openModalAdd={openModalAdd}
                handleCloseModalAdd={handleCloseModalAdd}
                dataConfig={dataConfig}
            />

            {/* Modal chỉnh sửa Tag */}
            <ModalTagHistorical
                handleCloseModalEditTag={handleCloseModalEditTag}
                isShowModalEdit={isShowModalEdit}
                dataModalEditTag={dataModalEditTag}
                dataConfig={dataConfig}
            />

            {/* Modal cấu hình */}
            <ModalConfigHistorical
                openModalConfig={openModalConfig}
                handleCloseModalConfig={handleCloseModalConfig}
                handleOpenModalEditConfig={handleOpenModalEditConfig}
                reloadConfig={reloadConfig}
            />

            {/* Modal chỉnh sửa cấu hình */}
            <ModalEditConfig
                isShowModalEditConfig={openModalEdit}
                handleCloseModalEditConfig={handleCloseModalEditConfig}
                dataModalEditConfig={dataModalEditConfig}
            />

            {/* Modal xác nhận xóa */}
            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
                action={actionDeleteChannel}
                conformDeleteHistorical={conformDeleteHistorical}
            />
        </div>
    );
}

export default ListHistorical;

// src/js/HomeLayout/HomeLayout.js
import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import CustomDataGrid from '../ImportComponents/CustomDataGrid';
import { socket } from '../Ultils/Socket/Socket';
import { fetchAllDevices, fetchAllChannels } from '../../Services/APIDevice';
import Loading from '../Ultils/Loading/Loading';

const HomeLayout = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

    // map deviceId -> deviceName
    const [deviceMap, setDeviceMap] = useState({});
    // map tagName -> unit
    const [unitMap, setUnitMap] = useState({});

    // fetch device list & channel list (để lấy unit)
    useEffect(() => {
        const init = async () => {
            try {
                const devRes = await fetchAllDevices();
                if (devRes?.EC === 0 && Array.isArray(devRes?.DT?.DT)) {
                    const dmap = {};
                    devRes.DT.DT.forEach((d) => {
                        dmap[d._id] = d.name;
                    });
                    setDeviceMap(dmap);
                }

                const chRes = await fetchAllChannels();
                if (chRes?.EC === 0 && Array.isArray(chRes?.DT?.DT)) {
                    const umap = {};
                    chRes.DT.DT.forEach((c) => {
                        if (c?.name) umap[c.name] = c?.unit || '';
                    });
                    setUnitMap(umap);
                }
            } catch (e) {
                // bỏ qua lỗi để không chặn socket
            }
        };
        init();
    }, []);

    // socket realtime
    useEffect(() => {
        socket.connect();

        const onHomeData = (data) => {
            // map theo yêu cầu: ID 1..n, Name, Device, Symbol, Value, Unit, Status
            const mapped = (Array.isArray(data) ? data : []).map((item, idx) => {
                let statusText = 'Sample';
                if (item.status === 1) statusText = 'Normal';
                else if (item.status === 2) statusText = 'Over range';
                else if (item.status === 3) statusText = 'Disconnect';

                return {
                    // ID tăng dần 1..n
                    id: idx + 1,
                    name: item.tagname,
                    deviceName: deviceMap[item.deviceId] || item.deviceId || '',
                    symbol: item.symbol,
                    value: item.value,
                    unit: unitMap[item.tagname] || '',
                    status: statusText,
                };
            });

            setRows(mapped);
            setLoading(false);
            // log ra console như yêu cầu
            // eslint-disable-next-line no-console
            console.log('[Dashboard realtime]', mapped);
        };

        socket.on('SERVER SEND HOME DATA', onHomeData);

        return () => {
            socket.off('SERVER SEND HOME DATA', onHomeData);
            socket.disconnect();
        };
    }, [deviceMap, unitMap]);

    // render Status chip
    const renderStatus = (params) => {
        const val = params.value || 'Unknown';
        let color = 'default';
        let icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;

        if (val === 'Normal') {
            color = 'success';
            icon = <CheckCircleIcon sx={{ fontSize: 18 }} />;
        } else if (val === 'Over range') {
            color = 'warning';
            icon = <WarningAmberIcon sx={{ fontSize: 18 }} />;
        } else if (val === 'Disconnect') {
            color = 'error';
            icon = <ErrorIcon sx={{ fontSize: 18 }} />;
        } else if (val === 'Sample') {
            color = 'secondary';
            icon = <SensorsOffIcon sx={{ fontSize: 18 }} />;
        }

        return (
            <Chip
                icon={icon}
                label={val}
                color={color}
                variant="filled"
                sx={{
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    minWidth: 120,
                    justifyContent: 'center',
                    pl: 1,
                    '& .MuiChip-icon': { ml: 0.3 },
                }}
            />
        );
    };

    // cột theo thứ tự: ID, Name, Device, Symbol, Value, Unit, Status
    const columns = useMemo(
        () => [
            { field: 'id', headerName: 'ID', width: 84, headerAlign: 'center', align: 'center' },
            { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 160, headerAlign: 'center', align: 'center' },
            { field: 'deviceName', headerName: 'Device', flex: 1.0, minWidth: 150, headerAlign: 'center', align: 'center' },
            { field: 'symbol', headerName: 'Symbol', flex: 0.9, minWidth: 120, headerAlign: 'center', align: 'center' },
            { field: 'value', headerName: 'Value', width: 120, headerAlign: 'center', align: 'center' },
            { field: 'unit', headerName: 'Unit', width: 110, headerAlign: 'center', align: 'center' },
            { field: 'status', headerName: 'Status', flex: 0.5, minWidth: 160, headerAlign: 'center', align: 'center', renderCell: renderStatus },
        ],
        []
    );

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            {/* Tiêu đề */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.primary' }}>
                    DASHBOARD
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Welcome to your dashboard
                </Typography>
            </Box>

            {/* Bảng realtime */}
            <Paper sx={{ p: 2 }}>
                <CustomDataGrid
                    rows={rows}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    pagination
                    hideFooterSelectedRowCount
                    loading={loading}
                />
                {loading && <Loading text="Đang tải dữ liệu realtime..." />}
            </Paper>
        </Box>
    );
};

export default HomeLayout;

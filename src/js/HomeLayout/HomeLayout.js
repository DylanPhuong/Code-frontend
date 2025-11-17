import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Grid,
    IconButton,
} from '@mui/material';

import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import CustomDataGrid from '../ImportComponents/CustomDataGrid';
import { socket } from '../Ultils/Socket/Socket';
import { fetchAllDevices, fetchAllChannels } from '../../Services/APIDevice';
import Loading from '../Ultils/Loading/Loading';

/* ===== Mini Gauge (SVG 2 nửa vòng xanh) ===== */
const GaugeMini = ({ value, unit, channel, name }) => {
    const S = 120;                 // canvas size
    const cx = 60, cy = 60, r = 52;

    // helper tạo path cung tròn
    const arc = (startDeg, endDeg) => {
        const toRad = (d) => (Math.PI / 180) * d;
        const sx = cx + r * Math.cos(toRad(startDeg));
        const sy = cy + r * Math.sin(toRad(startDeg));
        const ex = cx + r * Math.cos(toRad(endDeg));
        const ey = cy + r * Math.sin(toRad(endDeg));
        const large = endDeg - startDeg <= 180 ? 0 : 1;
        return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            {/* header nhỏ: channel */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip label={`CH ${channel ?? '-'}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                <Box sx={{ width: 24 }} /> {/* chừa chỗ cho cân đối */}
            </Box>

            {/* Vòng gauge */}
            <Box sx={{ display: 'grid', placeItems: 'center', mt: 0.5 }}>
                <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
                    {/* vòng nền */}
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />

                    {/* 2 cung xanh (trên & dưới) */}
                    <path d={arc(30, 150)} stroke="#31bb31ff" strokeWidth="10" fill="none" strokeLinecap="round" />
                    <path d={arc(210, 330)} stroke="#31bb31ff" strokeWidth="10" fill="none" strokeLinecap="round" />

                    {/* Giá trị trung tâm */}
                    <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
                        style={{ fontSize: 28, fontWeight: 700, fill: 'currentColor' }}>
                        {value ?? '--'}
                    </text>
                    {/* đơn vị */}
                    <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle"
                        style={{ fontSize: 12, fill: 'rgba(0,0,0,0.54)' }}>
                        {unit || ''}
                    </text>
                </svg>
            </Box>

            {/* tên tag */}
            <Typography variant="subtitle2" sx={{ mt: 'auto', textAlign: 'center', fontWeight: 600, color: 'text.secondary' }}>
                {name || ''}
            </Typography>
        </Paper>
    );
};

const HomeLayout = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

    // map deviceId -> deviceName
    const [deviceMap, setDeviceMap] = useState({});
    // map tagName -> unit
    const [unitMap, setUnitMap] = useState({});

    // ==== Chỉ 1 nút toggle: table <-> grid ====
    const [isGrid, setIsGrid] = useState(true); // mặc định mở Grid đẹp
    const toggleView = () => setIsGrid((v) => !v);

    // fetch device & channel để lấy deviceName + unit
    useEffect(() => {
        const init = async () => {
            try {
                const devRes = await fetchAllDevices();
                if (devRes?.EC === 0 && Array.isArray(devRes?.DT?.DT)) {
                    const dmap = {};
                    devRes.DT.DT.forEach((d) => (dmap[d._id] = d.name));
                    setDeviceMap(dmap);
                }
                const chRes = await fetchAllChannels();
                if (chRes?.EC === 0 && Array.isArray(chRes?.DT?.DT)) {
                    const umap = {};
                    chRes.DT.DT.forEach((c) => { if (c?.name) umap[c.name] = c?.unit || ''; });
                    setUnitMap(umap);
                }
            } catch { }
        };
        init();
    }, []);

    // socket realtime
    useEffect(() => {
        socket.connect();

        const onHomeData = (data) => {
            const mapped = (Array.isArray(data) ? data : []).map((item, idx) => {
                let statusText = 'Sample';
                if (item.status === 1) statusText = 'Normal';
                else if (item.status === 2) statusText = 'Over range';
                else if (item.status === 3) statusText = 'Disconnect';

                return {
                    id: idx + 1,
                    name: item.tagname,
                    deviceName: deviceMap[item.deviceId] || item.deviceId || '',
                    symbol: item.symbol,
                    value: item.value,
                    unit: unitMap[item.tagname] || '',
                    status: statusText,
                    channel: item.channel,
                };
            });

            setRows(mapped);
            setLoading(false);
            console.log('[Dashboard realtime]', mapped);
        };

        socket.on('SERVER SEND HOME DATA', onHomeData);
        return () => {
            socket.off('SERVER SEND HOME DATA', onHomeData);
            socket.disconnect();
        };
    }, [deviceMap, unitMap]);

    // render chip trạng thái
    const renderStatus = (params) => {
        const val = params.value || 'Unknown';
        let color = 'default';
        let icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;
        if (val === 'Normal') { color = 'success'; icon = <CheckCircleIcon sx={{ fontSize: 18 }} />; }
        else if (val === 'Over range') { color = 'warning'; icon = <WarningAmberIcon sx={{ fontSize: 18 }} />; }
        else if (val === 'Disconnect') { color = 'error'; icon = <ErrorIcon sx={{ fontSize: 18 }} />; }
        else if (val === 'Sample') { color = 'secondary'; icon = <SensorsOffIcon sx={{ fontSize: 18 }} />; }

        return (
            <Chip
                icon={icon}
                label={val}
                color={color}
                variant="filled"
                sx={{ fontWeight: 600, minWidth: 120, justifyContent: 'center', pl: 1, '& .MuiChip-icon': { ml: .3 } }}
            />
        );
    };

    // cột table: ID, Name, Device, Symbol, Value, Unit, Status
    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 84, headerAlign: 'center', align: 'center' },
        { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 160, headerAlign: 'center', align: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1.0, minWidth: 150, headerAlign: 'center', align: 'center' },
        { field: 'symbol', headerName: 'Symbol', flex: .9, minWidth: 120, headerAlign: 'center', align: 'center' },
        { field: 'value', headerName: 'Value', width: 120, headerAlign: 'center', align: 'center' },
        { field: 'unit', headerName: 'Unit', width: 110, headerAlign: 'center', align: 'center' },
        { field: 'status', headerName: 'Status', flex: .6, minWidth: 170, headerAlign: 'center', align: 'center', renderCell: renderStatus },
    ], []);

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            {/* Header + 1 nút toggle duy nhất */}
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.primary' }}>
                        DASHBOARD
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Welcome to your dashboard
                    </Typography>
                </Box>

                <IconButton onClick={toggleView} color="primary" title={isGrid ? 'Chuyển sang bảng' : 'Chuyển sang lưới'}>
                    {isGrid ? <TableRowsIcon /> : <ViewModuleIcon />}
                </IconButton>
            </Box>

            {/* Nội dung: Grid Gauge hoặc Table */}
            {isGrid ? (
                <Box>
                    <Grid container spacing={2}>
                        {rows.map((r) => (
                            <Grid item key={r.id} xs={12} sm={6} md={4} lg={3}>
                                <GaugeMini
                                    channel={r.channel}
                                    name={r.name}
                                    value={r.value}
                                    unit={r.unit}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {loading && (
                        <Paper sx={{ p: 2, mt: 2 }}>
                            <Loading text="Đang tải dữ liệu realtime..." />
                        </Paper>
                    )}
                </Box>
            ) : (
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
            )}
        </Box>
    );
};

export default HomeLayout;

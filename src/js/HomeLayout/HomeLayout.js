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
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import CustomDataGrid from '../ImportComponents/CustomDataGrid';
import { socket } from '../Ultils/Socket/Socket';
import { fetchAllDevices, fetchAllChannels } from '../../Services/APIDevice';
import Loading from '../Ultils/Loading/Loading';

/* ===================== Mini Gauge (SVG) ===================== */
const GaugeMini = ({ value, unit, channel, name, status }) => {
    // Kích thước vòng
    const S = 120;            // kích thước canvas
    const cx = 60, cy = 60;   // tâm
    const r = 52;            // bán kính

    // Nền thẻ theo trạng thái
    const isNormal = status === 'Normal';
    const paperBg = isNormal ? 'rgba(85, 170, 70, 1)' : 'rgba(230, 48, 48, 0.92)'; // nền đậm xanh/đỏ
    const paperBorder = isNormal ? 'rgba(46,125,50,1)' : 'rgba(211,47,47,1)';

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                p: 2,
                border: '1px solid',
                borderColor: paperBorder,
                bgcolor: paperBg,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            {/* header nhỏ: channel */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                    label={`CH ${channel ?? '-'}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, color: '#fff', borderColor: 'rgba(255,255,255,.6)' }}
                />
                <Box sx={{ width: 24 }} />
            </Box>

            {/* Gauge: 1 vòng tròn trắng, text đen */}
            <Box sx={{ display: 'grid', placeItems: 'center', mt: 0.5 }}>
                <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
                    {/* Vòng tròn trắng (fill trắng hoàn toàn) */}
                    <circle cx={cx} cy={cy} r={r} fill="#fff" />

                    {/* Giá trị */}
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={{ fontSize: 28, fontWeight: 800, fill: '#000' }}
                    >
                        {value ?? '--'}
                    </text>

                    {/* Đơn vị */}
                    <text
                        x="50%"
                        y="66%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={{ fontSize: 12, fill: '#000' }}
                    >
                        {unit || ''}
                    </text>
                </svg>
            </Box>

            {/* Tên tag */}
            <Typography
                variant="subtitle2"
                sx={{ mt: 'auto', textAlign: 'center', fontWeight: 700, color: '#fff' }}
            >
                {name || ''}
            </Typography>
        </Paper>
    );
};

/* ===================== Main Component ===================== */
const PAGE_SIZE_GRID = 12; // 4x3

const HomeLayout = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // DataGrid pagination model
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

    // map deviceId -> deviceName
    const [deviceMap, setDeviceMap] = useState({});
    // map tagName -> unit
    const [unitMap, setUnitMap] = useState({});

    // Toggle: grid <-> table
    const [isGrid, setIsGrid] = useState(true);
    const toggleView = () => setIsGrid((v) => !v);

    // Grid pagination (4x3)
    const [gridPage, setGridPage] = useState(0);
    const startIdx = gridPage * PAGE_SIZE_GRID;
    const endIdx = Math.min(startIdx + PAGE_SIZE_GRID, rows.length);
    const pageRows = rows.slice(startIdx, endIdx);
    const canPrev = gridPage > 0;
    const canNext = endIdx < rows.length;
    const handlePrev = () => canPrev && setGridPage((p) => p - 1);
    const handleNext = () => canNext && setGridPage((p) => p + 1);

    useEffect(() => {
        if (gridPage > 0 && startIdx >= rows.length) setGridPage(0);
    }, [rows.length, gridPage, startIdx]);

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
            } catch { /* ignore */ }
        };
        init();
    }, []);

    // socket realtime
    useEffect(() => {
        socket.connect();

        const onHomeData = (data) => {
            const mapped = (Array.isArray(data) ? data : []).map((item) => {
                let statusText = 'Sample';
                if (item.status === 1) statusText = 'Normal';
                else if (item.status === 2) statusText = 'Over range';
                else if (item.status === 3) statusText = 'Disconnect';

                return {
                    // id sẽ set lại sau khi sort
                    name: item.tagname,
                    deviceName: deviceMap[item.deviceId] || item.deviceId || '',
                    symbol: item.symbol,
                    value: item.value,
                    unit: unitMap[item.tagname] || '',
                    status: statusText,
                    channel: Number(item.channel ?? 0),
                };
            });

            // Sắp xếp theo Channel tăng dần rồi gán lại id 1..n
            const sorted = mapped
                .sort((a, b) => a.channel - b.channel)
                .map((it, idx) => ({ ...it, id: idx + 1 }));

            setRows(sorted);
            setLoading(false);
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

    // 8 cột (chia đều)
    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110 },
        { field: 'channel', headerName: 'Channel', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110, sortComparator: (v1, v2) => Number(v1) - Number(v2) },
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
        { field: 'deviceName', headerName: 'Device', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
        { field: 'symbol', headerName: 'Symbol', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
        { field: 'value', headerName: 'Value', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
        { field: 'unit', headerName: 'Unit', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110 },
        { field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center', minWidth: 160, renderCell: renderStatus },
    ], []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Box sx={{ p: 0.5, bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            {/* Header + toggle */}
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

            {/* Content */}
            {isGrid ? (
                <Box>
                    <Grid
                        container
                        spacing={2}
                        justifyContent="center"         // canh giữa các item
                    >
                        {pageRows.map((r) => (
                            <Grid item key={r.id} xs={12} sm={6} md={4} lg={3}>
                                <GaugeMini
                                    channel={r.channel}
                                    name={r.name}
                                    value={r.value}
                                    unit={r.unit}
                                    status={r.status}
                                />
                            </Grid>
                        ))}
                        {/* Nếu trang hiện có < PAGE_SIZE_GRID item thì không cần padding ô trống nữa
                vì justifyContent="center" đã canh giữa hàng cuối. */}
                    </Grid>

                    {/* Điều khiển trang của Grid */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 2 }}>
                        <Typography variant="body2" sx={{ mr: 0.5 }}>
                            {rows.length === 0 ? '0 – 0 / 0' : `${startIdx + 1} – ${endIdx} / ${rows.length}`}
                        </Typography>
                        <IconButton size="small" onClick={handlePrev} disabled={!canPrev}>
                            <NavigateBeforeIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleNext} disabled={!canNext}>
                            <NavigateNextIcon />
                        </IconButton>
                    </Box>

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
                        initialState={{
                            sorting: { sortModel: [{ field: 'channel', sort: 'asc' }] },
                        }}
                    />
                    {loading && <Loading text="Đang tải dữ liệu realtime..." />}
                </Paper>
            )}
        </Box>
    );
};

export default HomeLayout;

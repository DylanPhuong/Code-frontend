// import { useEffect, useMemo, useState } from 'react';
// import {
//     Box,
//     Typography,
//     Paper,
//     Chip,
//     Grid,
//     IconButton,
// } from '@mui/material';

// import ViewModuleIcon from '@mui/icons-material/ViewModule';
// import TableRowsIcon from '@mui/icons-material/TableRows';
// import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
// import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import ErrorIcon from '@mui/icons-material/Error';
// import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import SensorsOffIcon from '@mui/icons-material/SensorsOff';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// import CustomDataGrid from '../ImportComponents/CustomDataGrid';
// import { socket } from '../Ultils/Socket/Socket';
// import { fetchAllDevices, fetchAllChannels } from '../../Services/APIDevice';
// import Loading from '../Ultils/Loading/Loading';

// /* =============== Mini Gauge (SVG) =============== */
// const GaugeMini = ({ value, unit, channel, name, status }) => {
//     // Canvas & circle
//     const S = 120;
//     const cx = 60, cy = 60, r = 60;

//     const isNormal = status === 'Normal';
//     const cardBg = isNormal ? 'rgba(78, 183, 83, 1)' : 'rgba(211,47,47,.95)';
//     const cardBorder = isNormal ? 'rgba(46,125,50,1)' : 'rgba(211,47,47,1)';

//     return (
//         <Paper
//             elevation={0}
//             sx={{
//                 borderRadius: 3,
//                 p: 2,
//                 border: '1px solid',
//                 borderColor: cardBorder,
//                 bgcolor: cardBg,
//                 height: '100%',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: 1,
//             }}
//         >
//             {/* Channel pill */}
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Chip
//                     label={`CH ${channel ?? '-'}`}
//                     size="small"
//                     variant="outlined"
//                     sx={{ fontWeight: 700, color: '#fff', borderColor: 'rgba(255,255,255,.55)' }}
//                 />
//                 <Box sx={{ width: 24 }} />
//             </Box>

//             {/* 1 vòng tròn trắng – chữ đen */}
//             <Box sx={{ display: 'grid', placeItems: 'center', mt: 0.5 }}>
//                 <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
//                     <circle cx={cx} cy={cy} r={r} fill="#fff" />
//                     <text
//                         x="50%" y="50%"
//                         dominantBaseline="middle" textAnchor="middle"
//                         style={{ fontSize: 28, fontWeight: 800, fill: '#000' }}
//                     >
//                         {value ?? '--'}
//                     </text>
//                     <text
//                         x="50%" y="66%"
//                         dominantBaseline="middle" textAnchor="middle"
//                         style={{ fontSize: 12, fill: '#000' }}
//                     >
//                         {unit || ''}
//                     </text>
//                 </svg>
//             </Box>

//             {/* Name */}
//             <Typography
//                 variant="subtitle2"
//                 sx={{ mt: 'auto', textAlign: 'center', fontWeight: 700, color: '#fff' }}
//             >
//                 {name || ''}
//             </Typography>
//         </Paper>
//     );
// };

// /* =============== Main =============== */
// const PAGE_SIZE_GRID = 12; // 4 x 3

// export default function HomeLayout() {
//     const [rows, setRows] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // DataGrid pagination
//     const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

//     // maps
//     const [deviceMap, setDeviceMap] = useState({});
//     const [unitMap, setUnitMap] = useState({});

//     // view toggle
//     const [isGrid, setIsGrid] = useState(true);
//     const toggleView = () => setIsGrid((v) => !v);

//     // Grid pagination
//     const [gridPage, setGridPage] = useState(0);
//     const startIdx = gridPage * PAGE_SIZE_GRID;
//     const endIdx = Math.min(startIdx + PAGE_SIZE_GRID, rows.length);
//     const pageRows = rows.slice(startIdx, endIdx);
//     const canPrev = gridPage > 0;
//     const canNext = endIdx < rows.length;
//     const handlePrev = () => canPrev && setGridPage((p) => p - 1);
//     const handleNext = () => canNext && setGridPage((p) => p + 1);

//     useEffect(() => {
//         if (gridPage > 0 && startIdx >= rows.length) setGridPage(0);
//     }, [rows.length, gridPage, startIdx]);

//     // Fetch device & channel meta
//     useEffect(() => {
//         const init = async () => {
//             try {
//                 const devRes = await fetchAllDevices();
//                 if (devRes?.EC === 0 && Array.isArray(devRes?.DT?.DT)) {
//                     const dmap = {};
//                     devRes.DT.DT.forEach((d) => (dmap[d._id] = d.name));
//                     setDeviceMap(dmap);
//                 }
//                 const chRes = await fetchAllChannels();
//                 if (chRes?.EC === 0 && Array.isArray(chRes?.DT?.DT)) {
//                     const umap = {};
//                     chRes.DT.DT.forEach((c) => { if (c?.name) umap[c.name] = c?.unit || ''; });
//                     setUnitMap(umap);
//                 }
//             } catch {
//                 // ignore
//             }
//         };
//         init();
//     }, []);

//     // Socket realtime
//     useEffect(() => {
//         socket.connect();

//         const onHomeData = (data) => {
//             const mapped = (Array.isArray(data) ? data : []).map((item) => {
//                 let statusText = 'Sample';
//                 if (item.status === 1) statusText = 'Normal';
//                 else if (item.status === 2) statusText = 'Over range';
//                 else if (item.status === 3) statusText = 'Disconnect';

//                 return {
//                     name: item.tagname,
//                     deviceName: deviceMap[item.deviceId] || item.deviceId || '',
//                     symbol: item.symbol,
//                     value: item.value,
//                     unit: unitMap[item.tagname] || '',
//                     status: statusText,
//                     channel: Number(item.channel ?? 0),
//                 };
//             });

//             const sorted = mapped
//                 .sort((a, b) => a.channel - b.channel)
//                 .map((it, idx) => ({ ...it, id: idx + 1 }));

//             setRows(sorted);
//             setLoading(false);
//         };

//         socket.on('SERVER SEND HOME DATA', onHomeData);
//         return () => {
//             socket.off('SERVER SEND HOME DATA', onHomeData);
//             socket.disconnect();
//         };
//     }, [deviceMap, unitMap]);

//     // Status chip
//     const renderStatus = (params) => {
//         const val = params.value || 'Unknown';
//         let color = 'default';
//         let icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;
//         if (val === 'Normal') { color = 'success'; icon = <CheckCircleIcon sx={{ fontSize: 18 }} />; }
//         else if (val === 'Over range') { color = 'warning'; icon = <WarningAmberIcon sx={{ fontSize: 18 }} />; }
//         else if (val === 'Disconnect') { color = 'error'; icon = <ErrorIcon sx={{ fontSize: 18 }} />; }
//         else if (val === 'Sample') { color = 'secondary'; icon = <SensorsOffIcon sx={{ fontSize: 18 }} />; }

//         return (
//             <Chip
//                 icon={icon}
//                 label={val}
//                 color={color}
//                 variant="filled"
//                 sx={{ fontWeight: 600, minWidth: 120, justifyContent: 'center', pl: 1, '& .MuiChip-icon': { ml: .3 } }}
//             />
//         );
//     };

//     // Table columns
//     const columns = useMemo(() => [
//         { field: 'id', headerName: 'ID', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110 },
//         { field: 'channel', headerName: 'Channel', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110, sortComparator: (v1, v2) => Number(v1) - Number(v2) },
//         { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
//         { field: 'deviceName', headerName: 'Device', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
//         { field: 'symbol', headerName: 'Symbol', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
//         { field: 'value', headerName: 'Value', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
//         { field: 'unit', headerName: 'Unit', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110 },
//         { field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center', minWidth: 160, renderCell: renderStatus },
//     ], []); // eslint-disable-line

//     return (
//         <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}>
//             {/* Header + Toggle */}
//             <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <Box>
//                     <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
//                         DASHBOARD
//                     </Typography>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
//                         Welcome to your dashboard
//                     </Typography>
//                 </Box>

//                 <IconButton onClick={toggleView} color="primary" title={isGrid ? 'Chuyển sang bảng' : 'Chuyển sang lưới'}>
//                     {isGrid ? <TableRowsIcon /> : <ViewModuleIcon />}
//                 </IconButton>
//             </Box>

//             {/* Content */}
//             {isGrid ? (
//                 <Box>
//                     <Grid container spacing={2} justifyContent="center">
//                         {pageRows.map((r) => (
//                             <Grid item key={r.id} xs={12} sm={6} md={4} lg={3}>
//                                 <GaugeMini
//                                     channel={r.channel}
//                                     name={r.name}
//                                     value={r.value}
//                                     unit={r.unit}
//                                     status={r.status}
//                                 />
//                             </Grid>
//                         ))}
//                     </Grid>

//                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 2 }}>
//                         <Typography variant="body2" sx={{ mr: 0.5 }}>
//                             {rows.length === 0 ? '0 – 0 / 0' : `${startIdx + 1} – ${endIdx} / ${rows.length}`}
//                         </Typography>
//                         <IconButton size="small" onClick={handlePrev} disabled={!canPrev}>
//                             <NavigateBeforeIcon />
//                         </IconButton>
//                         <IconButton size="small" onClick={handleNext} disabled={!canNext}>
//                             <NavigateNextIcon />
//                         </IconButton>
//                     </Box>

//                     {loading && (
//                         <Paper sx={{ p: 2, mt: 2 }}>
//                             <Loading text="Đang tải dữ liệu realtime..." />
//                         </Paper>
//                     )}
//                 </Box>
//             ) : (
//                 <Paper sx={{ p: 2 }}>
//                     <CustomDataGrid
//                         rows={rows}
//                         columns={columns}
//                         paginationModel={paginationModel}
//                         onPaginationModelChange={setPaginationModel}
//                         pageSizeOptions={[5, 10, 20]}
//                         pagination
//                         hideFooterSelectedRowCount
//                         loading={loading}
//                         initialState={{
//                             sorting: { sortModel: [{ field: 'channel', sort: 'asc' }] },
//                         }}
//                     />
//                     {loading && <Loading text="Đang tải dữ liệu realtime..." />}
//                 </Paper>
//             )}
//         </Box>
//     );
// }


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

/* =============== Mini Gauge (SVG) =============== */
const GaugeMini = ({ value, unit, channel, name, status }) => {
    const S = 120;
    const cx = 60, cy = 60, r = 60;

    const isNormal = status === 'Normal';
    const cardBg = isNormal ? 'rgba(78, 183, 83, 1)' : 'rgba(211,47,47,.95)';
    const cardBorder = isNormal ? 'rgba(46,125,50,1)' : 'rgba(211,47,47,1)';

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                p: 2,
                border: '1px solid',
                borderColor: cardBorder,
                bgcolor: cardBg,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            {/* Channel pill */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                    label={`CH ${channel ?? '-'}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, color: '#fff', borderColor: 'rgba(255,255,255,.55)' }}
                />
                <Box sx={{ width: 24 }} />
            </Box>

            {/* vòng tròn trắng */}
            <Box sx={{ display: 'grid', placeItems: 'center', mt: 0.5 }}>
                <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
                    <circle cx={cx} cy={cy} r={r} fill="#fff" />
                    <text
                        x="50%" y="50%"
                        dominantBaseline="middle" textAnchor="middle"
                        style={{ fontSize: 28, fontWeight: 800, fill: '#000' }}
                    >
                        {value ?? '--'}
                    </text>
                    <text
                        x="50%" y="66%"
                        dominantBaseline="middle" textAnchor="middle"
                        style={{ fontSize: 12, fill: '#000' }}
                    >
                        {unit || ''}
                    </text>
                </svg>
            </Box>

            {/* Name */}
            <Typography
                variant="subtitle2"
                sx={{ mt: 'auto', textAlign: 'center', fontWeight: 700, color: '#fff' }}
            >
                {name || ''}
            </Typography>
        </Paper>
    );
};

/* =============== Main =============== */
const PAGE_SIZE_GRID = 12; // 4 x 3

export default function HomeLayout() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // DataGrid pagination
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

    // maps
    const [deviceMap, setDeviceMap] = useState({});
    const [unitMap, setUnitMap] = useState({});

    // view toggle
    const [isGrid, setIsGrid] = useState(true);
    const toggleView = () => setIsGrid((v) => !v);

    // Grid pagination
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

    // Fetch device & channel meta
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
            } catch {
                // ignore
            }
        };
        init();
    }, []);

    // Socket realtime
    useEffect(() => {
        socket.connect();

        const onHomeData = (data) => {
            const mapped = (Array.isArray(data) ? data : []).map((item) => {
                let statusText = 'Sample';
                if (item.status === 1) statusText = 'Normal';
                else if (item.status === 2) statusText = 'Over range';
                else if (item.status === 3) statusText = 'Disconnect';

                return {
                    name: item.tagname,
                    deviceName: deviceMap[item.deviceId] || item.deviceId || '',
                    symbol: item.symbol,
                    value: item.value,
                    unit: unitMap[item.tagname] || '',
                    status: statusText,
                    channel: Number(item.channel ?? 0),
                };
            });

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

    // Status chip
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
                sx={{
                    fontWeight: 600,
                    minWidth: 120,
                    justifyContent: 'center',
                    pl: 1,
                    '& .MuiChip-icon': { ml: .3 }
                }}
            />
        );
    };

    // Table columns
    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110 },
        { field: 'channel', headerName: 'Channel', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110, sortComparator: (v1, v2) => Number(v1) - Number(v2) },
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
        { field: 'deviceName', headerName: 'Device', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
        { field: 'symbol', headerName: 'Symbol', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
        { field: 'value', headerName: 'Value', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
        { field: 'unit', headerName: 'Unit', flex: 1, headerAlign: 'center', align: 'center', minWidth: 110 },
        { field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center', minWidth: 160, renderCell: renderStatus },
    ], []); // eslint-disable-line

    return (
        <Box
            sx={{
                p: 0,
                height: '100%',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}
        >
            {/* Header + Toggle */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
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

            {/* Content – chiếm phần còn lại */}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {isGrid ? (
                    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                            <Grid container spacing={2} justifyContent="center">
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
                            </Grid>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 1.5 }}>
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
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <Paper
                            sx={{
                                p: 2,
                                width: '100%',
                                height: '100%',
                                maxHeight: '100%',
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box sx={{ flex: 1, minHeight: 0 }}>
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
                            </Box>
                            {loading && <Loading text="Đang tải dữ liệu realtime..." />}
                        </Paper>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// // src/js/HomeLayout/HomeLayout.js
// import React, { useEffect, useState } from 'react';

// import {
//     Box, Typography, Paper, Table, TableHead, TableBody,
//     TableRow, TableCell, TableContainer, CircularProgress, Stack,
// } from '@mui/material';

// import { toast } from 'react-toastify';
// import { socket } from '../Ultils/Socket/Socket';

// const HomeLayout = () => {
//     const [loading, setLoading] = useState(true);
//     const [rows, setRows] = useState([]);

//     useEffect(() => {
//         // nếu app chưa connect thì mới connect
//         if (!socket.connected) socket.connect();

//         const onHomeData = (data) => {
//             // log thẳng raw data nhận từ server
//             console.log('[HOME] SERVER SEND HOME DATA (raw):', data);

//             const mapped = (Array.isArray(data) ? data : []).map((item, index) => {
//                 let statusStr;
//                 if (item.status === 1) statusStr = 'Normal';
//                 else if (item.status === 2) statusStr = 'Over range';
//                 else if (item.status === 3) statusStr = 'Disconnect';
//                 else statusStr = 'Sample';

//                 const row = {
//                     id: item.tagnameId ?? index,
//                     name: item.tagname,
//                     value: item.value,
//                     rawValue: item.rawValue,
//                     symbol: item.symbol,
//                     status: statusStr,
//                     channel: item.channel,
//                     deviceId: item.deviceId,
//                     slaveId: item.slaveId,
//                     address: item.address,
//                     functionCode: item.functionCode,
//                     dataFormat: item.dataFormat,
//                     dataType: item.dataType,
//                     permission: item.permission,
//                 };

//                 // log từng row sau khi map (nếu cần theo dõi chi tiết)
//                 console.log('[HOME] mapped row:', row);
//                 return row;
//             });

//             setRows(mapped);
//             setLoading(false);
//         };

//         const onWriteResult = (res) => {
//             if (res?.success) {
//                 toast.success(res.message || 'Ghi thành công!');
//             } else {
//                 toast.error('Ghi thất bại: ' + (res?.error || 'Unknown error'));
//             }
//         };

//         socket.on('SERVER SEND HOME DATA', onHomeData);
//         socket.on('SERVER WRITE RESULT', onWriteResult);

//         return () => {
//             socket.off('SERVER SEND HOME DATA', onHomeData);
//             socket.off('SERVER WRITE RESULT', onWriteResult);
//             // Nếu muốn giữ kết nối cho trang khác thì KHÔNG disconnect ở đây
//             // if (socket.connected) socket.disconnect();
//         };
//     }, []);

//     return (
//         <Box
//             sx={{
//                 p: 3,
//                 bgcolor: 'background.default',
//                 minHeight: 'calc(100vh - 64px)',
//             }}
//         >
//             {/* Tiêu đề góc trái */}
//             <Box sx={{ mb: 3 }}>
//                 <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
//                     DASHBOARD
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                     Welcome to your dashboard
//                 </Typography>
//             </Box>

//             {/* Bảng dữ liệu realtime */}
//             {loading ? (
//                 <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
//                     <CircularProgress />
//                     <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
//                         Đang tải dữ liệu realtime...
//                     </Typography>
//                 </Stack>
//             ) : (
//                 <TableContainer component={Paper} variant="outlined">
//                     <Table size="small" stickyHeader>
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell width={80}>ID</TableCell>
//                                 <TableCell>Name</TableCell>
//                                 <TableCell align="right">Value</TableCell>
//                                 <TableCell align="right">Raw</TableCell>
//                                 <TableCell>Status</TableCell>
//                                 <TableCell>Symbol</TableCell>
//                                 <TableCell>Channel</TableCell>
//                                 <TableCell>Device</TableCell>
//                                 <TableCell>Slave</TableCell>
//                                 <TableCell>Addr</TableCell>
//                                 <TableCell>FC</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {rows.map((r) => (
//                                 <TableRow key={r.id}>
//                                     <TableCell>{r.id}</TableCell>
//                                     <TableCell>{r.name ?? '--'}</TableCell>
//                                     <TableCell align="right">
//                                         {r.value ?? '--'}
//                                     </TableCell>
//                                     <TableCell align="right">{r.rawValue ?? '--'}</TableCell>
//                                     <TableCell>{r.status}</TableCell>
//                                     <TableCell>{r.symbol ?? ''}</TableCell>
//                                     <TableCell>{r.channel ?? '--'}</TableCell>
//                                     <TableCell>{r.deviceId ?? '--'}</TableCell>
//                                     <TableCell>{r.slaveId ?? '--'}</TableCell>
//                                     <TableCell>{r.address ?? '--'}</TableCell>
//                                     <TableCell>{r.functionCode ?? '--'}</TableCell>
//                                 </TableRow>
//                             ))}
//                             {!rows.length && (
//                                 <TableRow>
//                                     <TableCell colSpan={11} align="center">
//                                         Không có dữ liệu.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             )}
//         </Box>
//     );
// };

// export default HomeLayout;

// src/js/HomeLayout/HomeLayout.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer, CircularProgress, Stack, Button
} from '@mui/material';
import { toast } from 'react-toastify';
import { socket } from '../Ultils/Socket/Socket';

const HomeLayout = () => {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [connInfo, setConnInfo] = useState('Đang kết nối...');

    useEffect(() => {
        if (!socket.connected) socket.connect();

        const stopper = setTimeout(() => {
            // nếu 5s chưa có dữ liệu thì tắt loading nhưng giữ ghi chú
            if (loading) setLoading(false);
        }, 5000);

        const onConnect = () => {
            console.log('[HOME] socket connected:', socket.id);
            setConnInfo('Đã kết nối');
            // nếu đã kết nối nhưng chưa có data thì tắt spinner để UI không “đứng”
            if (loading) setLoading(false);
        };
        const onConnectError = (err) => {
            console.error('[HOME] socket connect_error:', err);
            setConnInfo(`Lỗi kết nối: ${err?.message || err}`);
            if (loading) setLoading(false);
        };
        const onDisconnect = (reason) => {
            console.warn('[HOME] socket disconnect:', reason);
            setConnInfo(`Mất kết nối: ${reason}`);
        };

        const onHomeData = (data) => {
            console.log('[HOME] SERVER SEND HOME DATA (raw):', data);
            const mapped = (Array.isArray(data) ? data : []).map((item, index) => {
                let statusStr = 'Sample';
                if (item.status === 1) statusStr = 'Normal';
                else if (item.status === 2) statusStr = 'Over range';
                else if (item.status === 3) statusStr = 'Disconnect';

                const row = {
                    id: item.tagnameId ?? index,
                    name: item.tagname,
                    value: item.value,
                    rawValue: item.rawValue,
                    symbol: item.symbol,
                    status: statusStr,
                    channel: item.channel,
                    deviceId: item.deviceId,
                    slaveId: item.slaveId,
                    address: item.address,
                    functionCode: item.functionCode,
                    dataFormat: item.dataFormat,
                    dataType: item.dataType,
                    permission: item.permission,
                };
                console.log('[HOME] mapped row:', row);
                return row;
            });
            setRows(mapped);
            setLoading(false);
        };

        const onWriteResult = (res) => {
            if (res?.success) toast.success(res.message || 'Ghi thành công!');
            else toast.error('Ghi thất bại: ' + (res?.error || 'Unknown error'));
        };

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);
        socket.on('SERVER SEND HOME DATA', onHomeData);
        socket.on('SERVER WRITE RESULT', onWriteResult);

        return () => {
            clearTimeout(stopper);
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('disconnect', onDisconnect);
            socket.off('SERVER SEND HOME DATA', onHomeData);
            socket.off('SERVER WRITE RESULT', onWriteResult);
        };
    }, []); // eslint-disable-line

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            {/* Tiêu đề */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                    DASHBOARD
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Welcome to your dashboard — {connInfo}
                </Typography>
            </Box>

            {/* Loading */}
            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                        Đang tải dữ liệu realtime...
                    </Typography>
                </Stack>
            ) : (
                <>
                    {/* Bảng dữ liệu đơn giản */}
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={80}>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                    <TableCell align="right">Raw</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Symbol</TableCell>
                                    <TableCell>Channel</TableCell>
                                    <TableCell>Device</TableCell>
                                    <TableCell>Slave</TableCell>
                                    <TableCell>Addr</TableCell>
                                    <TableCell>FC</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.id}</TableCell>
                                        <TableCell>{r.name ?? '--'}</TableCell>
                                        <TableCell align="right">{r.value ?? '--'}</TableCell>
                                        <TableCell align="right">{r.rawValue ?? '--'}</TableCell>
                                        <TableCell>{r.status}</TableCell>
                                        <TableCell>{r.symbol ?? ''}</TableCell>
                                        <TableCell>{r.channel ?? '--'}</TableCell>
                                        <TableCell>{r.deviceId ?? '--'}</TableCell>
                                        <TableCell>{r.slaveId ?? '--'}</TableCell>
                                        <TableCell>{r.address ?? '--'}</TableCell>
                                        <TableCell>{r.functionCode ?? '--'}</TableCell>
                                    </TableRow>
                                ))}
                                {!rows.length && (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            Chưa nhận được dữ liệu từ server.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                        <Button size="small" onClick={() => socket.connected || socket.connect()}>
                            Thử kết nối lại
                        </Button>
                    </Stack>
                </>
            )}
        </Box>
    );
};

export default HomeLayout;

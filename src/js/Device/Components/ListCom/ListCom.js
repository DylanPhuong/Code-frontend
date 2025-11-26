// import {
//     useState, useEffect,
//     Paper, Button,            // 
//     BorderColorIcon
// } from '../../../ImportComponents/Imports';
// import { fetchAllComs } from '../../../../Services/APIDevice';
// import ModalCom from '../../../Ultils/Modal/Com/ModalCom';
// import Loading from '../../../Ultils/Loading/Loading';
// import CustomDataGrid from '../../../ImportComponents/CustomDataGrid';

// const ListCom = () => {
//     const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
//     const [listComs, setListComs] = useState([]);
//     const [dataModalCom, setdataModalCom] = useState([]);
//     const [isShowModalCom, setisShowModalCom] = useState(false);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchComs();
//     }, []);

//     const fetchComs = async () => {
//         setLoading(true);
//         const response = await fetchAllComs();
//         if (response && response.EC === 0 && response.DT?.DT) {
//             const rowsWithId = response.DT.DT.map((item) => ({
//                 id: item._id,
//                 name: item.name,
//                 type: item.type,
//                 baudRate: item.baudRate,
//                 parity: item.parity,
//                 dataBit: item.dataBit,
//                 stopBit: item.stopBit,
//                 serialPort: item.serialPort,
//             }));
//             setListComs(rowsWithId);
//         }
//         setLoading(false);
//     };

//     const handleCloseModalCom = () => {
//         setisShowModalCom(false);
//         fetchComs();
//     };

//     const handleEditCom = (com) => {
//         setdataModalCom(com);
//         setisShowModalCom(true);
//     };

//     const columns = [
//         { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center' },
//         { field: 'type', headerName: 'Type', flex: 1, headerAlign: 'center', align: 'center' },
//         { field: 'baudRate', headerName: 'Baud Rate', flex: 1, headerAlign: 'center', align: 'center' },
//         { field: 'dataBit', headerName: 'Data Bit', flex: 1, headerAlign: 'center', align: 'center' },
//         { field: 'parity', headerName: 'Parity', flex: 1, headerAlign: 'center', align: 'center' },
//         { field: 'stopBit', headerName: 'Stop Bit', flex: 1, headerAlign: 'center', align: 'center' },
//         { field: 'serialPort', headerName: 'Serial Port', flex: 1, headerAlign: 'center', align: 'center' },
//         {
//             field: 'action',
//             headerName: 'Action',
//             flex: 1,
//             headerAlign: 'center',
//             align: 'center',
//             sortable: false,
//             filterable: false,
//             disableColumnMenu: true,
//             renderCell: (params) => (
//                 <Button
//                     variant="contained"
//                     size="small"
//                     color="primary"
//                     startIcon={<BorderColorIcon />}
//                     onClick={(e) => {
//                         e.stopPropagation(); // tránh trigger select row
//                         handleEditCom(params.row);
//                     }}
//                     sx={{ fontWeight: 600, textTransform: 'none', px: 2 }}
//                 >
//                     Sửa
//                 </Button>
//             ),
//         },
//     ];

//     return (
//         <>
//             <Paper sx={{ height: 400, width: '100%' }}>
//                 <CustomDataGrid
//                     rows={listComs}
//                     columns={columns}
//                     paginationModel={paginationModel}
//                     onPaginationModelChange={setPaginationModel}
//                     pageSizeOptions={[5, 10, 20]}
//                     pagination
//                     hideFooterSelectedRowCount
//                     loading={loading}
//                 />
//                 {loading && <Loading text="Đang tải dữ liệu..." />}
//             </Paper>

//             <ModalCom
//                 handleCloseModalCom={handleCloseModalCom}
//                 isShowModalCom={isShowModalCom}
//                 dataModalCom={dataModalCom}
//             />
//         </>
//     );
// };

// export default ListCom;


import {
    useState,
    useEffect,
    Paper,
    Button,
    BorderColorIcon,
} from "../../../ImportComponents/Imports";
import { fetchAllComs } from "../../../../Services/APIDevice";
import ModalCom from "../../../Ultils/Modal/Com/ModalCom";
import Loading from "../../../Ultils/Loading/Loading";
import CustomDataGrid from "../../../ImportComponents/CustomDataGrid";

const ListCom = () => {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [listComs, setListComs] = useState([]);
    const [dataModalCom, setdataModalCom] = useState([]);
    const [isShowModalCom, setisShowModalCom] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComs();
    }, []);

    const fetchComs = async () => {
        setLoading(true);
        const response = await fetchAllComs();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
                type: item.type,
                baudRate: item.baudRate,
                parity: item.parity,
                dataBit: item.dataBit,
                stopBit: item.stopBit,
                serialPort: item.serialPort,
            }));
            setListComs(rowsWithId);
        }
        setLoading(false);
    };

    const handleCloseModalCom = () => {
        setisShowModalCom(false);
        fetchComs();
    };

    const handleEditCom = (com) => {
        setdataModalCom(com);
        setisShowModalCom(true);
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "type",
            headerName: "Type",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "baudRate",
            headerName: "Baud Rate",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "dataBit",
            headerName: "Data Bit",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "parity",
            headerName: "Parity",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "stopBit",
            headerName: "Stop Bit",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "serialPort",
            headerName: "Serial Port",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "action",
            headerName: "Action",
            flex: 1,
            headerAlign: "center",
            align: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<BorderColorIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEditCom(params.row);
                    }}
                    sx={{ fontWeight: 600, textTransform: "none", px: 2 }}
                >
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <>
            <Paper sx={{ height: 400, width: "100%" }}>
                <CustomDataGrid
                    rows={listComs}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    pagination
                    hideFooterSelectedRowCount
                    loading={loading}
                />
                {loading && <Loading text="Đang tải dữ liệu..." />}
            </Paper>

            <ModalCom
                handleCloseModalCom={handleCloseModalCom}
                isShowModalCom={isShowModalCom}
                dataModalCom={dataModalCom}
            />
        </>
    );
};

export default ListCom;

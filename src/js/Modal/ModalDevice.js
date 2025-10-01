import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { createNewDevice, updateCurrentDevice, fetchAllComs } from '../../Services/APIDevice';
import toast from 'react-hot-toast';
import useValidator from '../Valiedate/Validation'

function ModalDevice(props) {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };

    const defaultData = {
        id: '',
        name: '',
        serialPort: '',
        protocol: '',
        driverName: '',
        timeOut: '',
        ipAddress: '',
        port: '',
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [dataDevice, setDataDevice] = useState(defaultData);
    const [listComs, setListComs] = useState([]);
    const { action, isShowModalDevice, handleCloseModalDevice, dataModalDevice, listProtocol, listModbus } = props;

    useEffect(() => {
        fetchComs();
    }, []);

    const fetchComs = async () => {

        let response = await fetchAllComs();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rows = response.DT.DT.map((item) => ({
                name: item.name,
                serialPort: item.serialPort,
            }));
            setListComs(rows);
        }
    };

    useEffect(() => {
        if (isShowModalDevice) {
            setErrors({});
            if (action === 'EDIT' && dataModalDevice) {
                //console.log('Check dataModalDevice: ', listProtocol)
                setDataDevice({
                    id: dataModalDevice.id || '',
                    name: dataModalDevice.name || '',
                    serialPort: dataModalDevice.serialPort || '',
                    protocol: dataModalDevice.protocol || '',
                    driverName: dataModalDevice.driverName || '',
                    timeOut: dataModalDevice.timeOut || '',
                    ipAddress: dataModalDevice.ipAddress || '',
                    port: dataModalDevice.port || '',
                });
            } else if (action === 'CREATE' && dataModalDevice) {
                setDataDevice(prev => ({
                    ...prev,
                    protocol: dataModalDevice.protocol || '',
                    driverName: dataModalDevice.driverName || '',
                    ipAddress: '',
                    port: '',
                    serialPort: '',
                }));
            } else {
                setDataDevice(defaultData);
            }
        }
    }, [isShowModalDevice, action, dataModalDevice]);

    const handleClose = () => {
        setErrors({});
        handleCloseModalDevice();
        setDataDevice(defaultData);
    };

    const handleOnchangeInput = (value, name) => {
        let _dataDevice = _.cloneDeep(dataDevice);
        _dataDevice[name] = value;
        setDataDevice((prev) => ({
            ...prev,
            [name]: value,
        }));
        const errorMessage = validate(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    const validateAll = () => {
        const newErrors = {};
        const isRTU = dataDevice.driverName === "Modbus RTU Client";
        const isTCP = dataDevice.driverName === "Modbus TCP Client";

        // Danh sách các trường cần validate dựa trên loại driver
        let fieldsToValidate = ["name", "protocol", "driverName", "timeOut"];
        if (isRTU) fieldsToValidate.push("serialPort");
        if (isTCP) fieldsToValidate.push("ipAddress", "port");

        fieldsToValidate.forEach((key) => {
            const value = dataDevice[key];
            const errorMsg = validate(key, value);
            newErrors[key] = errorMsg;
            if (errorMsg) {
                console.warn(`❌ Lỗi ở ${key}: ${errorMsg}`);
            }
        });

        setErrors(newErrors);
        return Object.values(newErrors).every(err => err === "");
    };

    const handleConfirmDevice = async () => {
        if (!validateAll()) {
            return;
        }
        const dataToUpdate = { ...dataDevice, id: dataModalDevice?.id };
        // console.log('Check data device update: ', dataDevice);
        let res = action === 'CREATE'
            ? await createNewDevice(dataDevice)
            : await updateCurrentDevice(dataToUpdate);
        if (res && res.EC === 0) {
            toast.success(res.EM);
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    return (
        <Modal open={isShowModalDevice} onClose={handleClose} onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmDevice();
            }
        }}>
            <Box sx={style}>
                {/* Header */}
                <Typography
                    variant="h6"
                    align="center"
                    sx={{ mb: 2 }}
                >
                    {action === 'CREATE' ? 'Thêm mới' : 'Chỉnh sửa'}
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: "8%",
                        transform: "translateY(-50%)"
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Form */}
                <Box
                    component="form"
                    display="grid"
                    gridTemplateColumns="1fr 1fr"
                    gap={2}
                    onSubmit={(e) => {
                        e.preventDefault(); // chặn reload trang
                        handleConfirmDevice();
                    }}
                >
                    {/* Name */}
                    <TextField
                        label="Name"
                        value={dataDevice.name}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    {/* Protocol */}
                    <TextField
                        select
                        label="Protocol1"
                        value={dataDevice.protocol}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'protocol')}
                        error={!!errors.protocol}
                        helperText={errors.protocol}
                    >
                        {listProtocol.map((item) => (
                            <MenuItem key={item.id} value={item.name}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {/* Driver Name */}
                    <TextField
                        select
                        label="Driver Name"
                        value={dataDevice.driverName}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
                        error={!!errors.driverName}
                        helperText={errors.driverName}
                    >
                        {listModbus.map((item) => (
                            <MenuItem key={item.id} value={item.name}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {/* Serial Port cho Modbus RTU */}
                    {dataDevice.driverName === 'Modbus RTU Client' && (
                        <TextField
                            select
                            label="Serial Port"
                            value={dataDevice.serialPort}
                            variant="standard"
                            onChange={(e) => handleOnchangeInput(e.target.value, 'serialPort')}
                            error={!!errors.serialPort}
                            helperText={errors.serialPort}
                        >
                            {listComs.map((com, idx) => (
                                <MenuItem key={idx} value={com.serialPort}>
                                    {com.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* Ip + Port cho Modbus TCP */}
                    {dataDevice.driverName === 'Modbus TCP Client' && (
                        <>
                            <TextField
                                label="Ip Address"
                                value={dataDevice.ipAddress || ''}
                                variant="standard"
                                onChange={(e) => handleOnchangeInput(e.target.value, 'ipAddress')}
                                error={!!errors.ipAddress}
                                helperText={errors.ipAddress}
                            />
                            <TextField
                                label="Port"
                                value={dataDevice.port || ''}
                                variant="standard"
                                onChange={(e) => handleOnchangeInput(e.target.value, 'port')}
                                error={!!errors.port}
                                helperText={errors.port}
                            />
                        </>
                    )}

                    {/* Time Out */}
                    <TextField
                        label="TimeOut (ms)"
                        InputProps={{ style: { textAlign: 'center' } }}
                        value={dataDevice.timeOut}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'timeOut')}
                        error={!!errors.timeOut}
                        helperText={errors.timeOut}
                        sx={dataDevice.driverName === 'Modbus RTU Client' ? {
                            gridColumn: 'span 2',
                            justifySelf: 'center',
                            width: '50%'
                        } : {}}
                    />
                    {/* Footer */}
                    <Box mt={3}
                        sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            sx={{ width: '150px' }}
                        >
                            {action === 'CREATE' ? 'Lưu' : 'Cập nhật'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal >
    );
}

export default ModalDevice;

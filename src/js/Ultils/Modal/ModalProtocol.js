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
// import _ from 'lodash'
import useValidator from '../../Valiedate/Validation'

function ModalProtocol(props) {

    const {
        listProtocol,
        listModbus,
        listSiemens,
        isShowModalProtocol,
        handleCloseModalProtocol,
        setisShowModalDevice,
        setdataModalDevice
    } = props;

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

    useEffect(() => {
        if (isShowModalProtocol) {
            setErrors({});
            setdataProtocol(defaultData);
        }
    }, [isShowModalProtocol]);


    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const defaultData = { protocol: '', driverName: '' };
    const [dataProtocol, setdataProtocol] = useState(defaultData);

    const handleOnchangeInput = (value, name) => {
        setdataProtocol(prev => ({
            ...prev,
            [name]: value,
            ...(name === "protocol" ? { driverName: "" } : {})
        }));

        //  validate trường hiện tại
        const errorMessage = validate(name, value);

        setErrors(prev => {
            const newErrors = { ...prev, [name]: errorMessage };

            //  Nếu đang đổi protocol → clear lỗi driverName luôn
            if (name === "protocol") {
                newErrors.driverName = "";
            }
            return newErrors;
        });
    };

    const handleClose = () => {
        setErrors({});
        handleCloseModalProtocol();
        setdataProtocol(defaultData)
    };

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataProtocol).forEach(([key, value]) => {
            newErrors[key] = validate(key, value);

        });
        setErrors(newErrors);
        // Kiểm tra xem có lỗi nào không
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleConfirmProtocol = () => {
        if (!validateAll()) {
            return;
        }
        switch (dataProtocol.protocol) {
            case "Modbus": {
                const modbusDriver = listModbus.find(
                    item => item.name === dataProtocol.driverName
                );
                if (modbusDriver) {
                    setdataModalDevice(prev => ({
                        ...prev,
                        protocol: dataProtocol.protocol,
                        driverName: modbusDriver.name
                    }));
                    handleClose();
                    setisShowModalDevice(true);
                } else {
                    alert("Vui lòng chọn driver Modbus hợp lệ");
                }
                break;
            }

            case "Siemens": {
                const siemensDriver = listSiemens.find(
                    item => item.name === dataProtocol.driverName
                );
                setdataModalDevice(prev => ({
                    ...prev,
                    protocol: dataProtocol.protocol,
                    driverName: siemensDriver ? siemensDriver.name : ""
                }));
                handleClose();
                setisShowModalDevice(true);
                break;
            }

            case "MQTT Client": {
                setdataModalDevice(prev => ({
                    ...prev,
                    protocol: dataProtocol.protocol
                }));
                handleClose();
                setisShowModalDevice(true);
                break;
            }

            default:
                alert("Vui lòng chọn protocol hợp lệ");
                break;
        }
    };

    return (
        <>
            {/* Modal chọn protocol */}
            <Modal open={isShowModalProtocol} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" align="center">Chọn Protocol</Typography>
                    <IconButton
                        onClick={handleClose}
                        sx={{ position: "absolute", right: 20, top: 20 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
                        <TextField
                            select
                            label="Protocol"
                            variant="standard"
                            value={dataProtocol.protocol}
                            onChange={(e) => handleOnchangeInput(e.target.value, 'protocol')}
                            sx={{ gridColumn: "1 / -1" }}
                            error={!!errors.protocol}
                            helperText={errors.protocol}
                        >
                            {listProtocol.map((item) => (
                                <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {dataProtocol.protocol === 'Modbus' && (
                            <TextField
                                select
                                label="Driver Name"
                                variant="standard"
                                value={dataProtocol.driverName}
                                onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
                                sx={{ gridColumn: "1 / -1" }}
                                error={!!errors.driverName}
                                helperText={errors.driverName}
                            >
                                {listModbus.map((item) => (
                                    <MenuItem key={item.id} value={item.name}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Box>

                    <Box mt={3} textAlign="center">
                        <Button variant="contained" color="success" onClick={handleConfirmProtocol}>
                            Tiếp tục
                        </Button>
                    </Box>
                </Box>
            </Modal >

        </>
    );
}

export default ModalProtocol

import {
  useState,
  useEffect,
  useMemo,
  Button,
  CancelPresentation,
  MenuItem,
  TextField,
  Box,
  Modal,
  Typography,
  AddBoxIcon,
  IconButton,
  CancelIcon,
  useValidator,
} from '../../../ImportComponents/Imports';

const ModalProtocol = (props) => {
  const {
    listProtocol,
    listModbus,
    listSiemens,
    listMqtt,
    isShowModalProtocol,
    handleCloseModalProtocol,
    setisShowModalDevice,
    setdataModalDevice,
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
    p: 2.5,
  };

  const { validate } = useValidator();
  const [errors, setErrors] = useState({});
  const defaultData = useMemo(() => ({ protocol: '', driverName: '' }), []);
  const [dataProtocol, setdataProtocol] = useState(defaultData);

  useEffect(() => {
    if (isShowModalProtocol) {
      setErrors({});
      setdataProtocol(defaultData);
    }
  }, [isShowModalProtocol, defaultData]);

  const handleOnchangeInput = (value, name) => {
    setdataProtocol((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'protocol' ? { driverName: '' } : {}),
    }));

    const errorMessage = validate(name, value);
    setErrors((prev) => {
      const next = { ...prev, [name]: errorMessage };
      if (name === 'protocol') next.driverName = '';
      return next;
    });
  };

  const handleClose = () => {
    setErrors({});
    handleCloseModalProtocol();
    setdataProtocol(defaultData);
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(dataProtocol).forEach(([key, val]) => {
      newErrors[key] = validate(key, val);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleConfirmProtocol = () => {
    if (!validateAll()) return;

    switch (dataProtocol.protocol) {
      case 'Modbus': {
        const modbusDriver = (listModbus || []).find((it) => it.name === dataProtocol.driverName);
        if (modbusDriver) {
          setdataModalDevice((prev) => ({
            ...prev,
            protocol: dataProtocol.protocol,
            driverName: modbusDriver.name,
          }));
          handleClose();
          setisShowModalDevice(true);
        }
        break;
      }
      case 'Siemens': {
        const siemensDriver = (listSiemens || []).find((it) => it.name === dataProtocol.driverName);
        setdataModalDevice((prev) => ({
          ...prev,
          protocol: dataProtocol.protocol,
          driverName: siemensDriver ? siemensDriver.name : '',
        }));
        handleClose();
        setisShowModalDevice(true);
        break;
      }
      case 'MQTT': {
        const mqttDriver = (listMqtt || []).find((it) => it.name === dataProtocol.driverName);
        setdataModalDevice((prev) => ({
          ...prev,
          protocol: dataProtocol.protocol,
          driverName: mqttDriver ? mqttDriver.name : '',
        }));
        handleClose();
        setisShowModalDevice(true);
        break;
      }
      default: {
        alert('Vui lòng chọn protocol hợp lệ');
      }
    }
  };

  return (
    <Modal
      open={isShowModalProtocol}
      onClose={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmProtocol();
        }
      }}
    >
      <Box sx={style}>
        <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
          Chọn Protocol
        </Typography>

        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 20,
            top: 20,
            width: { xs: 36, md: 48 },
            height: { xs: 36, md: 25 },
          }}
        >
          <CancelIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
        </IconButton>

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
          <TextField
            select
            label="Protocol"
            variant="standard"
            value={dataProtocol.protocol}
            onChange={(e) => handleOnchangeInput(e.target.value, 'protocol')}
            sx={{ gridColumn: '1 / -1' }}
            error={!!errors.protocol}
            helperText={errors.protocol}
          >
            {(listProtocol || []).map((item) => (
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
              sx={{ gridColumn: '1 / -1' }}
              error={!!errors.driverName}
              helperText={errors.driverName}
            >
              {(listModbus || []).map((item) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {dataProtocol.protocol === 'Siemens' && (
            <TextField
              select
              label="Driver Name"
              variant="standard"
              value={dataProtocol.driverName}
              onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
              sx={{ gridColumn: '1 / -1' }}
              error={!!errors.driverName}
              helperText={errors.driverName}
            >
              {(listSiemens || []).map((item) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {dataProtocol.protocol === 'MQTT' && (
            <TextField
              select
              label="Driver Name"
              variant="standard"
              value={dataProtocol.driverName}
              onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
              sx={{ gridColumn: '1 / -1' }}
              error={!!errors.driverName}
              helperText={errors.driverName}
            >
              {(listMqtt || []).map((item) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelPresentation />}
            sx={{ mt: 1.5, textTransform: 'none' }}
            onClick={handleClose}
          >
            Thoát
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<AddBoxIcon />}
            sx={{ mt: 1.5, ml: 1.5, textTransform: 'none' }}
            onClick={handleConfirmProtocol}
          >
            Thêm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalProtocol;

import {
  useState,
  useEffect,
  useMemo,
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  TextField,
  CancelPresentation,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  CancelIcon,
  SaveIcon,
  toast,
  socket,
  useValidator,
  Android12Switch,
  AddBoxIcon,
} from '../../../ImportComponents/Imports';
import { createNewChannel, updateCurrentChannel } from '../../../../Services/APIDevice';

const ModalChannel = (props) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: 600,
    bgcolor: '#fff',
    borderRadius: 2,
    boxShadow: 24,
    px: 2.5,
    py: 1,
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const defaultData = useMemo(
    () => ({
      channel: '',
      name: '',
      device: null,
      symbol: '',
      unit: '',
      offset: '',
      gain: '',
      slaveId: '',
      functionCode: null,
      address: '',
      topic: '',
      dataFormat: null,
      dataType: null,
      functionText: '',
      permission: false,
      selectFTP: false,
      selectMySQL: false,
      selectSQL: false,
    }),
    []
  );

  const [dataChannels, setDataChannels] = useState(defaultData);
  const [errors, setErrors] = useState({});
  const { validate } = useValidator();
  const {
    action,
    actionFuncSetting,
    isShowModalChannel,
    handleCloseModalChannel,
    dataModalChannel,
    listDevices = [],
    listDataFormat = [],
    listDataType = [],
    listFunctionCodeModbus = [],
    listFunctionCodeMQTT = [],
  } = props;

  // protocol hiện tại dựa trên device chọn
  const currentProtocol = useMemo(() => {
    if (!dataChannels.device) return null;
    const selected = listDevices.find((d) => d.id === dataChannels.device._id);
    return selected ? selected.protocol : null;
  }, [dataChannels.device, listDevices]);

  // khởi tạo khi mở modal
  useEffect(() => {
    if (!isShowModalChannel) return;

    setErrors({});
    if (action === 'EDIT' && dataModalChannel) {
      const functionCodesForDevice =
        (listDevices.find((d) => d.id === dataModalChannel.deviceId)?.protocol || '') === 'MQTT'
          ? listFunctionCodeMQTT
          : listFunctionCodeModbus;

      const func = functionCodesForDevice.find((f) => f.id === dataModalChannel.functionCodeId);
      const format = listDataFormat.find((d) => d.id === dataModalChannel.dataFormatId);
      const type = listDataType.find((t) => t.id === dataModalChannel.dataTypeId);
      const device = listDevices.find((d) => d.name === dataModalChannel.deviceName);

      setDataChannels({
        id: dataModalChannel.id,
        channel: dataModalChannel.channel,
        name: dataModalChannel.name,
        device: device ? { _id: device.id, name: device.name } : null,
        symbol: dataModalChannel.symbol,
        unit: dataModalChannel.unit,
        offset: dataModalChannel.offset,
        gain: dataModalChannel.gain,
        slaveId: dataModalChannel.slaveId,
        functionCode: func ? func.id : null,
        address: dataModalChannel.address,
        topic: dataModalChannel.topic || '',
        dataFormat: format ? format.id : null,
        dataType: type ? type.id : null,
        functionText: dataModalChannel.functionText,
        permission: dataModalChannel.permission,
        selectFTP: dataModalChannel.selectFTP,
        selectMySQL: dataModalChannel.selectMySQL,
        selectSQL: dataModalChannel.selectSQL,
      });
    }

    if (action === 'CREATE') {
      setDataChannels({
        ...defaultData,
        functionText: `(x) => {
  let y = Number(x.toFixed(2));
  return y;
}`,
      });
    }
  }, [
    isShowModalChannel,
    action,
    actionFuncSetting,
    dataModalChannel,
    defaultData,
    listDevices,
    listDataFormat,
    listDataType,
    listFunctionCodeModbus,
    listFunctionCodeMQTT,
  ]);

  const handleClose = () => {
    handleCloseModalChannel();
    setDataChannels(defaultData);
    setErrors({});
  };

  const handleInputChange = (value, name) => {
    setDataChannels((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleDeviceChange = (deviceId) => {
    const device = listDevices.find((d) => d.id === deviceId);
    if (device) {
      setDataChannels((prev) => ({
        ...prev,
        device: { _id: device.id, name: device.name },
        functionCode: '',
        slaveId: device.protocol === 'MQTT' ? '' : prev.slaveId,
        address: device.protocol === 'MQTT' ? '' : prev.address,
        topic: device.protocol === 'Modbus' ? '' : prev.topic,
        dataFormat: '',
        dataType: '',
      }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    const mustFields = ['channel', 'name', 'device', 'functionCode', 'symbol'];
    const fc = Number(dataChannels.functionCode);
    const df = Number(dataChannels.dataFormat);

    const allKeys = [
      'channel',
      'name',
      'device',
      'symbol',
      'unit',
      'offset',
      'gain',
      'slaveId',
      'functionCode',
      'address',
      'topic',
      'dataFormat',
      'dataType',
      'functionText',
      'permission',
      'selectFTP',
      'selectMySQL',
      'selectSQL',
    ];

    allKeys.forEach((key) => {
      let shouldValidate = false;

      if (mustFields.includes(key)) shouldValidate = true;

      if (currentProtocol === 'Modbus') {
        if (['slaveId', 'address'].includes(key)) shouldValidate = true;
        if (['dataFormat', 'offset', 'gain'].includes(key)) shouldValidate = fc > 2 && fc !== 5;
        if (key === 'dataType') shouldValidate = fc > 2 && fc !== 5 && df > 2;
        if (key === 'topic') shouldValidate = false;
      } else if (currentProtocol === 'MQTT') {
        if (key === 'topic') shouldValidate = true;
        if (['slaveId', 'address', 'dataFormat', 'dataType', 'offset', 'gain'].includes(key)) shouldValidate = false;
      } else {
        // chưa chọn device
        shouldValidate = mustFields.includes(key);
      }

      if (['unit', 'functionText'].includes(key)) {
        // không bắt buộc validate
        shouldValidate = false;
      }

      newErrors[key] = shouldValidate ? validate(key, dataChannels[key]) : '';
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleConfirmChannel = async () => {
    if (!validateAll()) return;

    const dataToSave = { ...dataChannels };
    if (dataToSave.dataFormat === 1) dataToSave.dataType = 1;
    else if (dataToSave.dataFormat === 2) dataToSave.dataType = 2;

    const res = action === 'CREATE' ? await createNewChannel(dataToSave) : await updateCurrentChannel(dataToSave);
    if (res && res.EC === 0) {
      socket.emit('CHANGE TAGNAME');
      toast.success(res.EM);
      handleClose();
    } else {
      toast.error(res?.EM || 'Có lỗi xảy ra');
    }
  };

  const getDataTypeOptionsByFormat = () => {
    const formatId = Number(dataChannels.dataFormat);
    switch (formatId) {
      case 3:
        return (listDataType || []).filter((it) => [7, 8, 9, 10].includes(Number(it._id || it.id)));
      case 4:
        return (listDataType || []).filter((it) => [11, 12, 13, 14].includes(Number(it._id || it.id)));
      case 5:
        return (listDataType || []).filter((it) => [3, 4, 5, 6].includes(Number(it._id || it.id)));
      case 6:
        return (listDataType || []).filter((it) => [15, 16, 17, 18].includes(Number(it._id || it.id)));
      case 7:
        return (listDataType || []).filter((it) => [19, 20, 21, 22].includes(Number(it._id || it.id)));
      case 8:
        return (listDataType || []).filter((it) => [23, 24, 25, 26].includes(Number(it._id || it.id)));
      default:
        return [];
    }
  };

  return (
    <Modal
      open={isShowModalChannel}
      onClose={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !['functionText'].includes(e.target.name)) {
          e.preventDefault();
          handleConfirmChannel();
        }
      }}
    >
      <Box sx={style}>
        <Typography variant="h6" align="center" sx={{ fontWeight: 600, fontSize: 25 }}>
          {action === 'CREATE' ? 'Thêm mới' : 'Chỉnh sửa'}
        </Typography>

        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 20, top: 5, width: { xs: 36, md: 48 }, height: { xs: 36, md: 48 } }}
        >
          <CancelIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
        </IconButton>

        <Box
          component="form"
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gap={2}
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmChannel();
          }}
        >
          <TextField
            label="Channel"
            value={dataChannels.channel}
            variant="standard"
            onChange={(e) => handleInputChange(e.target.value, 'channel')}
            error={!!errors.channel}
            helperText={errors.channel}
          />

          <TextField
            label="Name"
            value={dataChannels.name}
            variant="standard"
            onChange={(e) => handleInputChange(e.target.value, 'name')}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            select
            fullWidth
            label="Device"
            variant="standard"
            value={dataChannels.device?._id || ''}
            onChange={(e) => handleDeviceChange(e.target.value)}
            error={!!errors.device}
            helperText={errors.device}
          >
            {(listDevices || []).map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Function"
            variant="standard"
            value={dataChannels.functionCode || ''}
            onChange={(e) => {
              const funcId = Number(e.target.value);
              const proto =
                listDevices.find((d) => d.id === dataChannels.device?._id)?.protocol || currentProtocol || 'Modbus';
              const pool = proto === 'MQTT' ? listFunctionCodeMQTT : listFunctionCodeModbus;
              const func = pool.find((f) => f.id === funcId);
              if (func) {
                setDataChannels((prev) => ({
                  ...prev,
                  functionCode: func.id,
                  dataFormat: funcId > 2 && funcId !== 5 ? prev.dataFormat : '',
                  dataType: funcId > 2 && funcId !== 5 ? prev.dataType : '',
                }));
              }
            }}
            error={!!errors.functionCode}
            helperText={errors.functionCode}
          >
            {(() => {
              const proto =
                listDevices.find((d) => d.id === dataChannels.device?._id)?.protocol || currentProtocol || 'Modbus';
              const list = proto === 'MQTT' ? listFunctionCodeMQTT : listFunctionCodeModbus;
              return (list || []).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ));
            })()}
          </TextField>

          {currentProtocol === 'Modbus' && (
            <>
              <TextField
                label="Slave Id"
                value={dataChannels.slaveId}
                variant="standard"
                onChange={(e) => handleInputChange(e.target.value, 'slaveId')}
                error={!!errors.slaveId}
                helperText={errors.slaveId}
              />

              <TextField
                label="Address"
                value={dataChannels.address}
                variant="standard"
                onChange={(e) => handleInputChange(e.target.value, 'address')}
                error={!!errors.address}
                helperText={errors.address}
              />

              {Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5 && (
                <TextField
                  select
                  fullWidth
                  label="Data Format"
                  value={dataChannels.dataFormat || ''}
                  variant="standard"
                  onChange={(e) => {
                    const formatId = Number(e.target.value);
                    const format = (listDataFormat || []).find((d) => d.id === formatId);
                    if (format) {
                      setDataChannels((prev) => ({
                        ...prev,
                        dataFormat: format.id,
                        dataType: formatId > 2 ? prev.dataType : '',
                      }));
                    }
                  }}
                  error={!!errors.dataFormat}
                  helperText={errors.dataFormat}
                >
                  {(listDataFormat || []).map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </>
          )}

          {currentProtocol === 'MQTT' && (
            <TextField
              label="Topic"
              value={dataChannels.topic}
              variant="standard"
              onChange={(e) => handleInputChange(e.target.value, 'topic')}
              error={!!errors.topic}
              helperText={errors.topic}
              sx={{ gridColumn: 'span 2' }}
            />
          )}

          {currentProtocol === 'Modbus' && Number(dataChannels.dataFormat) > 2 && (
            <TextField
              select
              fullWidth
              label="Data Type"
              value={dataChannels.dataType || ''}
              variant="standard"
              onChange={(e) => handleInputChange(Number(e.target.value), 'dataType')}
              error={!!errors.dataType}
              helperText={errors.dataType}
            >
              {getDataTypeOptionsByFormat().map((item) => (
                <MenuItem key={item._id || item.id} value={item._id || item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Symbol"
            value={dataChannels.symbol}
            variant="standard"
            onChange={(e) => handleInputChange(e.target.value, 'symbol')}
            error={!!errors.symbol}
            helperText={errors.symbol}
          />

          {currentProtocol === 'MQTT' && (
            <TextField
              label="Unit"
              value={dataChannels.unit}
              variant="standard"
              onChange={(e) => handleInputChange(e.target.value, 'unit')}
            />
          )}

          {currentProtocol === 'Modbus' &&
            Number(dataChannels.functionCode) > 2 &&
            Number(dataChannels.functionCode) !== 5 && (
              <>
                <TextField
                  label="Unit"
                  value={dataChannels.unit}
                  variant="standard"
                  onChange={(e) => handleInputChange(e.target.value, 'unit')}
                />

                <TextField
                  label="Offset"
                  value={dataChannels.offset}
                  variant="standard"
                  onChange={(e) => handleInputChange(e.target.value, 'offset')}
                  error={!!errors.offset}
                  helperText={errors.offset}
                />

                <TextField
                  label="Gain"
                  value={dataChannels.gain}
                  variant="standard"
                  onChange={(e) => handleInputChange(e.target.value, 'gain')}
                  error={!!errors.gain}
                  helperText={errors.gain}
                />
              </>
            )}

          {actionFuncSetting === 'FUNC' && (
            <TextField
              name="functionText"
              label="Function Text"
              value={dataChannels.functionText || ''}
              variant="standard"
              onChange={(e) => handleInputChange(e.target.value, 'functionText')}
              multiline
              minRows={5}
              maxRows={5}
              sx={{
                gridColumn: 'span 2',
                '& .MuiInputBase-root': { maxHeight: 250, overflowY: 'auto', whiteSpace: 'pre' },
              }}
            />
          )}

          <Box>
            <Box>Permission</Box>
            <RadioGroup
              row
              name="row-radio-buttons-group"
              value={dataChannels.permission}
              onChange={(e) => handleInputChange(e.target.value === 'true', 'permission')}
            >
              <FormControlLabel value={false} control={<Radio />} label="Read" />
              <FormControlLabel value={true} control={<Radio />} label="Read & Write" />
            </RadioGroup>
          </Box>

          <Box display="flex" flexDirection="row" gap={4} sx={{ ml: 2, mt: 0.7 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                FTP
              </Typography>
              <Android12Switch
                checked={dataChannels.selectFTP}
                onChange={(e) => handleInputChange(e.target.checked, 'selectFTP')}
              />
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                MySQL
              </Typography>
              <Android12Switch
                checked={dataChannels.selectMySQL}
                onChange={(e) => handleInputChange(e.target.checked, 'selectMySQL')}
              />
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                SQL
              </Typography>
              <Android12Switch
                checked={dataChannels.selectSQL}
                onChange={(e) => handleInputChange(e.target.checked, 'selectSQL')}
              />
            </Box>
          </Box>

          <Box mt={3} sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelPresentation />}
              sx={{ mb: 2, textTransform: 'none' }}
              onClick={handleClose}
            >
              Thoát
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="success"
              startIcon={action === 'CREATE' ? <AddBoxIcon /> : <SaveIcon />}
              sx={{ ml: 1.5, mb: 2, textTransform: 'none' }}
              onClick={handleConfirmChannel}
            >
              {action === 'CREATE' ? 'Thêm' : 'Cập nhật'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalChannel;

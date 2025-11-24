import {
  useState,
  useEffect,
  useMemo,
  Button,
  IconButton,
  Modal,
  Box,
  socket,
  Typography,
  TextField,
  CloseIcon,
  _,
  MenuItem,
  toast,
  useValidator,
} from '../../../ImportComponents/Imports';
import { updateConfigHistorical } from '../../../../Services/APIDevice';

const ModalAddHistorical = (props) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#fff',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const defaultData = useMemo(
    () => ({
      name: '',
      type: '',
    }),
    []
  );

  const [errors, setErrors] = useState({});
  const { validate } = useValidator();
  const [dataEditTag, setDataEditTag] = useState(defaultData);
  const [originalData] = useState(defaultData);
  const { handleCloseModalEditTag, isShowModalEdit, dataModalEditTag } = props;

  useEffect(() => {
    if (isShowModalEdit) {
      setErrors({});
      if (dataModalEditTag) {
        setDataEditTag({
          id: dataModalEditTag.id || '',
          name: dataModalEditTag.name || '',
          channel: dataModalEditTag.channel,
          deviceId: dataModalEditTag.device?._id,
          deviceName: dataModalEditTag.device?.name,
          symbol: dataModalEditTag.symbol,
          unit: dataModalEditTag.unit,
          type: dataModalEditTag.type || '',
        });
      } else {
        setDataEditTag(defaultData);
      }
    }
  }, [isShowModalEdit, dataModalEditTag, defaultData]);

  const handleClose = () => {
    setErrors({});
    handleCloseModalEditTag();
  };

  const handleOnchangeInput = (value, name) => {
    setDataEditTag((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(dataEditTag).forEach(([key, value]) => {
      newErrors[key] = validate(key, value);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleConfirmEdit = async () => {
    if (!validateAll()) return;
    const res = await updateConfigHistorical({ ...dataEditTag });
    if (res && res.EC === 0) {
      toast.success(res.EM);
      socket.emit('CHANGE HISTORICAL');
      handleClose();
    } else {
      toast.error(res?.EM || 'Có lỗi xảy ra');
    }
  };

  return (
    <Modal open={isShowModalEdit} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" align="center" sx={{ position: 'relative', top: '-15px' }}>
          Chỉnh sửa
        </Typography>

        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 20,
            top: '8%',
            transform: 'translateY(-50%)',
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box component="form" display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
          <TextField disabled label="Name" value={dataEditTag.name} variant="standard" />
          <TextField disabled label="Channel" value={dataEditTag.channel} variant="standard" />
          <TextField disabled label="Device" value={dataEditTag.deviceName} variant="standard" />
          <TextField disabled label="Symbol" value={dataEditTag.symbol} variant="standard" />
          <TextField disabled label="Unit" value={dataEditTag.unit} variant="standard" />

          <TextField
            select
            label="Type"
            value={dataEditTag.type}
            variant="standard"
            onChange={(e) => handleOnchangeInput(e.target.value, 'type')}
            error={!!errors.type}
            helperText={errors.type}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="cycle">Cycle</MenuItem>
            <MenuItem value="trigger">Trigger</MenuItem>
          </TextField>
        </Box>

        <Box mt={3} textAlign="center">
          <Button
            variant="contained"
            color="success"
            disabled={_.isEqual(dataEditTag, originalData)}
            sx={{ width: '150px' }}
            onClick={handleConfirmEdit}
          >
            <span> Chỉnh Sửa </span>
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
export default ModalAddHistorical;

import {
  useState,
  useEffect,
  useMemo,
  Paper,
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  InputAdornment,
  TextField,
  AddBoxIcon,
  SearchIcon,
  CancelIcon,
  CancelPresentation,
  MenuItem,
  toast,
  Loading,
  socket,
  CustomDataGrid,
} from '../../../ImportComponents/Imports';
import { fetchAllChannels } from '../../../../Services/APIDevice';

const ModalSearchChannels = (props) => {
  const {
    // dùng cho nhiều ngữ cảnh: thêm Historical, lọc Database, v.v.
    // actionHistorical, // (không dùng)
    actionDatabase,               
    openModalAdd,                
    openModalSearchTag,           
    handleCloseModalAdd,         
    handleCloseModalSearchTag,    
    dataConfig = [],              
  } = props;

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '95vw',
    maxWidth: 900,
    bgcolor: '#fff',
    borderRadius: 2,
    boxShadow: 24,
    p: 2.5,
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const defaultData = useMemo(
    () => ({
      type: '',
      group: '',
      q: '',
    }),
    []
  );

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultData);

  const [listChannelSearch, setListChannelSearch] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [selectedRows, setSelectedRows] = useState([]);

  const isOpen = !!(openModalAdd || openModalSearchTag);

  useEffect(() => {
    if (!isOpen) return;

    setForm(defaultData);
    setSelectedRows([]);

    const doFetch = async () => {
      setLoading(true);
      const response = await fetchAllChannels();
      let rows = [];
      if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
        rows = response.DT.DT.map((item) => ({
          id: item._id,
          channel: item.channel,
          name: item.name,
          deviceId: item.device?._id,
          deviceName: item.device?.name,
          symbol: item.symbol,
          unit: item.unit,
          dataFormat: item.dataFormat,
          selectMySQL: item.selectMySQL,
          selectSQL: item.selectSQL,
        }));

        if (actionDatabase === 'DATABASE MYSQL') {
          rows = rows.filter((r) => r.selectMySQL === true);
        }
        if (actionDatabase === 'DATABASE SQL') {
          rows = rows.filter((r) => r.selectSQL === true);
        }
      }
      setListChannelSearch(rows);
      setFilteredList(rows);
      setLoading(false);
    };

    doFetch();
  }, [isOpen, actionDatabase, defaultData]);

  const handleClose = () => {
    if (openModalAdd && handleCloseModalAdd) handleCloseModalAdd();
    if (openModalSearchTag && handleCloseModalSearchTag) handleCloseModalSearchTag();
    setForm(defaultData);
    setSelectedRows([]);
    setFilteredList(listChannelSearch);
  };

  const handleFilter = (value) => {
    setForm((prev) => ({ ...prev, q: value }));
    const v = (value || '').toLowerCase();
    const next = listChannelSearch.filter(
      (x) =>
        x.name?.toLowerCase().includes(v) ||
        x.channel?.toString().toLowerCase().includes(v) ||
        x.deviceName?.toLowerCase().includes(v) ||
        x.symbol?.toLowerCase().includes(v)
    );
    setFilteredList(next);
  };

  const columns = [
    { field: 'channel', headerName: 'Channel', width: 100, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180, align: 'center', headerAlign: 'center' },
    { field: 'deviceName', headerName: 'Device', flex: 1, minWidth: 160, align: 'center', headerAlign: 'center' },
    { field: 'symbol', headerName: 'Symbol', width: 100, align: 'center', headerAlign: 'center' },
    { field: 'unit', headerName: 'Unit', width: 100, align: 'center', headerAlign: 'center' },
  ];

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
          Tìm & chọn Tag
        </Typography>

        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 12,
            width: 36,
            height: 36,
          }}
        >
          <CancelIcon />
        </IconButton>

        <Box
          component="form"
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gap={2}
          mt={2}
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Bộ lọc cơ bản */}
          <TextField
            label="Tìm kiếm"
            value={form.q}
            variant="standard"
            onChange={(e) => handleFilter(e.target.value)}
            sx={{ gridColumn: '1 / -1' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* (tuỳ dự án) nếu cần chọn Group/Type từ dataConfig */}
          {Array.isArray(dataConfig) && dataConfig.length > 0 && (
            <>
              <TextField
                select
                label="Type"
                value={form.type}
                variant="standard"
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              >
                {dataConfig.map((c) => (
                  <MenuItem key={c.id || c._id || c.name} value={c.type}>
                    {c.type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Group"
                value={form.group}
                variant="standard"
                onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}
              >
                <MenuItem value="">—</MenuItem>
                {dataConfig.map((c) => (
                  <MenuItem key={c.id || c._id || c.name} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
        </Box>

        <Paper sx={{ height: 420, width: '100%', mt: 2 }}>
          <CustomDataGrid
            rows={filteredList}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            pagination
            checkboxSelection
            onRowSelectionModelChange={(rows) => setSelectedRows(rows)}
            loading={loading}
          />
          {loading && <Loading text="Đang tải dữ liệu..." />}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelPresentation />}
            sx={{ textTransform: 'none' }}
            onClick={handleClose}
          >
            Thoát
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<AddBoxIcon />}
            sx={{ ml: 1.5, textTransform: 'none' }}
            onClick={() => {
              if ((selectedRows || []).length === 0) {
                toast.warn('Chưa chọn tag nào');
                return;
              }
              socket.emit('CHANGE TAGNAME');
              toast.success('Đã chọn ' + selectedRows.length + ' tag');
              handleClose();
            }}
          >
            Chọn
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalSearchChannels;

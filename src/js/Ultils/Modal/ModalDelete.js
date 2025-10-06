import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const ModalDelete = (props) => {
    const { action, isShowModalDelete, handleCloseModalDelete, conformDeleteDevice, conformDeleteChannel, selectedCount } = props
    const handleDelete = () => {
        switch (action) {
            case 'CHANNEL':
                return conformDeleteChannel();
            case 'DEVICE':
                return conformDeleteDevice();
            default:
                return null;
        }
    };
    return (
        <Dialog
            open={isShowModalDelete} onClose={handleCloseModalDelete}
            // onClose={onClose}
            PaperProps={{
                sx: {
                    width: 400,              // chỉnh chiều rộng
                    bgcolor: "#f9f9f9",      // đổi màu background
                    borderRadius: 2,         // bo góc
                    p: 2,                    // padding
                },
            }}
        >
            {/* Tiêu đề */}
            <DialogTitle sx={{ fontWeight: 600, textAlign: "center", position: "relative", top: "-15px" }}>
                Xác nhận xoá?
            </DialogTitle>
            {/* Nút đóng */}
            <IconButton onClick={handleCloseModalDelete}
                sx={{ position: "absolute", right: 8, top: 8, }}
            >
                <CloseIcon />
            </IconButton>
            {/* Nội dung */}
            <DialogContent sx={{ fontWeight: 600, textAlign: "center", position: "relative", top: "-15px" }}>
                <Typography> Số hàng đã chọn : {selectedCount}</Typography>
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{ justifyContent: "center", gap: 5 }}>
                <Button
                    onClick={handleDelete}
                    variant="contained" sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }} >
                    Xác nhận
                </Button>
                <Button
                    onClick={() => handleCloseModalDelete()}
                    variant="contained"
                    sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
                >
                    Hủy
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ModalDelete;

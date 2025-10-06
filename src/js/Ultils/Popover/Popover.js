import { useState, useEffect } from "react";
import { Popover, Button, TextField, Box } from "@mui/material";

const InputPopover = ({
    anchorEl,               // hiển thị popover
    onClose,                // đóng popover
    onConfirm,              // xử lý khi nhấn Confirm
    defaultValue = 0,       // giá trị mặc định hiển thị khi mở
    // errorMessage = "Please enter a valid number (0 - 65535)"
}) => {
    const open = Boolean(anchorEl);

    const [inputValue, setInputValue] = useState(defaultValue);
    const [error, setError] = useState("");

    // reset mỗi lần popover mở lại
    useEffect(() => {
        if (open) {
            setInputValue(defaultValue);
            setError("");
        }
    }, [open, defaultValue]);

    const handleConfirm = () => {
        const num = Number(inputValue);
        // if (isNaN(num) || num < 0 || num > 65535) {
        //     setError(errorMessage);
        //     return;
        // }
        onConfirm(num);   // gửi giá trị về component cha
        onClose();        // đóng popover
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            slotProps={{
                paper: {
                    sx: {
                        width: 250,
                        mt: 1.2,
                        p: 0,
                        overflow: "visible",
                        position: "relative",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -8,
                            left: "calc(50% - 8px)",
                            width: 16,
                            height: 16,
                            bgcolor: "background.paper",
                            transform: "rotate(45deg)",
                            boxShadow: 1,
                            zIndex: 0,
                        },
                    },
                },
            }}
        >
            <Box sx={{ p: 2, position: "relative", zIndex: 1 }}>
                <TextField
                    fullWidth
                    label="Enter value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    error={!!error}
                    helperText={error}
                />
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                    <Button variant="outlined" onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm}>Confirm</Button>
                </Box>
            </Box>
        </Popover>
    );
};

export default InputPopover;

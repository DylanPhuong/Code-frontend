export default function useValidator() {
    //  Check bắt buộc
    const validateRequired = (value) => {
        return value !== undefined && value !== null && value !== "";
    };

    //  Check số
    const isNumber = (value) => {
        return value !== "" && !isNaN(Number(value));
    };

    //  Check số nguyên
    const isInteger = (value) => {
        return isNumber(value) && Number.isInteger(Number(value));
    };

    //  Check function text (nếu có code dạng eval)
    const isFunction = (data) => {
        try {
            // eslint-disable-next-line no-eval
            eval(data);
            return true;
        } catch {
            return false;
        }
    };

    const isNameFunction = (data) => {
        if (!isFunction(data)) {
            try {
                // eslint-disable-next-line no-eval
                eval(data);
                return true;
            } catch (error) {
                return error.message;
            }
        } else {
            if (
                data.includes("func(x)") ||
                data.includes("func (x)") ||
                data.includes("func( x )") ||
                data.includes("func ( x )")
            ) {
                return true;
            } else if (data.length > 0) {
                return "⚠️ Tên function không hợp lệ!";
            }
        }
        return true;
    };

    //  Hàm validate tổng
    const validate = (name, value) => {
        if (name !== "functionText" && !validateRequired(value)) {
            return "❌ Không được để trống!";
        }

        switch (name) {
            // Kiểm tra tên hàm hợp lệ
            case "functionText":
                return isNameFunction(value);

            // --- Integer ---
            case "interval":
            case "port":
            case "baudRate":
            case "slaveId":
            case "address":
            case "timeOut":
                if (!isInteger(value)) return "⚠️ Phải nhập số nguyên!";
                break;

            // --- Number ---
            case "offset":
            case "channel":
            case "gain":
            case "lowSet":
            case "highSet":
            case "idAddress":
                if (!isNumber(value)) return "⚠️ Phải nhập số!";
                break;

            default:
                return "";
        }
        return "";
    };

    //  Trả về object các hàm để dùng ở ngoài
    return { validate, validateRequired, isNumber, isInteger };
}

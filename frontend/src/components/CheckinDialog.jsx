import PropTypes from "prop-types"; // Import PropTypes
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";
import CameraComponent from "./Camera";

const CheckinDialog = ({ open, onClose, selectedClassroom }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 5, // Bo tròn góc
                    transition: 'transform 0.3s ease-in-out', // Hiệu ứng transition
                    overflow: 'hidden', // Ngăn ngừa scrollbar
                }
            }}
        >
            <DialogTitle>Thông báo</DialogTitle>
            <DialogContent sx={{ overflowY: 'auto' }}>
                <CameraComponent />
                <Typography sx={{ marginTop: 3, textAlign: 'center' }}>
                    Bạn đã check-in thành công lớp học {selectedClassroom ? selectedClassroom.name : "không xác định"}.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Ok
                </Button>
            </DialogActions>
        </Dialog>

    );
};

// Thêm PropTypes
CheckinDialog.propTypes = {
    open: PropTypes.bool.isRequired, // open phải là kiểu boolean và là bắt buộc
    onClose: PropTypes.func.isRequired, // onClose phải là một function và là bắt buộc
    selectedClassroom: PropTypes.shape({
        name: PropTypes.string.isRequired, // name của lớp học phải là một chuỗi và bắt buộc
        startTime: PropTypes.string.isRequired, // startTime phải là một chuỗi và bắt buộc
        endTime: PropTypes.string.isRequired, // endTime phải là một chuỗi và bắt buộc
        checkin: PropTypes.bool.isRequired, // checkin phải là một boolean và bắt buộc
    }).isRequired, // selectedClassroom là một object có các prop đã chỉ định và bắt buộc
};

export default CheckinDialog;

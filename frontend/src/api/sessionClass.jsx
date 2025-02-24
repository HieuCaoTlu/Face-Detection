import request from "./axiosClient";

export const getClassSessions = async () => {
    try {
        const response = await request("GET", "/class_session", { day: true });
        
        if (response.data.status === "success") {
            const classSessions = response.data.class_sessions;
            return classSessions;
        } else {
            return []; // Trả về mảng rỗng nếu không có dữ liệu
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
        return []; // Tránh lỗi map
    }
};
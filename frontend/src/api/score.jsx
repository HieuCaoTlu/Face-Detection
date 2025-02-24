import request from "./axiosClient";

export const getScores = async () => {
    try {
        const response = await request("GET", "/score");

        if (response.data.status === "success") {
            const scores = response.data.scores;
            return scores;
        } else {
            return []; // Trả về mảng rỗng nếu không có dữ liệu
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách điểm:", error);
        return []; // Tránh lỗi map
    }
};

export const updateScores = async (classroom_id, student_ids, scores) => {
    try {
        const formData = new FormData();
        formData.append("classroom_id", classroom_id);
        formData.append("student_ids", student_ids);
        formData.append("scores", scores);
        await request("POST", "/score/", formData)
    } catch (error) {
        console.error("Lỗi khi lấy danh sách điểm:", error);
        return []; // Tránh lỗi map
    }
}
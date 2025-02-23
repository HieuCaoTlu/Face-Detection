import request from "./axiosClient";

export const faceAuth = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await request("POST", "/face_auth/", formData)
    console.log("✅ Kết quả nhận diện:", response.data);
    return response;
};

export const applyFaceAuth = async (files) => {
    const formData = new FormData()
    files.forEach(file => {
        formData.append("images", file);
    });
    const response = await request("POST", "/apply_face_auth/", formData)
    console.log("✅ Kết quả huấn luyện:", response.data);
    return response;
}

import request from "./axiosClient";

export const faceAuth = async (file, id) => {
    const formData = new FormData();
    formData.append("image", file);
    console.log(id)
    if (id != -1) formData.append("class_session_id", id);
    const response = await request("POST", "/face_auth/", formData)
    console.log("✅ Kết quả nhận diện:", response.data);
    return response.data.valid;
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

export const getFaceAuth = async () => {
    const response = await request("GET", "/face_auth/")
    return response.data.logs
}

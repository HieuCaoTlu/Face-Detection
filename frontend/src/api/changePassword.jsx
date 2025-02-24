import request from "./axiosClient";

export const changePassword = async (old_password, new_password) => {
    const formData = new FormData();
    formData.append("old_password", old_password);
    formData.append("new_password", new_password);
    const response = await request("POST", "/change_password/", formData)
    console.log(response)
    return response
};
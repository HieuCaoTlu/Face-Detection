import request from "./axiosClient";

export const login = async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    const response = await request("POST", "/login/", formData)
    return response
};

export const getUser = async () => {
    return request("GET", "/info/");
};

export const logout = async () => {
    return request("POST", "/logout/");
};


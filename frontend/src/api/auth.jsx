import request from "./axiosClient";

export const login = async (username, password) => {
    return request("POST", "/login/", { username, password });
};

export const getUser = async () => {
    return request("GET", "/info/");
};

export const logout = async () => {
    return request("POST", "/logout/");
};


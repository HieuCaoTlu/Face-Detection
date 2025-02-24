import request from "./axiosClient";

export const getClassroom = async () => {
    return await request("GET", "/classroom/");
};
import request from "./axiosClient";

export const getTeacherClassrooms = async () => {
    return await request("GET", "/classroom/");
};

export const getClassroomScore = async (clasroom_id) => {
    return await request("GET", `/score/${clasroom_id}/`)
}
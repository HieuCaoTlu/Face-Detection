import request from "./axiosClient";

export const createStudent = async (file, role="student") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role",role)
    const response = await request("POST", "/add_students/", formData)
    return response
}

export const getTeacherClassroomsWithStudent = async () => {
    return await request("GET", "/classroom/?student=True");
};

export const addStudentClassroom = async (classroom_id, student_ids) => {
    const formData = new FormData()
    formData.append('classroom_id',classroom_id)
    formData.append('student_ids', student_ids)
    return await request("POST","attendance/", formData)
}

export const getStudent = async() => {
    const response = await request("GET","/student")
    return response.data.students
}

export const postStudentPrint = async(file) => {
    const formData = new FormData()
    formData.append('file',file)
    const response = await request("POST","/all_student/", formData)
    return response.data.students
}

export const getStudentPrint = async(classroom_id) => {
    return await request("GET",`/add_students/?classroom_id=${classroom_id}`)
}

export const getTeacher = async() => {
    const response = await request("GET","/teacher")
    return response.data.teachers
}

export const makeClassroom = async (name, weeks, start_date, sessions, teacher_id, student_ids) => {
    const body = {
        name: name,
        weeks: weeks,
        start_date: start_date,
        sessions: sessions,
        teacher_id: teacher_id,
        student_ids: student_ids
    };
    const response = await request("POST", "/classroom/", body);
    return response.data.classroom;
};

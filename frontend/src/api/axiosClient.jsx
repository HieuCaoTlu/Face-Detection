import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8000", // API Backend Django
    withCredentials: true, // Giúp Django xử lý session/cookie
});

axiosClient.interceptors.response.use(
    (response) => {
        console.log("[API Response]:", response);
        return response;
    },
    (error) => {
        console.error("[API Error]:", error.response || error);
        return Promise.reject(error);
    }
);

const request = (method, url, data = null) => {
    let options = {
        method,
        url,
        withCredentials: true,
        headers: {}
    };

    if (data) {
        if (method === "POST") {
            options.data = data;
            if (data instanceof FormData) {
                options.headers["Content-Type"] = "multipart/form-data";
            }
        } else if (method === "PUT" || method === "PATCH") {
            options.data = JSON.stringify(data);
            options.headers["Content-Type"] = "application/json";
        } else {
            options.params = data;
        }
    }

    // Tự động lấy CSRF token từ cookie
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
        options.headers["X-CSRFToken"] = csrfToken;
    }

    return axiosClient(options); // Chỉ gọi axiosClient, không gọi lại request!
};

// Hàm lấy CSRF token từ cookie
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
};

export default request;

import { useState, useEffect } from "react";
import { getUser, logout, login } from "../../api/auth";
import { AuthContext } from "./AuthContext";
import PropTypes from "prop-types";

export const AuthProvider = ({ children }) => {
    // Lấy user từ sessionStorage nếu có
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Mỗi khi user thay đổi, cập nhật vào sessionStorage
    useEffect(() => {
        if (user) {
            sessionStorage.setItem("user", JSON.stringify(user));
        } else {
            sessionStorage.removeItem("user");
        }
    }, [user]);

    const handleLogin = async (username, password) => {
        try {
            const loginResponse = await login(username, password);
            const res = await getUser();
            setUser({
                ...res.data,          // Giữ lại tất cả thông tin trong res.data
                role: loginResponse.data.role // Thêm trường role vào user
            })
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            window.location.href = "/login"
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

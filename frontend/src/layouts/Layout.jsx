import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/auth_context/useAuth";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Container } from "@mui/material";

export default function Layout({ children }) {
    const { user } = useAuth();
    const theme = useTheme();
    if (!user) return <Navigate to="/login" />;

    return (
        <div style={{
            display: "flex",
            backgroundColor: theme.palette.mode === "dark" ? "rgba(33, 33, 33, 0.9)" : "#f0f6fc",
            height: "100vh"
        }}>
            <Sidebar />
            <div style={{ flexGrow: 1, padding: "16px", color: theme.palette.text.primary }}>
                <Container maxWidth="2xlg" sx={{ padding: 3 }}>
                    {children}
                </Container>
            </div>
        </div>
    );
}


Layout.propTypes = {
    children: PropTypes.node.isRequired,
};
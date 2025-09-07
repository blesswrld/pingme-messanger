import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import useThemeStore from "./store/useThemeStore";
import ThemeSettings from "./pages/ThemeSettings";
import PrivacySettingsPage from "./pages/PrivacySettingsPage";

export const App = () => {
    const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
    const { theme } = useThemeStore();

    console.log({ onlineUsers });

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    console.log({ authUser });

    if (isCheckingAuth && !authUser)
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );

    return (
        <div data-theme={theme}>
            <Navbar />
            <Routes>
                <Route
                    path="/"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/signup"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/settings"
                    element={
                        authUser ? <SettingsPage /> : <Navigate to="/login" />
                    }
                >
                    <Route index element={<Navigate to="themes" replace />} />
                    <Route path="themes" element={<ThemeSettings />} />
                    <Route path="privacy" element={<PrivacySettingsPage />} />
                </Route>
                <Route
                    path="/profile"
                    element={
                        authUser ? (
                            <Navigate to={`/profile/${authUser._id}`} replace />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/profile/:userId"
                    element={
                        authUser ? <ProfilePage /> : <Navigate to="/login" />
                    }
                />
            </Routes>
            <Toaster />
        </div>
    );
};

export default App;

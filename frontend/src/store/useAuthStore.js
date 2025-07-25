import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import i18n from "../i18n.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfilePic: false,
    isUpdatingProfile: false,
    isUpdatingBio: false,
    isUpdatingUsername: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    isUpdatingTheme: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in CheckAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success(i18n.t("profilePage.accountCreatedSuccess"));
            get().connectSocket();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    i18n.t("profilePage.signupError")
            );
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success(i18n.t("profilePage.loginSuccess"));
            get().connectSocket();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    i18n.t("profilePage.loginError")
            );
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success(i18n.t("profilePage.logoutSuccess"));
            get().disconnectSocket();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    i18n.t("profilePage.logoutError")
            );
        }
    },

    updateProfilePic: async (profilePic) => {
        set({ isUpdatingProfilePic: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", {
                profilePic,
            });

            set({ authUser: res.data });
            toast.success(i18n.t("profilePage.profilePicUpdateSuccess"));
            return res.data;
        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(
                error.response?.data?.message ||
                    i18n.t("profilePage.profilePicUpdateError")
            );
            return false;
        } finally {
            set({ isUpdatingProfilePic: false });
        }
    },

    updateBio: async (bio) => {
        set({ isUpdatingBio: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", {
                bio,
            });
            set({ authUser: res.data });
            toast.success(i18n.t("profilePage.bioUpdateSuccess"));
            return true;
        } catch (error) {
            console.log("Failed to update bio:", error);
            toast.error(
                error.response?.data?.message ||
                    i18n.t("profilePage.bioUpdateError")
            );
            return false;
        } finally {
            set({ isUpdatingBio: false });
        }
    },

    updateUsername: async (fullName) => {
        set({ isUpdatingUsername: true });

        try {
            const res = await axiosInstance.put("/auth/update-profile", {
                fullName,
            });

            set({ authUser: res.data });
            toast.success(i18n.t("profilePage.usernameUpdateSuccess"));
            return true;
        } catch (error) {
            console.error("Error updating username:", error);
            toast.error(
                error.response?.data?.message ||
                    i18n.t("profilePage.usernameUpdateError")
            );
            return false;
        } finally {
            set({ isUpdatingUsername: false });
        }
    },

    updateProfileTheme: async (theme) => {
        set({ isUpdatingTheme: true });
        try {
            const res = await axiosInstance.post("/auth/update-theme", {
                theme,
            });
            set((state) => ({
                authUser: state.authUser
                    ? { ...state.authUser, profileTheme: res.data.theme }
                    : null,
            }));
            toast.success(i18n.t("profilePage.themeUpdatedSuccess"));
            return true;
        } catch (error) {
            console.error("Error updating profile theme:", error);
            const errorMessage =
                error.response?.data?.error ||
                i18n.t("profilePage.themeUpdatedError");
            toast.error(errorMessage);
            return false;
        } finally {
            set({ isUpdatingTheme: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));

import React, { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import useThemeStore from "../store/useThemeStore";
import useChatStore from "../store/useChatStore";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const { setSelectedUser } = useChatStore();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    const handleLogoClick = () => {
        setSelectedUser(null); // Сбрасываем выбранного пользователя
    };

    return (
        <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="w-9 h-9 rounded-lg bg-primary/100 flex items-center justify-center"
                            onClick={handleLogoClick} // Добавляем onClick
                        >
                            <div className="w-9 h-9 rounded-lg bg-primary/100 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">PingMe</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="flex cursor-pointer gap-2 items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                            </svg>
                            <input
                                type="checkbox"
                                className="toggle toggle-sm"
                                checked={theme === "dark"}
                                onChange={toggleTheme}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        </label>

                        <Link
                            to={"/settings"}
                            className={`btn btn-sm gap-2 transition-colors`}
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>

                        {authUser && (
                            <>
                                <Link
                                    to={"/profile"}
                                    className={`btn btn-sm gap-2`}
                                >
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">
                                        Profile
                                    </span>
                                </Link>

                                <button
                                    className="flex gap-2 items-center"
                                    onClick={logout}
                                >
                                    <Link
                                        to={"/login"}
                                        className={`btn btn-sm gap-2`}
                                    >
                                        <LogOut className="size-5" />
                                        <span className="hidden sm:inline">
                                            Logout
                                        </span>
                                    </Link>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

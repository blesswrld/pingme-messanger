import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
    LogOut,
    MessageSquareText,
    Settings,
    User,
    Sun,
    Moon,
    Menu,
    X,
    Languages, // Иконка для выбора языка
} from "lucide-react";
import { Link } from "react-router-dom";
import useThemeStore from "../store/useThemeStore";
import useChatStore from "../store/useChatStore";
import { useTranslation } from "react-i18next"; // Хук для получения переводов

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const { setSelectedUser } = useChatStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { t, i18n } = useTranslation(); // t - функция для перевода, i18n - экземпляр i18next

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    const handleLogoClick = () => {
        setSelectedUser(null);
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsMenuOpen(false); // Закрываем меню при смене языка на мобильных
    };

    const availableLanguages = [
        { code: "ru", name: t("languages.ru") },
        { code: "en", name: t("languages.en") },
    ];

    return (
        <div className="navbar bg-base-100 border-b border-base-300 fixed top-0 z-40 h-16 min-h-16 backdrop-blur-lg bg-opacity-80">
            <div className="navbar-start">
                <Link
                    to="/"
                    className="btn btn-ghost text-xl font-bold text-primary gap-2"
                    onClick={handleLogoClick}
                >
                    <MessageSquareText className="w-6 h-6" />
                    {t("navbar.pingMe")}
                </Link>
            </div>

            <div className="navbar-end hidden md:flex gap-2 lg:gap-3 items-center">
                <label className="flex cursor-pointer gap-2 items-center p-2 rounded-lg hover:bg-base-200 transition-colors">
                    <Sun
                        className={`w-5 h-5 ${
                            theme === "light"
                                ? "text-primary"
                                : "text-base-content/70"
                        }`}
                    />
                    <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={theme === "dark"}
                        onChange={toggleTheme}
                        aria-label={t("navbar.toggleTheme")}
                    />
                    <Moon
                        className={`w-5 h-5 ${
                            theme === "dark"
                                ? "text-primary"
                                : "text-base-content/70"
                        }`}
                    />
                </label>

                {/* Выбор языка для десктопа */}
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle"
                        aria-label={t("navbar.language")}
                    >
                        <div
                            className="tooltip tooltip-bottom"
                            data-tip={t("navbar.language")}
                        >
                            <Languages className="w-5 h-5" />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-40"
                    >
                        {availableLanguages.map((lang) => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => changeLanguage(lang.code)}
                                    className={
                                        i18n.resolvedLanguage === lang.code
                                            ? "active"
                                            : ""
                                    }
                                >
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    className="tooltip tooltip-bottom"
                    data-tip={t("navbar.settings")}
                >
                    <Link to={"/settings"} className="btn btn-ghost btn-circle">
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>

                {authUser && (
                    <>
                        <div
                            className="tooltip tooltip-bottom"
                            data-tip={t("navbar.profile")}
                        >
                            <Link
                                to={"/profile"}
                                className="btn btn-ghost btn-circle"
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        </div>

                        <div
                            className="tooltip tooltip-bottom"
                            data-tip={t("navbar.logout")}
                        >
                            <button
                                className="btn btn-ghost btn-circle"
                                onClick={logout}
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Бургер-меню для мобильных устройств */}
            <div className="navbar-end md:hidden">
                <button
                    className="btn btn-ghost btn-circle"
                    onClick={toggleMenu}
                    aria-label={
                        isMenuOpen
                            ? t("navbar.closeMenu")
                            : t("navbar.openMenu")
                    }
                >
                    {isMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Мобильное меню */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-base-100 border-b border-base-300 shadow-md md:hidden">
                    <div className="flex flex-col p-4 gap-3">
                        <label className="flex cursor-pointer gap-2 items-center p-2 rounded-lg hover:bg-base-200 transition-colors">
                            <Sun
                                className={`w-5 h-5 ${
                                    theme === "light"
                                        ? "text-primary"
                                        : "text-base-content/70"
                                }`}
                            />
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm"
                                checked={theme === "dark"}
                                onChange={toggleTheme}
                                aria-label={t("navbar.toggleTheme")}
                            />
                            <Moon
                                className={`w-5 h-5 ${
                                    theme === "dark"
                                        ? "text-primary"
                                        : "text-base-content/70"
                                }`}
                            />
                        </label>

                        {/* Выбор языка для мобильного меню */}
                        <div className="collapse collapse-arrow bg-base-200/50 rounded-lg">
                            <input type="checkbox" name="language-accordion" />
                            <div className="collapse-title text-md font-medium flex items-center gap-2">
                                <Languages className="w-5 h-5" />
                                {t("navbar.language")}
                            </div>
                            <div className="collapse-content">
                                <ul className="menu p-0">
                                    {availableLanguages.map((lang) => (
                                        <li key={lang.code}>
                                            <button
                                                onClick={() =>
                                                    changeLanguage(lang.code)
                                                }
                                                className={`w-full justify-start ${
                                                    i18n.resolvedLanguage ===
                                                    lang.code
                                                        ? "active btn-active"
                                                        : ""
                                                }`}
                                            >
                                                {lang.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <Link
                            to={"/settings"}
                            className="btn btn-ghost justify-start gap-2"
                            onClick={toggleMenu}
                        >
                            <Settings className="w-5 h-5" />
                            {t("navbar.settings")}
                        </Link>

                        {authUser && (
                            <>
                                <Link
                                    to={"/profile"}
                                    className="btn btn-ghost justify-start gap-2"
                                    onClick={toggleMenu}
                                >
                                    <User className="w-5 h-5" />
                                    {t("navbar.profile")}
                                </Link>

                                <button
                                    className="btn btn-ghost justify-start gap-2"
                                    onClick={() => {
                                        logout();
                                        toggleMenu();
                                    }}
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t("navbar.logout")}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;

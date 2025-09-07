import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Paintbrush, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen pt-20 bg-base-200">
            <div className="max-w-5xl mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Навигация по настройкам */}
                    <aside className="md:col-span-1">
                        <ul className="menu rounded-box shadow-lg h-fit w-full">
                            <li>
                                <NavLink
                                    to="/settings/themes"
                                    className={({ isActive }) =>
                                        `text-base ${
                                            isActive
                                                ? "bg-primary text-primary-content mb-1"
                                                : ""
                                        }`
                                    }
                                >
                                    <Paintbrush size={18} />
                                    {t("settingsPage.themeTitle")}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/settings/privacy"
                                    className={({ isActive }) =>
                                        `text-base ${
                                            isActive
                                                ? "bg-primary text-primary-content mt-1"
                                                : ""
                                        }`
                                    }
                                >
                                    <Shield size={18} />
                                    {t("settingsPage.privacyTitle", "Privacy")}
                                </NavLink>
                            </li>
                        </ul>
                    </aside>

                    {/* Контент под-страницы */}
                    <main className="md:col-span-3">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

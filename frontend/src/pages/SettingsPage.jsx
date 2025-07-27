import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Paintbrush, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen pt-20 bg-base-200">
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Навигация по настройкам */}
                    <aside className="md:col-span-1">
                        <ul className="menu bg-base-100 rounded-box shadow-lg">
                            <li>
                                <NavLink
                                    to="/settings/themes"
                                    className="text-base"
                                >
                                    <Paintbrush size={18} />
                                    {t("settingsPage.themeTitle")}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/settings/privacy"
                                    className="text-base"
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

import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";

const PrivacySettingItem = ({ label, value, onChange }) => {
    const { t } = useTranslation();
    return (
        <div>
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <select
                className="select select-bordered w-full focus:border-primary focus-within:border-primary focus:outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="everyone">
                    {t("settingsPage.privacy.everyone")}
                </option>
                <option value="contacts">
                    {t("settingsPage.privacy.contacts")}
                </option>
            </select>
        </div>
    );
};

const PrivacySettingsPage = () => {
    const { t } = useTranslation();
    const { authUser, updatePrivacySettings, isUpdatingPrivacy } =
        useAuthStore();
    const [settings, setSettings] = useState(authUser.privacySettings);

    const handleSettingChange = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: { ...prev[key], visibility: value },
        }));
    };

    const handleSaveChanges = () => {
        updatePrivacySettings(settings);
    };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{t("settingsPage.privacyTitle")}</h2>
                <p className="text-base-content/70">
                    {t("settingsPage.privacySubtitle")}
                </p>

                <div className="space-y-4 mt-4">
                    <PrivacySettingItem
                        label={t("settingsPage.privacy.whoCanSeeEmail")}
                        value={settings.email.visibility}
                        onChange={(value) =>
                            handleSettingChange("email", value)
                        }
                    />
                    <PrivacySettingItem
                        label={t("settingsPage.privacy.whoCanSeeBio")}
                        value={settings.bio.visibility}
                        onChange={(value) => handleSettingChange("bio", value)}
                    />
                </div>

                <div className="card-actions justify-end mt-6">
                    <button
                        className="btn btn-primary"
                        onClick={handleSaveChanges}
                        disabled={isUpdatingPrivacy}
                    >
                        {isUpdatingPrivacy && (
                            <span className="loading loading-spinner"></span>
                        )}
                        {t("profilePage.save")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettingsPage;

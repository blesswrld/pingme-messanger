import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import {
    Camera,
    /* Mail, */
    User,
    Check,
    X,
    Edit3,
    MessageSquare,
    CalendarDays,
    BadgeCheck,
    Send,
    ArrowLeft,
    Palette,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import AchievementBadge from "../components/AchievementBadge";

// Компонент палитры
const ThemePalette = ({ currentTheme, onThemeChange, isLoading }) => {
    const { t } = useTranslation();
    const themes = [
        "primary",
        "secondary",
        "accent",
        "neutral",
        "info",
        "success",
        "warning",
        "error",
        "red",
        "orange",
        "lime",
        "teal",
        "cyan",
        "indigo",
        "violet",
        "rose",
    ];
    const themeClasses = {
        primary: "bg-primary",
        secondary: "bg-secondary",
        accent: "bg-accent",
        neutral: "bg-neutral",
        info: "bg-info",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        red: "bg-red-500",
        orange: "bg-orange-500",
        lime: "bg-lime-500",
        teal: "bg-teal-500",
        cyan: "bg-cyan-500",
        indigo: "bg-indigo-500",
        violet: "bg-violet-500",
        rose: "bg-rose-500",
    };

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm btn-circle glass"
                disabled={isLoading}
                aria-label={t("profilePage.editTheme")}
            >
                {isLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : (
                    <Palette className="w-5 h-5" />
                )}
            </div>
            <div
                tabIndex={0}
                className="dropdown-content z-[1] mt-2 p-2 shadow bg-base-100 rounded-box w-52"
            >
                <div className="grid grid-cols-4 gap-2">
                    {themes.map((theme) => (
                        <button
                            key={theme}
                            onClick={() => onThemeChange(theme)}
                            className={`w-10 h-10 rounded-full border-2 transition-transform duration-200 hover:scale-110 ${
                                currentTheme === theme
                                    ? "border-base-content ring-2 ring-offset-2 ring-offset-base-100 ring-current"
                                    : "border-transparent"
                            } ${themeClasses[theme]}`}
                            aria-label={t("profilePage.selectTheme", { theme })}
                            disabled={isLoading}
                        ></button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { t } = useTranslation();
    const {
        authUser,
        isCheckingAuth,
        updateProfilePic,
        isUpdatingProfilePic,
        updateBio,
        isUpdatingBio,
        updateUsername,
        isUpdatingUsername,
        updateProfileTheme,
        isUpdatingTheme,
    } = useAuthStore();
    const { setSelectedUser } = useChatStore();
    const navigate = useNavigate();
    const { userId } = useParams();

    const [profileUserData, setProfileUserData] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(null);
    const [bio, setBio] = useState("");
    const [isBioEditing, setIsBioEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [isUsernameEditing, setIsUsernameEditing] = useState(false);
    const fileInputRef = useRef(null);

    const isViewingOwnProfile = authUser && userId === authUser._id;

    useEffect(() => {
        const fetchProfileData = async () => {
            const targetUserId = userId;
            if (!targetUserId) return;
            setIsProfileLoading(true);
            try {
                const res = await axiosInstance.get(
                    `/users/profile/${targetUserId}`
                );
                setProfileUserData(res.data);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                toast.error(t("profilePage.errorLoadingProfile"));
                setProfileUserData(null);
            } finally {
                setIsProfileLoading(false);
            }
        };

        if (!isCheckingAuth) {
            fetchProfileData();
        }
    }, [userId, isCheckingAuth, t, authUser]); // Добавляем authUser в зависимости, чтобы профиль обновлялся

    useEffect(() => {
        if (profileUserData) {
            setBio(profileUserData.bio || "");
            setUsername(profileUserData.fullName || "");
        }
    }, [profileUserData]);

    const handleUpdateProfilePic = useCallback(
        async (base64Image) => {
            const updatedUser = await updateProfilePic(base64Image);
            if (updatedUser) {
                // Обновляем локальное состояние после успешного ответа от сервера
                setProfileUserData((prev) => ({
                    ...prev,
                    profilePic: updatedUser.profilePic,
                }));
            }
            setSelectedImg(null);
        },
        [updateProfilePic]
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result;
            if (typeof base64Image === "string") {
                setSelectedImg(base64Image);
                handleUpdateProfilePic(base64Image);
            } else {
                toast.error(t("profilePage.failedToReadImage"));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveBio = async () => {
        if (bio === (profileUserData?.bio || "")) {
            setIsBioEditing(false);
            return;
        }
        const updatedUser = await updateBio(bio);
        if (updatedUser) {
            setProfileUserData((prev) => ({ ...prev, bio: updatedUser.bio }));
        }
        setIsBioEditing(false);
    };

    const handleCancelBioEdit = () => {
        setIsBioEditing(false);
        setBio(profileUserData?.bio || "");
    };

    const handleSaveUsername = async () => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername || trimmedUsername === profileUserData?.fullName) {
            setIsUsernameEditing(false);
            setUsername(profileUserData?.fullName || "");
            return;
        }
        if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
            toast.error(t("profilePage.usernameLengthError"));
            return;
        }
        const updatedUser = await updateUsername(trimmedUsername);
        if (updatedUser) {
            setProfileUserData((prev) => ({
                ...prev,
                fullName: updatedUser.fullName,
            }));
        }
        setIsUsernameEditing(false);
    };

    const handleCancelUsernameEdit = () => {
        setIsUsernameEditing(false);
        setUsername(profileUserData?.fullName || "");
    };

    const handleSendMessageClick = () => {
        if (profileUserData) {
            setSelectedUser(profileUserData);
            navigate("/");
        }
    };
    const handleBackClick = () => navigate(-1);
    const isAnyLoading =
        isUpdatingProfilePic ||
        isUpdatingBio ||
        isUpdatingUsername ||
        isUpdatingTheme;

    if (isCheckingAuth || isProfileLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base-100">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (!profileUserData) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base-100">
                <p className="text-xl text-error">
                    {t("profilePage.userNotFound")}
                </p>
            </div>
        );
    }

    const gradientClasses = {
        primary: "from-primary to-primary/70",
        secondary: "from-secondary to-secondary/70",
        accent: "from-accent to-accent/70",
        neutral: "from-neutral to-neutral/70",
        info: "from-info to-info/70",
        success: "from-success to-success/70",
        warning: "from-warning to-warning/70",
        error: "from-error to-error/70",
        red: "from-red-500 to-red-500/70",
        orange: "from-orange-500 to-orange-500/70",
        lime: "from-lime-500 to-lime-500/70",
        teal: "from-teal-500 to-teal-500/70",
        cyan: "from-cyan-500 to-cyan-500/70",
        indigo: "from-indigo-500 to-indigo-500/70",
        violet: "from-violet-500 to-violet-500/70",
        rose: "from-rose-500 to-rose-500/70",
    };
    const currentGradient =
        gradientClasses[profileUserData?.profileTheme || "primary"] ||
        gradientClasses.primary;

    return (
        <div className="min-h-screen bg-base-200 pt-16 pb-12 font-sans">
            {!isViewingOwnProfile && (
                <div className="absolute top-20 left-4 z-20">
                    <button
                        className="btn btn-circle"
                        onClick={handleBackClick}
                        aria-label={t("profilePage.backButtonAriaLabel")}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4">
                <div className="relative mb-24">
                    <div
                        className={`h-48 rounded-box shadow-lg transition-all duration-500 bg-gradient-to-r mt-2 ${currentGradient}`}
                    >
                        {isViewingOwnProfile && (
                            <div className="absolute top-2 right-2">
                                <ThemePalette
                                    currentTheme={
                                        profileUserData?.profileTheme ||
                                        "primary"
                                    }
                                    onThemeChange={updateProfileTheme}
                                    isLoading={isUpdatingTheme}
                                />
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-40">
                        <div
                            className={`relative group w-full h-full ${
                                isViewingOwnProfile ? "cursor-pointer" : ""
                            }`}
                            onClick={() =>
                                isViewingOwnProfile &&
                                !isUpdatingProfilePic &&
                                fileInputRef.current?.click()
                            }
                        >
                            <div className="avatar w-full h-full">
                                <div className="w-full h-full rounded-full ring-4 ring-base-200 shadow-xl">
                                    <img
                                        src={
                                            selectedImg ||
                                            profileUserData?.profilePic ||
                                            "/avatar.png"
                                        }
                                        alt={profileUserData?.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            {isViewingOwnProfile && (
                                <div
                                    className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-full transition-all duration-300 ${
                                        isUpdatingProfilePic
                                            ? "bg-opacity-60"
                                            : ""
                                    }`}
                                >
                                    {isUpdatingProfilePic ? (
                                        <span className="loading loading-spinner loading-lg text-white"></span>
                                    ) : (
                                        <Camera className="w-10 h-10 text-white opacity-0 group-hover:opacity-100" />
                                    )}
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={
                                    isUpdatingProfilePic || !isViewingOwnProfile
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-base-content">
                        {profileUserData?.fullName}
                    </h1>
                    <p className="text-base-content/70 mt-1">
                        {profileUserData?.email}
                    </p>
                </div>

                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col gap-8 w-full">
                        <div className="card bg-base-100 shadow-lg p-5">
                            <div className="flex flex-col space-y-6">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="label py-0">
                                            <span className="label-text text-base-content/70 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {t("profilePage.usernameLabel")}
                                            </span>
                                        </label>
                                        {isViewingOwnProfile &&
                                            !isUsernameEditing && (
                                                <div
                                                    className="tooltip tooltip-left"
                                                    data-tip={t(
                                                        "profilePage.editUsername"
                                                    )}
                                                >
                                                    <button
                                                        className="btn btn-ghost btn-xs p-1 h-auto min-h-0 text-primary"
                                                        onClick={() =>
                                                            setIsUsernameEditing(
                                                                true
                                                            )
                                                        }
                                                        disabled={isAnyLoading}
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                    </div>
                                    {isViewingOwnProfile &&
                                    isUsernameEditing ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                placeholder={t(
                                                    "profilePage.usernameLabel"
                                                )}
                                                className="input input-bordered input-primary w-full flex-grow text-sm focus:outline-none"
                                                value={username}
                                                onChange={(e) =>
                                                    setUsername(e.target.value)
                                                }
                                                maxLength={30}
                                                disabled={isUpdatingUsername}
                                                autoFocus
                                            />
                                            <div
                                                className="tooltip"
                                                data-tip={t("profilePage.save")}
                                            >
                                                <button
                                                    className="btn btn-success btn-sm btn-square"
                                                    onClick={handleSaveUsername}
                                                    disabled={
                                                        isUpdatingUsername ||
                                                        !username.trim() ||
                                                        username.trim().length <
                                                            3 ||
                                                        username.trim() ===
                                                            profileUserData?.fullName
                                                    }
                                                >
                                                    {isUpdatingUsername ? (
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <div
                                                className="tooltip"
                                                data-tip={t(
                                                    "profilePage.cancel"
                                                )}
                                            >
                                                <button
                                                    className="btn btn-error btn-outline btn-sm btn-square"
                                                    onClick={
                                                        handleCancelUsernameEdit
                                                    }
                                                    disabled={
                                                        isUpdatingUsername
                                                    }
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center px-4 py-2.5 bg-base-200 rounded-lg min-h-[2.5rem] w-full text-left">
                                            <span className="text-sm text-base-content">
                                                {profileUserData?.fullName}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card bg-base-100 shadow-lg p-5">
                            <div className="flex flex-col space-y-4">
                                <h2 className="text-lg font-medium text-base-content">
                                    {t("profilePage.accountInfoTitle")}
                                </h2>
                                <div className="bg-base-200 rounded-lg p-4  border-base-content/10">
                                    <div className="flex flex-col space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-base-content/70">
                                                <CalendarDays className="w-4 h-4" />
                                                {t("profilePage.memberSince")}
                                            </span>
                                            <span className="text-base-content">
                                                {profileUserData?.createdAt
                                                    ? new Date(
                                                          profileUserData.createdAt
                                                      ).toLocaleDateString()
                                                    : "Invalid date"}
                                            </span>
                                        </div>
                                        <hr className="border-base-content/10" />
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-base-content/70">
                                                <BadgeCheck className="w-4 h-4" />
                                                {t("profilePage.accountStatus")}
                                            </span>
                                            <div className="badge badge-success badge-outline">
                                                {t("profilePage.active")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full card bg-base-100 shadow-lg p-5 h-full">
                        <div className="flex flex-col space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="label py-0">
                                    <span className="label-text text-base-content/70 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        {t("profilePage.bioLabel")}
                                    </span>
                                </label>
                                {isViewingOwnProfile && !isBioEditing && (
                                    <div
                                        className="tooltip tooltip-left"
                                        data-tip={t("profilePage.editBio")}
                                    >
                                        <button
                                            className="btn btn-ghost btn-xs p-1 h-auto min-h-0 text-primary"
                                            onClick={() =>
                                                setIsBioEditing(true)
                                            }
                                            disabled={isAnyLoading}
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {isViewingOwnProfile && isBioEditing ? (
                                <div className="flex flex-col space-y-2">
                                    <textarea
                                        placeholder={t("profilePage.bioLabel")}
                                        className="textarea textarea-bordered textarea-primary w-full text-sm resize-none focus:outline-none"
                                        rows={5}
                                        maxLength={210}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        disabled={isUpdatingBio}
                                        autoFocus
                                    ></textarea>
                                    <div className="flex justify-end items-center space-x-2">
                                        <span className="text-xs text-base-content/60">
                                            {bio.length}/210
                                        </span>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={handleSaveBio}
                                            disabled={
                                                isUpdatingBio ||
                                                bio ===
                                                    (profileUserData?.bio || "")
                                            }
                                        >
                                            {isUpdatingBio ? (
                                                <span className="loading loading-spinner loading-xs mr-1"></span>
                                            ) : (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            {t("profilePage.save")}
                                        </button>
                                        <button
                                            className="btn btn-error btn-outline btn-sm"
                                            onClick={handleCancelBioEdit}
                                            disabled={isUpdatingBio}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            {t("profilePage.cancel")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-1 py-2.5 text-sm text-base-content/90 whitespace-pre-wrap min-h-[6rem]">
                                    {profileUserData?.bio || (
                                        <span className="italic opacity-70">
                                            {isViewingOwnProfile
                                                ? t("profilePage.addBioHint")
                                                : t("profilePage.noBioYet")}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card max-w-3xl mx-auto bg-base-100 shadow-xl p-6 md:p-8 mt-8">
                    <div className="card-body p-0">
                        <h2 className="text-lg font-medium text-base-content mb-4">
                            {t("achievements.title")}
                        </h2>
                        {profileUserData?.achievements &&
                        profileUserData.achievements.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {profileUserData.achievements.map(
                                    (achId, index) => (
                                        <AchievementBadge
                                            key={achId}
                                            achievementId={achId}
                                            index={index}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-base-content/70 italic">
                                {t("achievements.noAchievements")}
                            </p>
                        )}
                    </div>
                </div>

                {!isViewingOwnProfile && (
                    <div className="mt-8 flex justify-center">
                        <button
                            className="btn btn-primary btn-lg shadow-lg"
                            onClick={handleSendMessageClick}
                        >
                            <Send className="w-6 h-6 mr-2" />
                            {t("profilePage.sendMessage")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;

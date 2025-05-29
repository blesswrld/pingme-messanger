import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
    Camera,
    Mail,
    User,
    Check,
    X,
    Edit3,
    MessageSquare,
    CalendarDays,
    BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
    } = useAuthStore();

    const [selectedImg, setSelectedImg] = useState(null);
    const [bio, setBio] = useState("");
    const [isBioEditing, setIsBioEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [isUsernameEditing, setIsUsernameEditing] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (authUser) {
            setBio(authUser.bio || "");
            setUsername(authUser.fullName || "");
        }
    }, [authUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            if (typeof base64Image !== "string") {
                toast.error(t("profilePage.failedToReadImage"));
                return;
            }
            setSelectedImg(base64Image);
            await updateProfilePic(base64Image);
        };
        reader.onerror = () => {
            toast.error(t("profilePage.errorReadingFile"));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveBio = async () => {
        if (bio === (authUser?.bio || "")) {
            setIsBioEditing(false);
            return;
        }
        await updateBio(bio);
        setIsBioEditing(false);
    };

    const handleCancelBioEdit = () => {
        setIsBioEditing(false);
        setBio(authUser?.bio || "");
    };

    const handleSaveUsername = async () => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername || trimmedUsername === authUser?.fullName) {
            setIsUsernameEditing(false);
            setUsername(authUser?.fullName || "");
            return;
        }
        if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
            toast.error(t("profilePage.usernameLengthError"));
            return;
        }
        await updateUsername(trimmedUsername);
        setIsUsernameEditing(false);
    };

    const handleCancelUsernameEdit = () => {
        setIsUsernameEditing(false);
        setUsername(authUser?.fullName || "");
    };

    const isAnyLoading =
        isUpdatingProfilePic || isUpdatingBio || isUpdatingUsername;

    if (isCheckingAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-10 bg-base-100">
            <div className="card max-w-2xl mx-auto bg-base-300 shadow-xl p-6 md:p-8">
                <div className="card-body p-0">
                    <div className="flex flex-col space-y-8">
                        <div className="flex flex-col items-center space-y-1">
                            <h1 className="text-2xl font-semibold text-base-content">
                                {t("profilePage.title")}
                            </h1>
                            <p className="text-sm text-base-content/70">
                                {t("profilePage.subtitle")}
                            </p>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                            <div
                                className="relative group w-32 h-32 cursor-pointer"
                                onClick={() =>
                                    !isUpdatingProfilePic &&
                                    fileInputRef.current?.click()
                                }
                            >
                                <div className="avatar w-full h-full">
                                    <div className="w-full h-full rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                                        <img
                                            src={
                                                selectedImg ||
                                                authUser?.profilePic ||
                                                "/avatar.png"
                                            }
                                            alt={t("profilePage.title")}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-opacity duration-300 ${
                                        isUpdatingProfilePic
                                            ? "bg-opacity-50"
                                            : ""
                                    }`}
                                >
                                    {isUpdatingProfilePic ? (
                                        <span className="loading loading-spinner loading-md text-white"></span>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Camera className="w-8 h-8 text-white mb-1" />
                                            <span className="text-xs text-white font-medium">
                                                {t("profilePage.changePhoto")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={isUpdatingProfilePic}
                                />
                            </div>
                            <p className="text-xs text-base-content/60 mt-2">
                                {isUpdatingProfilePic
                                    ? t("profilePage.uploading")
                                    : t("profilePage.updatePhotoHint")}
                            </p>
                        </div>

                        <div className="flex flex-col space-y-6">
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="label py-0">
                                        <span className="label-text text-base-content/70 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {t("profilePage.usernameLabel")}
                                        </span>
                                    </label>
                                    {!isUsernameEditing && (
                                        <div
                                            className="tooltip tooltip-left"
                                            data-tip={t(
                                                "profilePage.editUsername"
                                            )}
                                        >
                                            <button
                                                className="btn btn-ghost btn-xs p-1 h-auto min-h-0 text-primary"
                                                onClick={() =>
                                                    setIsUsernameEditing(true)
                                                }
                                                disabled={isAnyLoading}
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {!isUsernameEditing ? (
                                    <div
                                        onClick={() =>
                                            !isAnyLoading &&
                                            setIsUsernameEditing(true)
                                        }
                                        className={`flex items-center px-4 py-2.5 bg-base-200 rounded-lg min-h-[2.5rem] w-full text-left transition-colors ${
                                            isAnyLoading
                                                ? "cursor-not-allowed opacity-70"
                                                : "cursor-pointer hover:bg-base-100"
                                        }`}
                                    >
                                        <span className="text-sm text-base-content">
                                            {username || (
                                                <span className="italic opacity-70">
                                                    {t("profilePage.notSet")}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ) : (
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
                                                        authUser?.fullName
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
                                            data-tip={t("profilePage.cancel")}
                                        >
                                            <button
                                                className="btn btn-error btn-outline btn-sm btn-square"
                                                onClick={
                                                    handleCancelUsernameEdit
                                                }
                                                disabled={isUpdatingUsername}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <label className="label py-0">
                                    <span className="label-text text-base-content/70 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {t("profilePage.emailLabel")}
                                    </span>
                                </label>
                                <div className="flex items-center px-4 py-2.5 bg-base-200 rounded-lg min-h-[2.5rem] w-full cursor-not-allowed">
                                    <span className="text-sm text-base-content/80">
                                        {authUser?.email}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="label py-0">
                                        <span className="label-text text-base-content/70 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            {t("profilePage.bioLabel")}
                                        </span>
                                    </label>
                                    {!isBioEditing && (
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
                                {!isBioEditing ? (
                                    <div
                                        onClick={() =>
                                            !isAnyLoading &&
                                            setIsBioEditing(true)
                                        }
                                        className={`flex px-4 py-2.5 bg-base-200 rounded-lg min-h-[6rem] w-full text-left whitespace-pre-wrap transition-colors ${
                                            isAnyLoading
                                                ? "cursor-not-allowed opacity-70"
                                                : "cursor-pointer hover:bg-base-100"
                                        }`}
                                    >
                                        <span className="text-sm text-base-content">
                                            {bio || (
                                                <span className="italic opacity-70">
                                                    {t(
                                                        "profilePage.addBioHint"
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-2">
                                        <textarea
                                            placeholder={t(
                                                "profilePage.bioLabel"
                                            )}
                                            className={`textarea textarea-bordered textarea-primary w-full text-sm resize-none focus:outline-none ${
                                                isUpdatingBio
                                                    ? "focus:outline-none opacity-70 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            rows={4}
                                            maxLength={210}
                                            value={bio}
                                            onChange={(e) =>
                                                setBio(e.target.value)
                                            }
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
                                                        (authUser?.bio || "")
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
                                )}
                            </div>
                        </div>

                        <div className="divider my-4"></div>

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
                                            {authUser?.createdAt
                                                ? new Date(
                                                      authUser.createdAt
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
            </div>
        </div>
    );
};

export default ProfilePage;

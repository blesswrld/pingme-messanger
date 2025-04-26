import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
    Camera,
    Mail,
    User,
    Check,
    X,
    Edit3,
    Loader2,
    MessageSquare,
} from "lucide-react"; // Убедись, что Check импортирован
import toast from "react-hot-toast";

const ProfilePage = () => {
    const {
        authUser,
        updateProfilePic,
        isUpdatingProfilePic,
        updateBio,
        updateUsername,
        isUpdatingUsername,
        isUpdatingBio,
    } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);

    const [bio, setBio] = useState("");
    const [isBioEditing, setIsBioEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [isUsernameEditing, setIsUsernameEditing] = useState(false);

    useEffect(() => {
        if (authUser) {
            setBio(authUser.bio || "");
            setUsername(authUser.fullName || "");
        }
    }, [authUser]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImg(base64Image);
            await updateProfilePic(base64Image);
        };
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
            toast.error("Username must be between 3 and 30 characters.");
            return;
        }
        await updateUsername(trimmedUsername);
        setIsUsernameEditing(false);
    };

    const handleCancelUsernameEdit = () => {
        setIsUsernameEditing(false);
        setUsername(authUser?.fullName || "");
    };

    // --- Helper для блокировки кнопок ---
    const isAnyLoading =
        isUpdatingProfilePic || isUpdatingBio || isUpdatingUsername;

    return (
        <div className="h-screen pt-20">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8">
                    {" "}
                    {/* --- Шапка --- */}
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold">Profile</h1>
                        <p className="mt-2">Your profile information</p>
                    </div>
                    {/* --- Секция Аватара --- */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="avatar avatar-online">
                                <div className="w-24 rounded-full">
                                    <img
                                        src={
                                            selectedImg ||
                                            authUser?.profilePic ||
                                            "/avatar.png"
                                        }
                                        alt="Profile"
                                        className="size-32 rounded-full object-cover border-4"
                                    />
                                </div>
                            </div>
                            <label
                                htmlFor="avatar-upload"
                                className={`absolute bottom-0 right-0 bg-base-content hover:bg-primary duration-300 scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                                    isUpdatingProfilePic
                                        ? "animate-pulse pointer-events-none bg-primary"
                                        : ""
                                }`}
                            >
                                <Camera className="w-5 h-5 text-base-200" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUpdatingProfilePic}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-zinc-400">
                            {isUpdatingProfilePic
                                ? "Uploading..."
                                : "Click the camera icon to update your photo"}
                        </p>
                    </div>
                    <div className="space-y-6">
                        {/* --- Блок Username --- */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Username
                                </span>
                                {!isUsernameEditing && (
                                    <button
                                        onClick={() =>
                                            setIsUsernameEditing(true)
                                        }
                                        className="btn btn-ghost btn-xs p-1 h-auto min-h-0"
                                        disabled={isAnyLoading}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {isUsernameEditing && isUpdatingUsername && (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                )}
                            </div>
                            {!isUsernameEditing ? (
                                <p
                                    className="px-4 py-2.5 bg-base-200 rounded-lg border cursor-pointer hover:bg-base-100 transition-colors min-h-[2.5rem]"
                                    onClick={() =>
                                        !isAnyLoading &&
                                        setIsUsernameEditing(true)
                                    }
                                >
                                    {username || "Not set"}
                                </p>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        className="input input-bordered w-full"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        maxLength={30}
                                        disabled={isUpdatingUsername}
                                    />
                                    <button
                                        className="btn btn-success btn-sm btn-square"
                                        onClick={handleSaveUsername}
                                        disabled={
                                            isUpdatingUsername ||
                                            !username.trim() ||
                                            username.trim().length < 3 ||
                                            username.trim() ===
                                                authUser?.fullName
                                        }
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="btn btn-error btn-sm btn-square btn-outline"
                                        onClick={handleCancelUsernameEdit}
                                        disabled={isUpdatingUsername}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* --- Блок Email (нередактируемый) --- */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </div>
                            <p className="px-4 py-2.5 bg-base-200 rounded-lg border-dashed  cursor-not-allowed">
                                {authUser?.email}
                            </p>
                        </div>
                        {/* --- Блок Bio --- */}
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <MessageSquare width={18} height={18} />
                                    Bio
                                </span>
                                {!isBioEditing && (
                                    <button
                                        onClick={() => setIsBioEditing(true)}
                                        className="btn btn-ghost btn-xs p-1 h-auto min-h-0"
                                        disabled={isAnyLoading}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {isBioEditing && isUpdatingBio && (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                )}
                            </div>
                            {!isBioEditing ? (
                                <p
                                    className={`px-4 py-2.5 bg-base-200 rounded-lg border min-h-[6rem] whitespace-pre-wrap ${
                                        bio
                                            ? "cursor-pointer hover:bg-base-100 transition-colors"
                                            : "text-zinc-500 italic cursor-pointer hover:bg-base-100 transition-colors"
                                    }`}
                                    onClick={() =>
                                        !isAnyLoading && setIsBioEditing(true)
                                    }
                                >
                                    {bio || "Click to add bio..."}
                                </p>
                            ) : (
                                <div>
                                    <textarea
                                        placeholder="Bio"
                                        className={`textarea textarea-bordered w-full resize-none transition-colors duration-200 ${
                                            isUpdatingBio
                                                ? "opacity-60 cursor-not-allowed"
                                                : "bg-base-100"
                                        }`}
                                        maxLength={140}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        disabled={isUpdatingBio}
                                    ></textarea>
                                    <div className="flex justify-end gap-2 mt-2 items-center">
                                        <span className="text-xs text-zinc-400">
                                            {bio.length}/140
                                        </span>
                                        <button
                                            className="btn btn-success btn-sm btn-square"
                                            onClick={handleSaveBio}
                                            disabled={
                                                isUpdatingBio ||
                                                bio === (authUser?.bio || "")
                                            }
                                        >
                                            {isUpdatingBio ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            className="btn btn-error btn-sm btn-square btn-outline"
                                            onClick={handleCancelBioEdit}
                                            disabled={isUpdatingBio}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>{" "}
                    {/* --- Секция Account Information --- */}
                    <div className="mt-6 bg-base-200 rounded-xl p-6">
                        <h2 className="text-lg font-medium mb-4">
                            Account Information
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                                <span>Member Since</span>
                                <span>
                                    {authUser?.createdAt?.split("T")[0]}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span>Account Status</span>
                                <span className="text-green-500 animate-bounce">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

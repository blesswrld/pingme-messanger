import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
    const {
        authUser,
        updateProfilePic,
        isUpdatingProfilePic,
        updateBio,
        isUpdatingBio,
    } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);

    const [bio, setBio] = useState("");
    const [isBioEditing, setIsBioEditing] = useState(false);

    useEffect(() => {
        if (authUser) {
            setBio(authUser.bio || "");
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

    return (
        <div className="h-screen pt-20">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold">Profile</h1>
                        <p className="mt-2">Your profile information</p>
                    </div>
                    {/* avatar upload section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="avatar avatar-online">
                                <div className="w-24 rounded-full">
                                    <img
                                        src={
                                            selectedImg ||
                                            authUser.profilePic ||
                                            "/avatar.png"
                                        }
                                        alt="Profile"
                                        className="size-32 rounded-full object-cover border-4"
                                    />
                                </div>
                            </div>
                            {/* TODO add ofline status */}
                            {/* <div className="avatar avatar-offline">
                                <div className="w-24 rounded-full">
                                    <img
                                        src={
                                            authUser.profilePic || "/avatar.png"
                                        }
                                        alt="Profile"
                                        className="size-32 rounded-full object-cover border-4"
                                    />
                                </div>
                            </div> */}
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
                    {""}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Username
                            </div>
                            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                                {authUser?.fullName}
                            </p>
                        </div>
                        {""}
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </div>
                            <p className="px-4 py-2.5 bg-base-200 rounded-lg border-dashed">
                                {authUser?.email}
                            </p>
                        </div>
                    </div>
                    {""}
                    <div className="mt-6 bg-base-300 rounded-xl p-6">
                        <h2 className="text-lg font-medium mb-4">
                            Account Information
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                                <span>Member Since</span>
                                <span>{authUser.createdAt?.split("T")[0]}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span>Account Status</span>
                                <span className="text-green-500 animate-bounce">
                                    Active
                                </span>
                            </div>
                            {""}
                            <textarea
                                placeholder="Bio"
                                className={`textarea textarea-md w-full resize-none transition-colors duration-200 ${
                                    !isBioEditing
                                        ? "bg-base-200 cursor-pointer hover:bg-base-300"
                                        : "bg-base-100"
                                } ${
                                    isUpdatingBio
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                }`}
                                maxLength={70}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                readOnly={!isBioEditing}
                                disabled={isUpdatingBio}
                                onClick={() => {
                                    if (!isBioEditing && !isUpdatingBio) {
                                        setIsBioEditing(true);
                                    }
                                }}
                            ></textarea>
                            {isBioEditing && (
                                <div className="flex justify-end gap-2">
                                    <span className="text-xs text-zinc-400 self-center">
                                        {bio.length}/70
                                    </span>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={handleSaveBio}
                                        disabled={isUpdatingBio}
                                    >
                                        {isUpdatingBio
                                            ? "Saving..."
                                            : "Save Bio"}
                                    </button>
                                    <button
                                        className="btn btn-outline btn-error btn-sm"
                                        onClick={handleCancelBioEdit}
                                        disabled={isUpdatingBio}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                            {""}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

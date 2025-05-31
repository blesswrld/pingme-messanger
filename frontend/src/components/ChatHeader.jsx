import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!selectedUser) return null;

    const isOnline = onlineUsers.includes(selectedUser._id);

    const handleProfileClick = () => {
        if (selectedUser?._id) {
            navigate(`/profile/${selectedUser._id}`);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 border-b border-base-300 bg-base-100 lg:bg-base-200 md:rounded-tr-lg flex-shrink-0">
            <div className="flex items-center gap-3">
                {/* Кнопка Назад видна только до lg */}
                <button
                    className="btn btn-ghost btn-circle btn-sm lg:hidden"
                    onClick={() => setSelectedUser(null)}
                    aria-label={t("chatHeader.backToChats")}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={handleProfileClick}
                    aria-label={t("chatHeader.viewProfile", {
                        name: selectedUser.fullName,
                    })}
                >
                    <div
                        className={`avatar ${isOnline ? "online" : "offline"}`}
                    >
                        <div className="w-10 rounded-full">
                            <img
                                src={selectedUser.profilePic || "/avatar.png"}
                                alt={selectedUser.fullName}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-base-content text-sm md:text-base">
                            {selectedUser.fullName}
                        </h3>
                        <p
                            className={`text-xs ${
                                isOnline
                                    ? "text-success"
                                    : "text-base-content/60"
                            }`}
                        >
                            {isOnline
                                ? t("chatHeader.online")
                                : t("chatHeader.offline")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Кнопка Закрыть видна только на lg+ */}
            <div
                className="tooltip tooltip-left hidden lg:block"
                data-tip={t("chatHeader.closeChat")}
            >
                <button
                    className="btn btn-ghost btn-circle btn-sm"
                    onClick={() => setSelectedUser(null)}
                    aria-label={t("chatHeader.closeChat")}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
export default ChatHeader;

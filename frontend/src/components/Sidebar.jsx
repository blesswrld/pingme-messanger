import React, { useEffect } from "react"; // Добавили useEffect
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import UserSearch from "./search/UserSearch";
import useChatStore from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

function SideBar() {
    // Получаем новые состояния и функцию
    const {
        conversationPartners,
        isContactsLoading,
        fetchConversationPartners,
        selectedUser,
        setSelectedUser,
    } = useChatStore();
    const { onlineUsers, authUser } = useAuthStore();

    // Загружаем контакты при монтировании
    useEffect(() => {
        fetchConversationPartners();
    }, [fetchConversationPartners]); // Зависимость от самой функции

    // Считаем онлайн только среди conversationPartners
    const onlineContacts = conversationPartners.filter(
        (partner) =>
            onlineUsers.includes(partner._id) && partner._id !== authUser?._id
    );
    const onlineCount = onlineContacts.length;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            {/* Блок поиска */}
            <div className="border-b border-base-300 w-full p-2">
                <UserSearch />
            </div>

            {/* Блок "Contacts" */}
            <div className="border-b border-base-300 w-full p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="size-5" />
                    <span className="font-medium hidden lg:block text-sm">
                        Contacts
                    </span>
                </div>
                <span
                    className={`text-xs hidden lg:inline ${
                        onlineCount > 0 ? "text-success" : "text-zinc-500"
                    }`}
                >
                    ({onlineCount} online)
                </span>
            </div>

            {/* --- ИЗМЕНЕНО: Отображаем список conversationPartners или скелетон/сообщение --- */}
            <div className="flex-1 overflow-y-auto w-full py-1">
                {isContactsLoading ? (
                    <SidebarSkeleton count={3} /> // Показываем скелетон во время загрузки
                ) : conversationPartners.length > 0 ? (
                    conversationPartners.map((partner) => (
                        <button
                            key={partner._id}
                            onClick={() => setSelectedUser(partner)}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors duration-200 ${
                                selectedUser?._id === partner._id
                                    ? "bg-base-300"
                                    : ""
                            } `}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={partner.profilePic || "/avatar.png"}
                                    alt={partner.fullName}
                                    className="size-10 object-cover rounded-full"
                                />
                                {onlineUsers.includes(partner._id) && (
                                    <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-1 ring-base-100" />
                                )}
                            </div>
                            <div className="hidden lg:block text-left min-w-0">
                                <div className="font-medium truncate text-sm">
                                    {partner.fullName}
                                </div>
                                <div className="text-xs text-zinc-400">
                                    {onlineUsers.includes(partner._id)
                                        ? "Online"
                                        : "Offline"}
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    // Сообщение, если список контактов пуст ПОСЛЕ загрузки
                    <div className="text-center text-xs text-zinc-500 py-4 px-2 hidden lg:block">
                        Search for users and send a message to add them here.
                    </div>
                )}
                {/* Сообщение для мобильной версии, если список пуст */}
                {!isContactsLoading && conversationPartners.length === 0 && (
                    <div className="text-center text-xs text-zinc-500 py-4 px-2 lg:hidden">
                        Search users
                    </div>
                )}
            </div>
        </aside>
    );
}

export default SideBar;

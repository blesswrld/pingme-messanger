import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import UserSearch from "./search/UserSearch";
import useChatStore from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const MIN_WIDTH_LG = 200;
const MAX_WIDTH_LG = 500;
const DEFAULT_WIDTH_LG = 288;

function SideBar() {
    const {
        conversationPartners,
        isContactsLoading,
        fetchConversationPartners,
        selectedUser,
        setSelectedUser,
    } = useChatStore();
    const { onlineUsers, authUser } = useAuthStore();

    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH_LG);
    const isResizing = useRef(false);
    const sidebarRef = useRef(null);
    const [isMobileWidth, setIsMobileWidth] = useState(
        window.innerWidth < 1024
    ); // Состояние для ширины

    // Обновляем isMobileWidth при изменении размера окна
    useEffect(() => {
        const handleResize = () => {
            setIsMobileWidth(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchConversationPartners();
    }, [fetchConversationPartners]);

    const onlineContacts = conversationPartners.filter(
        (partner) =>
            onlineUsers.includes(partner._id) && partner._id !== authUser?._id
    );
    const onlineCount = onlineContacts.length;

    const startResizing = useCallback((mouseDownEvent) => {
        // Ресайз работает только если не мобильная или планшетная ширина
        if (window.innerWidth >= 1024) {
            isResizing.current = true;
            mouseDownEvent.preventDefault();
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        }
    }, []);

    const stopResizing = useCallback(() => {
        if (isResizing.current) {
            isResizing.current = false;
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
    }, []);
    const resize = useCallback((mouseMoveEvent) => {
        if (isResizing.current && sidebarRef.current) {
            const currentWidth =
                mouseMoveEvent.clientX -
                sidebarRef.current.getBoundingClientRect().left;
            const newWidth = Math.max(
                MIN_WIDTH_LG,
                Math.min(currentWidth, MAX_WIDTH_LG)
            );
            setSidebarWidth(newWidth);
        }
    }, []);

    const memoizedStartResizing = useCallback(startResizing, [
        resize,
        stopResizing,
    ]);

    useEffect(() => {
        return () => {
            stopResizing();
        };
    }, [stopResizing]);

    return (
        <aside
            ref={sidebarRef}
            className={`h-full border-r border-base-300 flex flex-col flex-shrink-0 bg-base-100 lg:rounded-l-lg relative transition-none ${
                selectedUser ? "hidden lg:flex" : "flex w-full lg:w-auto"
            }`} // w-full применяется до lg
            // Применяем ширину: 100% если isMobileWidth, иначе динамическую sidebarWidth
            style={{ width: isMobileWidth ? "100%" : `${sidebarWidth}px` }}
        >
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-2 border-b border-base-300 flex-shrink-0">
                    <UserSearch />
                </div>

                <div className="p-3 border-b border-base-300 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 text-base-content/80 overflow-hidden">
                        <MessageSquare className="w-5 h-5 flex-shrink-0" />
                        <span className="fext-lg font-semibold">All Chats</span>
                    </div>
                    <span
                        className={`text-xs text-green-500 inline ${
                            onlineCount > 0 ? "text-success" : ""
                        }`}
                    >
                        {onlineCount} online
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto py-1">
                    {isContactsLoading ? (
                        <SidebarSkeleton count={5} />
                    ) : conversationPartners.length > 0 ? (
                        conversationPartners.map((partner) => (
                            <button
                                key={partner._id}
                                onClick={() => setSelectedUser(partner)}
                                className={`w-full p-2 lg:p-3 flex items-center gap-3 hover:bg-base-300 focus:bg-base-300 outline-none transition-colors duration-150 ${
                                    selectedUser?._id === partner._id
                                        ? "bg-base-300"
                                        : ""
                                } `}
                            >
                                <div
                                    className={`avatar ${
                                        onlineUsers.includes(partner._id)
                                            ? "online"
                                            : "offline"
                                    } flex-shrink-0`}
                                >
                                    <div className="w-10 rounded-full">
                                        <img
                                            src={
                                                partner.profilePic ||
                                                "/avatar.png"
                                            }
                                            alt={partner.fullName}
                                        />
                                    </div>
                                </div>
                                {/* Детали видны всегда */}
                                <div className="text-left min-w-0 flex-1">
                                    <div className="font-medium truncate text-sm text-base-content">
                                        {partner.fullName}
                                    </div>
                                    <div className="text-xs text-base-content/60">
                                        {onlineUsers.includes(partner._id)
                                            ? "Online"
                                            : "Offline"}
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center text-xs text-base-content/50 py-4 px-2 block">
                            Search for users to start chatting.
                        </div>
                    )}
                </div>
            </div>

            {/* Ручка ресайза видна только на lg+ */}
            <div
                className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize bg-transparent hover:bg-primary/20 active:bg-primary/30 transition-colors duration-150 z-10 hidden lg:block"
                onMouseDown={memoizedStartResizing}
                title="Resize sidebar"
            />
        </aside>
    );
}

export default SideBar;

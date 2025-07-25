import React, { useEffect, useRef } from "react";
import useChatStore from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function ChatContainer() {
    const { messages, isMessagesLoading, selectedUser } = useChatStore();
    const { authUser, socket } = useAuthStore();
    const { t, i18n } = useTranslation();
    const messageEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser?._id) {
            useChatStore.getState().getMessages(selectedUser._id);
        }
    }, [selectedUser?._id]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (socket && selectedUser?._id) {
            socket.emit("markMessagesAsRead", {
                otherUserId: selectedUser._id,
            });
            useChatStore.getState().clearUnreadCountFor(selectedUser._id);
        }
    }, [socket, selectedUser, messages]);

    const renderLoading = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4">
                <MessageSkeleton count={5} />
            </div>
            <MessageInput />
        </div>
    );

    const renderChat = () => (
        <div className="flex-1 flex flex-col overflow-hidden bg-base-100 lg:bg-base-200 md:rounded-r-lg h-full">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((message) => {
                    const isOwnMessage = message.senderId === authUser?._id;
                    return (
                        <div
                            key={message._id}
                            className={`chat ${
                                isOwnMessage ? "chat-end" : "chat-start"
                            }`}
                        >
                            <div className="chat-image avatar">
                                <div className="w-8 md:w-10 rounded-full">
                                    <img
                                        src={
                                            isOwnMessage
                                                ? authUser?.profilePic ||
                                                  "/avatar.png"
                                                : selectedUser?.profilePic ||
                                                  "/avatar.png"
                                        }
                                        alt="profile pic"
                                    />
                                </div>
                            </div>
                            <div className="chat-bubble flex flex-col max-w-xs md:max-w-md lg:max-w-lg relative">
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Attachment"
                                        className="rounded-md mb-1.5 cursor-pointer"
                                        onClick={() =>
                                            window.open(message.image, "_blank")
                                        }
                                    />
                                )}
                                {message.video && (
                                    <video
                                        src={message.video}
                                        controls
                                        className="rounded-md mb-1.5 bg-black"
                                    />
                                )}
                                {message.text && (
                                    <p className="text-sm break-words whitespace-pre-wrap">
                                        {message.text}
                                    </p>
                                )}
                            </div>
                            <div className="chat-footer opacity-50 text-xs mt-1 flex items-center gap-1.5">
                                {formatMessageTime(
                                    message.createdAt,
                                    t,
                                    i18n.language
                                )}
                                {isOwnMessage && (
                                    <span className="text-base-content/80">
                                        {message.status === "read" ? (
                                            <BsCheckAll
                                                size={16}
                                                className="text-primary"
                                            />
                                        ) : (
                                            <BsCheck size={16} />
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messageEndRef} className="h-0" />
            </div>
            <MessageInput />
        </div>
    );

    return isMessagesLoading ? renderLoading() : renderChat();
}

export default ChatContainer;

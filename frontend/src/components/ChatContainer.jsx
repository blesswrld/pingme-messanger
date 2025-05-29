import React, { useEffect, useRef } from "react";
import useChatStore from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useTranslation } from "react-i18next";

function ChatContainer() {
    const { messages, isMessagesLoading, selectedUser } = useChatStore();
    const { authUser } = useAuthStore();
    const { t, i18n } = useTranslation();
    const messageEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser?._id) {
            useChatStore.getState().getMessages(selectedUser._id);
            const unsubscribe = useChatStore.getState().subscribeToMessages();
            return unsubscribe;
        } else {
            useChatStore.setState({ messages: [], isMessagesLoading: false });
        }
    }, [selectedUser?._id]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        <div className="flex-1 flex flex-col overflow-hidden bg-base-100 lg:bg-base-200 md:rounded-r-lg">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${
                            message.senderId === authUser?._id
                                ? "chat-end"
                                : "chat-start"
                        }`}
                    >
                        <div className="chat-image avatar">
                            <div className="w-8 md:w-10 rounded-full">
                                <img
                                    src={
                                        message.senderId === authUser?._id
                                            ? authUser?.profilePic ||
                                              "/avatar.png"
                                            : selectedUser?.profilePic ||
                                              "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-bubble flex flex-col max-w-xs md:max-w-md lg:max-w-lg">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt={t("chat.attachmentAlt", {
                                        defaultValue: "Attachment",
                                    })}
                                    className="max-w-[200px] md:max-w-[250px] rounded-md mb-1.5 cursor-pointer"
                                    onClick={() =>
                                        window.open(message.image, "_blank")
                                    }
                                />
                            )}
                            {message.text && (
                                <p className="text-sm break-words whitespace-pre-wrap">
                                    {message.text}
                                </p>
                            )}
                        </div>
                        <div className="chat-footer opacity-50 text-xs mt-1">
                            {message.createdAt
                                ? formatMessageTime(
                                      message.createdAt,
                                      t,
                                      i18n.language
                                  )
                                : "..."}
                        </div>
                    </div>
                ))}
                <div ref={messageEndRef} className="h-0" />
            </div>
            <MessageInput />
        </div>
    );

    return isMessagesLoading ? renderLoading() : renderChat();
}

export default ChatContainer;

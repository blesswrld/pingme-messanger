import React, { useEffect, useRef } from "react";

import useChatStore from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

function ChatContainer() {
    const {
        messages,
        // getMessages, // Не получаем напрямую, вызываем через getState или селектор
        isMessagesLoading,
        selectedUser,
        // subscribeToMessages, // Не получаем напрямую
        // unsubscribeFromMessages, // Не получаем напрямую
    } = useChatStore();

    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null); // Ref для скролла

    useEffect(() => {
        if (selectedUser?._id) {
            useChatStore.getState().getMessages(selectedUser._id);
            const unsubscribe = useChatStore.getState().subscribeToMessages();
            return unsubscribe;
        }
        // Если selectedUser сбрасывается, можно добавить логику очистки сообщений здесь
        // else {
        //    useChatStore.setState({ messages: [] });
        // }
    }, [selectedUser?._id]);

    // Эффект для скролла к последнему сообщению
    useEffect(() => {
        if (messageEndRef.current) {
            setTimeout(() => {
                messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
        }
    }, [messages]); // Зависимость от массива сообщений

    // Рендер скелетона во время загрузки
    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <ChatHeader />
                <div className="flex-1 overflow-y-auto p-4">
                    <MessageSkeleton />
                </div>
                <MessageInput />
            </div>
        );
    }

    // Основной рендер чата
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                            <div className="size-10 rounded-full border">
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
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {message.createdAt
                                    ? formatMessageTime(message.createdAt)
                                    : "..."}
                            </time>
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
                {/* Пустой div для стабильного скролла */}
                <div ref={messageEndRef} />
            </div>
            <MessageInput />
        </div>
    );
}

export default ChatContainer;

import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const useSocketSubscription = () => {
    const { socket } = useAuthStore();
    const { _updateSidebarAfterMessage, messages, setSelectedUser } =
        useChatStore();

    useEffect(() => {
        if (!socket) return;

        // --- Обработчик для НОВЫХ СООБЩЕНИЙ ---
        const handleNewMessage = (newMessage) => {
            console.log("SOCKET EVENT: newMessage received", newMessage);

            const { selectedUser } = useChatStore.getState();

            // Если чат с отправителем открыт, добавляем сообщение в UI
            if (selectedUser?._id === newMessage.senderId) {
                useChatStore.setState((state) => ({
                    messages: [...state.messages, newMessage],
                }));
            }

            // Локально обновляем сайдбар
            useChatStore.getState()._updateSidebarAfterMessage(newMessage);
        };

        // --- Обработчик для ПРОЧТЕНИЯ СООБЩЕНИЙ ---
        const handleMessagesRead = ({ conversationPartnerId }) => {
            console.log(
                "SOCKET EVENT: messagesReadUpdate received from",
                conversationPartnerId
            );
            const { selectedUser } = useChatStore.getState();

            // Обновляем статусы в открытом чате, если это тот самый чат
            if (selectedUser?._id === conversationPartnerId) {
                useChatStore.setState((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.status !== "read" ? { ...msg, status: "read" } : msg
                    ),
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messagesReadUpdate", handleMessagesRead);

        // Очистка при размонтировании компонента или смене сокета
        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesReadUpdate", handleMessagesRead);
        };
    }, [socket]); // Этот хук зависит ТОЛЬКО от сокета
};

export default useSocketSubscription;

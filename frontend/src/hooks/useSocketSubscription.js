import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const useSocketSubscription = () => {
    const { socket } = useAuthStore();

    useEffect(() => {
        // Если сокета нет, ничего не делаем
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

        const onConnect = () => {
            console.log(
                "Socket connected/reconnected. Registering event listeners..."
            );
            socket.on("newMessage", handleNewMessage);
            socket.on("messagesReadUpdate", handleMessagesRead);
        };

        // Регистрируем слушатель на событие 'connect'
        socket.on("connect", onConnect);

        // Если сокет уже подключен в момент монтирования хука, вызываем onConnect сразу
        if (socket.connected) {
            onConnect();
        }

        // Функция очистки, которая сработает при размонтировании
        return () => {
            console.log("Cleaning up socket event listeners...");
            // Удаляем все наши слушатели, включая слушатель на 'connect'
            socket.off("connect", onConnect);
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesReadUpdate", handleMessagesRead);
        };
    }, [socket]); // Зависимость только от сокета - это правильно
};

export default useSocketSubscription;

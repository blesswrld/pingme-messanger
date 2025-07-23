import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const notificationSound = new Audio("/notification.mp3");

const useSocketSubscription = () => {
    const { socket } = useAuthStore();

    useEffect(() => {
        // Если сокета нет, ничего не делаем
        if (!socket) return;

        // --- Обработчик для НОВЫХ СООБЩЕНИЙ (Звук и Push) ---
        const handleNewMessage = (newMessage) => {
            console.log("SOCKET EVENT: newMessage received", newMessage);

            const { selectedUser, conversationPartners } =
                useChatStore.getState();

            // Если чат с отправителем открыт, просто добавляем сообщение
            if (selectedUser?._id === newMessage.senderId) {
                useChatStore.setState((state) => ({
                    messages: [...state.messages, newMessage],
                }));
            }
            // Иначе, проигрываем звук и показываем Push
            else {
                // 1. Проигрываем звук
                notificationSound
                    .play()
                    .catch((error) =>
                        console.error("Audio play failed:", error)
                    );

                // 2. Показываем Push-уведомление
                if (
                    Notification.permission === "granted" &&
                    document.visibilityState === "hidden"
                ) {
                    const sender = conversationPartners.find(
                        (p) => p._id === newMessage.senderId
                    );
                    const title = sender
                        ? `Новое сообщение от ${sender.fullName}`
                        : "Новое сообщение";
                    const body =
                        newMessage.text ||
                        (newMessage.image ? "Изображение" : "Видео");
                    const icon = sender?.profilePic || "/logo.png";

                    const notification = new Notification(title, {
                        body,
                        icon,
                        tag: `chat-message-${newMessage.senderId}`,
                    });

                    notification.onclick = () => {
                        window.focus();
                        if (sender)
                            useChatStore.getState().setSelectedUser(sender);
                    };
                }
            }

            // Локально обновляем сайдбар в любом случае
            useChatStore.getState()._updateSidebarAfterMessage(newMessage);
        };

        // --- Обработчик для ПРОЧТЕНИЯ СООБЩЕНИЙ (Статусы) ---
        const handleMessagesRead = ({ conversationPartnerId }) => {
            console.log(
                "SOCKET EVENT: messagesReadUpdate received from",
                conversationPartnerId
            );

            const { authUser } = useAuthStore.getState();
            const { selectedUser } = useChatStore.getState();

            // Обновляем статусы, только если у нас открыт чат с тем, кто прочитал наши сообщения
            if (selectedUser?._id === conversationPartnerId) {
                useChatStore.setState((state) => ({
                    messages: state.messages.map((msg) => {
                        if (
                            msg.senderId === authUser._id &&
                            msg.status !== "read"
                        ) {
                            return { ...msg, status: "read" };
                        }
                        return msg;
                    }),
                }));
            }
        };

        // --- Логика подключения и переподключения  ---
        const onConnect = () => {
            console.log(
                "Socket connected/reconnected. Registering listeners..."
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
    }, [socket]);
};

export default useSocketSubscription;

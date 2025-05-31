import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    // users: [],
    selectedUser: null,
    // isUsersLoading: false,
    isMessagesLoading: false,
    conversationPartners: [], // Список собеседников, загружаемый с бэка
    isContactsLoading: false, // Флаг загрузки собеседников
    isSendingMessage: false,

    // Функция для загрузки собеседников
    fetchConversationPartners: async () => {
        set({ isContactsLoading: true });
        try {
            const res = await axiosInstance.get("/users/contacts");
            set({ conversationPartners: res.data || [] });
        } catch (error) {
            console.error("Error fetching conversation partners:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load contacts";
            toast.error(errorMessage);
            set({ conversationPartners: [] }); // В случае ошибки сбрасываем в пустой массив
        } finally {
            set({ isContactsLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true, messages: [] });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data || [] });
        } catch (error) {
            console.error("Error getting messages:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load messages";
            toast.error(errorMessage);
            set({ messages: [] });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (recipientId, text, image = null, video = null) => {
        set({ isSendingMessage: true });
        try {
            if (!text && !image && !video) {
                toast.error("Message cannot be empty.");
                return;
            }

            const messageData = { text, image, video };
            const res = await axiosInstance.post(
                `/messages/send/${recipientId}`,
                messageData
            );
            const newMessage = res.data;
            if (newMessage?._id) {
                set((state) => {
                    const updatedMessages = [...state.messages, newMessage];
                    return { messages: updatedMessages };
                });
                console.log(
                    "ChatStore state updated with new message:",
                    newMessage._id
                );

                // Обновляем список контактов после отправки
                const partners = get().conversationPartners;
                const isNewPartner = !partners.some(
                    (p) => p._id === recipientId
                );
                if (isNewPartner) {
                    console.log(
                        "New conversation partner detected, refetching contacts..."
                    );
                    get().fetchConversationPartners();
                }
                // --- Конец опционального обновления ---
            } else {
                console.error(
                    "sendMessage: Invalid response data received from server",
                    newMessage
                );
                toast.error("Failed to update chat (invalid data).");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to send message";
            toast.error(errorMessage);
        } finally {
            set({ isSendingMessage: false });
        }
    },

    setSelectedUser: (user) => set({ selectedUser: user }),

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket || !socket.connected) {
            console.warn(
                "Socket not available or not connected in useAuthStore for subscribing"
            );
            return () => {};
        }
        const handleNewMessage = (newMessage) => {
            console.log("Socket received newMessage:", newMessage);
            const { selectedUser, messages, conversationPartners } = get(); // Добавили conversationPartners

            // Добавляем сообщение в текущий чат, если он открыт
            if (
                newMessage?._id &&
                selectedUser &&
                (newMessage.senderId === selectedUser._id ||
                    newMessage.receiverId === selectedUser._id)
            ) {
                const messageExists = messages.some(
                    (msg) => msg._id === newMessage._id
                );
                if (!messageExists) {
                    set((state) => {
                        const updatedMessages = [...state.messages, newMessage];
                        console.log(
                            "ChatStore state updated via socket:",
                            newMessage._id
                        );
                        return { messages: updatedMessages };
                    });
                } else {
                    console.log(
                        "Duplicate message received via socket, ignoring:",
                        newMessage._id
                    );
                }
            }

            // Обновляем список контактов при получении от нового юзера
            const senderId = newMessage.senderId;
            const myId = useAuthStore.getState().authUser?._id;
            if (myId && senderId && senderId.toString() !== myId.toString()) {
                const isNewPartner = !conversationPartners.some(
                    (p) => p._id === senderId.toString()
                );
                if (isNewPartner) {
                    console.log(
                        "Received message from new partner, refetching contacts..."
                    );
                    get().fetchConversationPartners();
                }
            }
        };
        socket.off("newMessage", handleNewMessage);
        socket.on("newMessage", handleNewMessage);
        console.log(
            "Subscribed to socket 'newMessage' event using socket from useAuthStore"
        );
        return () => {
            console.log("Unsubscribing from socket 'newMessage' event");
            const currentSocket = useAuthStore.getState().socket;
            if (currentSocket) {
                currentSocket.off("newMessage", handleNewMessage);
            }
        };
    },
}));

export default useChatStore;

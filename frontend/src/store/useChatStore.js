import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    selectedUser: null,
    isMessagesLoading: false,
    conversationPartners: [],
    isContactsLoading: false,
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
            set({ conversationPartners: [] });
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
                    const updatedPartners = [...state.conversationPartners];
                    const recipientIdStr = recipientId.toString();
                    const sentToPartnerIndex = updatedPartners.findIndex(
                        (partner) => partner._id.toString() === recipientIdStr
                    );

                    if (sentToPartnerIndex > -1) {
                        const existingPartner = {
                            ...updatedPartners[sentToPartnerIndex],
                            lastMessage: newMessage,
                        };
                        updatedPartners.splice(sentToPartnerIndex, 1);
                        updatedPartners.unshift(existingPartner);
                    } else {
                        console.log(
                            "New conversation partner detected (on send), initiating full contacts refetch."
                        );
                        get().fetchConversationPartners();
                        return { messages: updatedMessages };
                    }
                    return {
                        messages: updatedMessages,
                        conversationPartners: updatedPartners,
                    };
                });
                console.log(
                    "ChatStore state updated with new message:",
                    newMessage._id
                );
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
                "Socket not available or not connected for subscribing."
            );
            return () => {};
        }

        const handleNewMessage = (newMessage) => {
            console.log("--- Socket newMessage DEBUG (Final Attempt) ---");
            console.log(
                "Incoming New Message (Raw):",
                JSON.stringify(newMessage, null, 2)
            );

            const { selectedUser, messages } = get();

            // 1. Обновляем сообщения в текущем чате (если он открыт)
            const senderIdStr = newMessage.senderId?.toString();
            const receiverIdStr = newMessage.receiverId?.toString();

            set((state) => {
                const updatedMessages = [...state.messages];
                if (
                    selectedUser &&
                    (senderIdStr === selectedUser._id.toString() ||
                        receiverIdStr === selectedUser._id.toString()) &&
                    !updatedMessages.some((msg) => msg._id === newMessage._id)
                ) {
                    updatedMessages.push(newMessage);
                    console.log("Messages in selected chat updated locally.");
                } else if (selectedUser) {
                    console.log(
                        "Message is duplicate or not for selected chat. Skipping local message list update."
                    );
                }
                return { messages: updatedMessages };
            });

            // 2. ВСЕГДА ВЫЗЫВАЕМ fetchConversationPartners для обновления сайдбара
            // Это гарантирует, что предпросмотр сообщения обновится и порядок чатов будет корректным
            console.log(
                "Triggering full contacts refetch to update sidebar preview for ALL messages."
            );

            get().fetchConversationPartners();

            console.log("--- End Socket newMessage DEBUG (Final Attempt) ---");
        };

        socket.off("newMessage", handleNewMessage);
        socket.on("newMessage", handleNewMessage);
        console.log("Subscribed to socket 'newMessage' event.");
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

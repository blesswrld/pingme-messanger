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

    setSelectedUser: (user) => set({ selectedUser: user }),

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
                set((state) => ({ messages: [...state.messages, newMessage] }));
                get()._updateSidebarAfterMessage(newMessage, true);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Более детальный вывод ошибки для пользователя
            const errorMessage =
                error.response?.data?.error || // Сначала ищем 'error' поле из бэкенда
                error.response?.data?.message || // Затем 'message' поле
                "Failed to send message."; // Дефолтное сообщение
            toast.error(errorMessage);
        } finally {
            set({ isSendingMessage: false });
        }
    },

    _updateSidebarAfterMessage: (newMessage, isMyMessage = false) => {
        set((state) => {
            const { authUser } = useAuthStore.getState();
            const partners = [...state.conversationPartners];
            const partnerId = isMyMessage
                ? newMessage.receiverId
                : newMessage.senderId;

            const partnerIndex = partners.findIndex((p) => p._id === partnerId);

            let partnerData;

            if (partnerIndex > -1) {
                partnerData = { ...partners[partnerIndex] };
                partners.splice(partnerIndex, 1);
            } else {
                get().fetchConversationPartners();
                return {};
            }

            partnerData.lastMessage = newMessage;
            if (!isMyMessage) {
                const { selectedUser } = get();
                if (selectedUser?._id !== partnerId) {
                    partnerData.unreadCount =
                        (partnerData.unreadCount || 0) + 1;
                }
            }

            partners.unshift(partnerData);
            return { conversationPartners: partners };
        });
    },

    clearUnreadCountFor: (userId) => {
        set((state) => ({
            conversationPartners: state.conversationPartners.map((p) =>
                p._id === userId ? { ...p, unreadCount: 0 } : p
            ),
        }));
    },
}));

export default useChatStore;

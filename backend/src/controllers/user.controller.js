import Message from "../modules/message.model.js";
import User from "../modules/user.model.js";

export const searchUsers = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const currentUserId = req.user._id;

        if (!searchQuery) {
            return res.status(200).json([]);
        }

        const users = await User.find({
            fullName: { $regex: searchQuery, $options: "i" },
            _id: { $ne: currentUserId },
        }).select("fullName profilePic _id");

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in searchUsers controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getConversationPartners = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // 1. Находим все сообщения, где текущий пользователь - отправитель или получатель
        const messages = await Message.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        }).select("senderId receiverId");

        // 2. Собираем уникальные ID собеседников
        const partnersIds = new Set();
        messages.forEach((msg) => {
            if (msg.senderId.toString() !== currentUserId.toString()) {
                partnersIds.add(msg.senderId.toString());
            }
            if (msg.receiverId.toString() !== currentUserId.toString()) {
                partnersIds.add(msg.receiverId.toString());
            }
        });

        // 3. Преобразуем Set в массив ID
        const uniquePartnerIds = Array.from(partnersIds);

        // 4. Находим полные данные пользователей по этим ID
        const partners = await User.find({
            _id: { $in: uniquePartnerIds },
        }).select("fullName profilePic _id");
        res.status(200).json(partners);
    } catch (error) {
        console.error(
            "Error in getConversationPartners controller:",
            error.message
        );
        res.status(500).json({ message: "Internal Server error" });
    }
};

import Message from "../modules/message.model.js";
import User from "../modules/user.model.js";

export const searchUsers = async (req, res) => {
    try {
        const searchQuery = req.query.q;

        // Добавим проверку на req.user и req.user._id здесь тоже для единообразия
        if (!req.user || !req.user._id) {
            console.error(
                "searchUsers: User not authenticated or user ID missing."
            );
            return res.status(401).json({ message: "User not authenticated." });
        }
        const currentUserId = req.user._id;

        if (!searchQuery) {
            return res.status(200).json([]);
        }

        const users = await User.find({
            fullName: { $regex: searchQuery, $options: "i" },
            _id: { $ne: currentUserId }, // Исключаем текущего пользователя из поиска
        }).select("fullName profilePic _id");

        res.status(200).json(users);
    } catch (error) {
        console.error("Error in searchUsers controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getConversationPartners = async (req, res) => {
    try {
        // Проверка аутентификации пользователя
        if (!req.user || !req.user._id) {
            console.error(
                "getConversationPartners: User not authenticated or user ID missing."
            );
            return res.status(401).json({ message: "User not authenticated." });
        }
        const currentUserId = req.user._id;
        const currentUserIdStr = currentUserId.toString();
        // 1. Находим все сообщения, где текущий пользователь - отправитель или получатель
        const messages = await Message.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        })
            .select("senderId receiverId")
            .lean(); // .lean() для производительности

        // 2. Собираем уникальные ID собеседников
        const partnersIds = new Set();
        messages.forEach((msg) => {
            // Проверяем senderId: существует ли и не является ли ID текущего пользователя
            if (msg.senderId && msg.senderId.toString() !== currentUserIdStr) {
                partnersIds.add(msg.senderId.toString());
            }
            // Проверяем receiverId: существует ли и не является ли ID текущего пользователя
            if (
                msg.receiverId &&
                msg.receiverId.toString() !== currentUserIdStr
            ) {
                partnersIds.add(msg.receiverId.toString());
            }
        });

        // 3. Преобразуем Set в массив ID
        const uniquePartnerIds = Array.from(partnersIds);

        // Если нет ID партнеров, возвращаем пустой массив
        if (uniquePartnerIds.length === 0) {
            return res.status(200).json([]);
        }

        // 4. Находим полные данные пользователей по этим ID
        const partners = await User.find({
            _id: { $in: uniquePartnerIds },
        })
            .select("fullName profilePic _id")
            .lean(); // .lean() для производительности

        res.status(200).json(partners);
    } catch (error) {
        console.error(
            "Error in getConversationPartners controller:",
            error.message,
            error.stack
        );
        res.status(500).json({ message: "Internal Server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserProfile controller:", error.message);

        res.status(500).json({ error: "Internal server error" });
    }
};

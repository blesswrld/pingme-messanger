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

        // Агрегация для нахождения последнего сообщения для каждой уникальной беседы
        const latestMessages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: currentUserId },
                        { receiverId: currentUserId },
                    ],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$senderId", currentUserId] },
                            then: "$receiverId",
                            else: "$senderId",
                        },
                    },
                    lastMessage: { $first: "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 0,
                    // Преобразуем ObjectId в строку явно на этапе агрегации
                    partnerId: { $toString: "$_id" },
                    lastMessage: {
                        _id: { $toString: "$lastMessage._id" },
                        senderId: { $toString: "$lastMessage.senderId" },
                        receiverId: { $toString: "$lastMessage.receiverId" },
                        text: "$lastMessage.text",
                        image: "$lastMessage.image",
                        video: "$lastMessage.video",
                        createdAt: "$lastMessage.createdAt",
                    },
                },
            },
        ]);

        const partnerIds = latestMessages.map((item) => item.partnerId);

        if (partnerIds.length === 0) {
            return res.status(200).json([]);
        }

        const partners = await User.find({
            _id: { $in: partnerIds },
        })
            .select("fullName profilePic _id")
            .lean();

        const conversationData = partners.map((partner) => {
            const latestMsgData = latestMessages.find(
                (msg) => msg.partnerId === partner._id.toString()
            )?.lastMessage;

            return {
                ...partner,
                _id: partner._id.toString(),
                lastMessage: latestMsgData || null,
            };
        });

        conversationData.sort((a, b) => {
            const dateA = a.lastMessage?.createdAt
                ? new Date(a.lastMessage.createdAt)
                : new Date(0);
            const dateB = b.lastMessage?.createdAt
                ? new Date(b.lastMessage.createdAt)
                : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });

        res.status(200).json(conversationData);
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

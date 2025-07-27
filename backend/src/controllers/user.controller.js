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
        const loggedInUserId = req.user._id;

        // 1. Находим все чаты, в которых участвует текущий пользователь
        const messages = await Message.find({
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        }).sort({ createdAt: -1 });

        // 2. Группируем чаты по собеседникам, сохраняя последнее сообщение
        const partnerMap = new Map();
        for (const msg of messages) {
            const partnerId = msg.senderId.equals(loggedInUserId)
                ? msg.receiverId.toString()
                : msg.senderId.toString();
            if (!partnerMap.has(partnerId)) {
                partnerMap.set(partnerId, { lastMessage: msg });
            }
        }

        // 3. Считаем непрочитанные сообщения для каждого чата
        const unreadCounts = await Message.aggregate([
            { $match: { receiverId: loggedInUserId, status: { $ne: "read" } } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } },
        ]);
        const unreadMap = new Map(
            unreadCounts.map((item) => [item._id.toString(), item.count])
        );

        // 4. Получаем информацию о пользователях-собеседниках
        const partnerIds = Array.from(partnerMap.keys());
        if (partnerIds.length === 0) {
            return res.status(200).json([]);
        }
        const partners = await User.find({ _id: { $in: partnerIds } }).select(
            "-password"
        );

        // 5. Собираем итоговый результат
        let combinedData = partners.map((partner) => {
            const partnerIdStr = partner._id.toString();
            return {
                ...partner.toObject(),
                lastMessage: partnerMap.get(partnerIdStr)?.lastMessage,
                unreadCount: unreadMap.get(partnerIdStr) || 0,
            };
        });

        // 6. Сортируем по дате последнего сообщения
        combinedData.sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return (
                new Date(b.lastMessage.createdAt) -
                new Date(a.lastMessage.createdAt)
            );
        });

        res.status(200).json(combinedData);
    } catch (error) {
        console.error("Error in getConversationPartners:", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { id: profileUserId } = req.params;
        const requestingUserId = req.user._id;

        const profileUser =
            await User.findById(profileUserId).select("-password");
        if (!profileUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Если пользователь смотрит свой собственный профиль, отдаем все данные
        if (profileUser._id.equals(requestingUserId)) {
            return res.status(200).json(profileUser);
        }

        // Иначе, проверяем настройки приватности
        const profileData = profileUser.toObject();

        // Проверка для Email
        const emailPrivacy = profileUser.privacySettings.email;
        if (emailPrivacy.visibility === "contacts") {
            const conversationExists = await Message.findOne({
                $or: [
                    { senderId: requestingUserId, receiverId: profileUserId },
                    { senderId: profileUserId, receiverId: requestingUserId },
                ],
            });
            if (!conversationExists) delete profileData.email;
        } else if (emailPrivacy.visibility === "specific") {
            if (
                !emailPrivacy.allowed.some((id) => id.equals(requestingUserId))
            ) {
                delete profileData.email;
            }
        }

        // Проверка для Bio
        const bioPrivacy = profileUser.privacySettings.bio;
        if (bioPrivacy.visibility === "contacts") {
            const conversationExists = await Message.findOne({
                $or: [
                    { senderId: requestingUserId, receiverId: profileUserId },
                    { senderId: profileUserId, receiverId: requestingUserId },
                ],
            });
            if (!conversationExists) delete profileData.bio;
        } else if (bioPrivacy.visibility === "specific") {
            if (!bioPrivacy.allowed.some((id) => id.equals(requestingUserId))) {
                delete profileData.bio;
            }
        }

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Error in getUserProfile controller:", error.message);

        res.status(500).json({ error: "Internal server error" });
    }
};

export const updatePrivacySettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { settings } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.privacySettings = settings;
        await user.save();

        const updatedUser = await User.findById(userId).select("-password");
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updatePrivacySettings:", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};

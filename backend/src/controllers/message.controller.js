import s3Client from "../lib/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import Message from "../modules/message.model.js";
import User from "../modules/user.model.js";

import { config } from "dotenv";
import { getReceiverSocketId, io } from "../lib/socket.js";

config();

const checkAndAwardAchievements = async (user) => {
    const achievementsToAward = [];
    const messagesSent = user.stats.messagesSent;

    const achievementTiers = [
        { id: "MSG_10", count: 10, name: "Новичок" },
        { id: "MSG_100", count: 100, name: "Завсегдатай" },
        { id: "MSG_1000", count: 1000, name: "Мастер общения" },
        { id: "MSG_10000", count: 10000, name: "Легенда PingMe" },
    ];

    for (const tier of achievementTiers) {
        if (
            messagesSent >= tier.count &&
            !user.achievements.includes(tier.id)
        ) {
            achievementsToAward.push(tier.id);
        }
    }

    if (achievementsToAward.length > 0) {
        user.achievements.push(...achievementsToAward);
        await user.save();
        console.log(
            `User ${user.fullName} awarded achievements: ${achievementsToAward.join(", ")}`
        );
    }
};

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal Server error" });
    }
};

export const sendMessage = async (req, res) => {
    const senderId = req.user?._id;
    const { id: receiverId } = req.params;
    const { text, image, video } = req.body;
    const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    const S3_ENDPOINT_URL = process.env.AWS_S3_ENDPOINT_URL;

    // console.log(`[sendMessage] Request from ${senderId} to ${receiverId}. Text: ${text ? "Yes" : "No"}, Image: ${image ? "Yes" : "No"}, Video: ${video ? "Yes" : "No"}`); // Меньше логов

    if (!senderId) {
        // console.error("[sendMessage] Error: Sender ID not found in request."); // Меньше логов
        return res
            .status(401)
            .json({ error: "Unauthorized: Sender ID missing." });
    }
    if (!receiverId) {
        return res.status(400).json({ error: "Receiver ID is missing." });
    }
    if (!text && !image && !video) {
        return res.status(400).json({
            error: "Message cannot be empty (text, image, or video required).",
        });
    }

    // Критическая проверка S3 клиента и конфигурации
    if ((image || video) && (!s3Client || !BUCKET_NAME || !S3_ENDPOINT_URL)) {
        console.error(
            "[sendMessage] CRITICAL ERROR: S3 client or config missing for media upload."
        );
        return res.status(500).json({
            error: "Server configuration error [S3] for media upload.",
        });
    }

    let imageUrl = undefined;
    let videoUrl = undefined;

    try {
        if (image) {
            // Проверка Data URL формата изображения
            const matches = image.match(
                /^data:image\/([A-Za-z-+/.=]+);base64,(.+)$/
            );
            if (!matches || matches.length !== 3) {
                // console.log(`[sendMessage] From ${senderId}: Invalid base64 image format.`); // Меньше логов
                return res
                    .status(400)
                    .json({ error: "Invalid base64 image format" });
            }

            const fullMimeType = matches[1];
            const base64Data = matches[2];
            const simpleImageType = fullMimeType
                .split(";")[0]
                .split("/")
                .pop()
                .split("+")[0];
            const imageBuffer = Buffer.from(base64Data, "base64");
            const contentType = `image/${simpleImageType}`;
            const filename = `messageImages/${senderId}-${receiverId}/${uuidv4()}.${simpleImageType}`;

            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: imageBuffer,
                ContentType: contentType,
            };

            // console.log(`[sendMessage] From ${senderId}: Uploading image ${filename} to S3...`); // Меньше логов
            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);
            imageUrl = `${S3_ENDPOINT_URL}/${BUCKET_NAME}/${filename}`;
        }

        if (video) {
            // Проверка Data URL формата видео (упрощенная)
            const matches = video.match(
                /^data:video\/([^;]+);base64,(.+)$/ // Более широкое регулярное выражение для MIME-типа
            );
            if (!matches || matches.length !== 3) {
                // console.log(`[sendMessage] From ${senderId}: Invalid base64 video format.`); // Меньше логов
                return res
                    .status(400)
                    .json({ error: "Invalid base64 video format" });
            }

            const fullMimeType = matches[1];
            const base64Data = matches[2];
            const simpleVideoType = fullMimeType
                .split(";")[0]
                .split("/")
                .pop()
                .split("+")[0];

            const videoBuffer = Buffer.from(base64Data, "base64");
            const contentType = `video/${simpleVideoType}`;
            const filename = `messageVideos/${senderId}-${receiverId}/${uuidv4()}.${simpleVideoType}`;

            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: videoBuffer,
                ContentType: contentType,
            };

            // console.log(`[sendMessage] From ${senderId}: Uploading video ${filename} to S3 with contentType ${contentType}...`); // Меньше логов
            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);
            videoUrl = `${S3_ENDPOINT_URL}/${BUCKET_NAME}/${filename}`;
        }

        // console.log(`[sendMessage] From ${senderId} to ${receiverId}: Saving message to DB...`); // Меньше логов
        const newMessage = new Message({
            senderId: senderId.toString(),
            receiverId: receiverId.toString(),
            text: text || "",
            image: imageUrl,
            video: videoUrl,
            status: "sent",
        });

        const sender = await User.findById(senderId);
        if (sender) {
            sender.stats.messagesSent = (sender.stats.messagesSent || 0) + 1;
            await checkAndAwardAchievements(sender);
            await sender.save();
        }

        await newMessage.save();
        // console.log(`[sendMessage] From ${senderId} to ${receiverId}: Message saved successfully.`); // Меньше логов

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(
            `[sendMessage] CRITICAL ERROR from ${senderId} to ${receiverId}: ${error.message}`
        );
        console.error("Stack:", error.stack);

        const statusCode =
            error.message?.includes("base64") || // Это условие оставим для 400 при некорректном base64
            error.message?.includes("format")
                ? 400
                : error.$metadata?.httpStatusCode || 500;
        res.status(statusCode).json({
            error: "Internal server error during message sending.",
        });
    }
};

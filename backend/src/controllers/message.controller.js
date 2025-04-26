import s3Client from "../lib/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import Message from "../modules/message.model.js";
import User from "../modules/user.model.js";

import { config } from "dotenv";
import { getReceiverSocketId, io } from "../lib/socket.js";

config();

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
    const { text, image } = req.body;
    const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    const S3_ENDPOINT_URL = process.env.AWS_S3_ENDPOINT_URL;

    console.log(
        `[sendMessage] Request from ${senderId} to ${receiverId}. Text: ${
            text ? "Yes" : "No"
        }, Image: ${image ? "Yes" : "No"}`
    );

    if (!senderId) {
        console.error("[sendMessage] Error: Sender ID not found in request.");
        return res
            .status(401)
            .json({ error: "Unauthorized: Sender ID missing." });
    }
    if (!receiverId) {
        return res.status(400).json({ error: "Receiver ID is missing." });
    }
    if (!text && !image) {
        return res.status(400).json({
            error: "Message cannot be empty (text or image required).",
        });
    }

    if (
        image &&
        (typeof image !== "string" || !image.startsWith("data:image/"))
    ) {
        console.log(
            `[sendMessage] From ${senderId}: Invalid image format (expected base64 data URL).`
        );
        return res
            .status(400)
            .json({ error: "Invalid image format (must be base64 data URL)." });
    }
    if (image && (!s3Client || !BUCKET_NAME || !S3_ENDPOINT_URL)) {
        console.error(
            "[sendMessage] CRITICAL ERROR: S3 client or config missing for image upload."
        );
        return res.status(500).json({
            error: "Server configuration error [S3] for image upload.",
        });
    }

    let imageUrl = undefined;

    try {
        if (image) {
            const matches = image.match(
                /^data:image\/([A-Za-z-+/.=]+);base64,(.+)$/
            );
            if (!matches || matches.length !== 3) {
                console.log(
                    `[sendMessage] From ${senderId}: Invalid base64 format inside try-catch.`
                );
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

            console.log(
                `[sendMessage] From ${senderId}: Uploading image ${filename} to S3...`
            );
            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);
            imageUrl = `${S3_ENDPOINT_URL}/${BUCKET_NAME}/${filename}`;
        }

        console.log(
            `[sendMessage] From ${senderId} to ${receiverId}: Saving message to DB...`
        );
        const newMessage = new Message({
            senderId,
            receiverId,
            text: text || "",
            image: imageUrl,
        });

        await newMessage.save();
        console.log(
            `[sendMessage] From ${senderId} to ${receiverId}: Message saved successfully.`
        );

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
            error.message?.includes("base64") ||
            error.message?.includes("format")
                ? 400
                : error.$metadata?.httpStatusCode || 500;
        res.status(statusCode).json({
            error: "Internal server error during message sending.",
        });
    }
};

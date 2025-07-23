import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../modules/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("markMessagesAsRead", async ({ otherUserId }) => {
        if (!userId || !otherUserId) return;
        try {
            // 1. Обновляем сообщения в БД: все сообщения от otherUserId к нам (userId) становятся 'read'
            await Message.updateMany(
                {
                    senderId: otherUserId,
                    receiverId: userId,
                    status: { $ne: "read" },
                },
                { $set: { status: "read" } }
            );

            // 2. Получаем сокет собеседника, чтобы отправить ему обновление
            const receiverSocketId = getReceiverSocketId(otherUserId);
            if (receiverSocketId) {
                // 3. Отправляем событие ТОЛЬКО собеседнику
                io.to(receiverSocketId).emit("messagesReadUpdate", {
                    // Отправляем ID того, КТО прочитал сообщения
                    conversationPartnerId: userId,
                });
            }
        } catch (error) {
            console.error("Error in markMessagesAsRead:", error.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };

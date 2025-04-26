import bcrypt from "bcryptjs";
import User from "../modules/user.model.js";
import { generateToken } from "../lib/utils.js";
import s3Client from "../lib/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            // generate jwt token here
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout conroller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user?._id;
    // --- 1. Получаем ОБА поля ---
    const { profilePic, bio } = req.body;
    const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    const S3_ENDPOINT_URL = process.env.AWS_S3_ENDPOINT_URL;

    // --- 2. Создаем пустой объект для обновления ---
    const updateData = {};

    console.log(`[UpdateProfile] Request for user: ${userId}`);

    if (!userId) {
        // ... (проверка userId без изменений) ...
        console.error("[UpdateProfile] Error: User ID not found in request.");
        return res
            .status(401)
            .json({ message: "Unauthorized: User ID missing." });
    }

    // --- 3. Обработка profilePic (если он есть) ---
    if (profilePic) {
        console.log(`[UpdateProfile] User ${userId}: Processing profilePic.`);
        if (!s3Client || !BUCKET_NAME || !S3_ENDPOINT_URL) {
            console.error("[UpdateProfile] Error: S3 config missing.");
            return res
                .status(500)
                .json({ message: "Server configuration error [S3]." });
        }
        if (
            typeof profilePic !== "string" ||
            !profilePic.startsWith("data:image/")
        ) {
            console.log(
                `[UpdateProfile] User ${userId}: Invalid profilePic data format.`
            );
            return res.status(400).json({
                message: "Profile picture must be a valid base64 data URL.",
            });
        }

        try {
            const matches = profilePic.match(
                /^data:image\/([A-Za-z-+/.=]+);base64,(.+)$/
            );
            if (!matches || matches.length !== 3)
                throw new Error("Invalid base64 format");
            const fullMimeType = matches[1];
            const base64Data = matches[2];
            const simpleImageType = fullMimeType
                .split(";")[0]
                .split("/")
                .pop()
                .split("+")[0];
            const imageBuffer = Buffer.from(base64Data, "base64");
            const contentType = `image/${simpleImageType}`;
            const filename = `profilePics/${userId}/${uuidv4()}.${simpleImageType}`;
            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: imageBuffer,
                ContentType: contentType,
            };

            console.log(
                `[UpdateProfile] User ${userId}: Uploading ${filename} to S3...`
            );
            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);
            const fileUrl = `${S3_ENDPOINT_URL}/${BUCKET_NAME}/${filename}`;
            console.log(
                `[UpdateProfile] User ${userId}: S3 upload successful. URL: ${fileUrl}`
            );

            updateData.profilePic = fileUrl;
        } catch (s3Error) {
            console.error(
                `[UpdateProfile] S3 ERROR for user ${userId}: ${s3Error.message}`
            );
            const statusCode = s3Error.$metadata?.httpStatusCode || 500;
            return res
                .status(statusCode)
                .json({ message: "Error uploading profile picture." });
        }
    }

    // --- 4. Обработка bio (если оно есть) ---
    // Проверяем, что bio было передано (может быть пустой строкой)
    if (bio !== undefined && bio !== null) {
        console.log(`[UpdateProfile] User ${userId}: Processing bio.`);
        if (typeof bio !== "string") {
            return res.status(400).json({ message: "Bio must be a string." });
        }
        if (bio.length > 70) {
            return res
                .status(400)
                .json({ message: "Bio cannot exceed 70 characters." });
        }
        // --- Добавляем bio в объект обновления ---
        updateData.bio = bio;
    }

    // --- 5. Проверяем, есть ли вообще что обновлять ---
    if (Object.keys(updateData).length === 0) {
        console.log(
            `[UpdateProfile] User ${userId}: No data provided for update.`
        );
        try {
            const currentUser = await User.findById(userId).select("-password");
            if (!currentUser)
                return res.status(404).json({ message: "User not found." });
            return res.status(200).json(currentUser);
        } catch (err) {
            return res
                .status(500)
                .json({ message: "Error fetching user data." });
        }
    }

    // --- 6. Обновляем пользователя в базе данных ---
    try {
        console.log(
            `[UpdateProfile] User ${userId}: Updating DB with:`,
            Object.keys(updateData)
        );
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        }).select("-password");

        if (!updatedUser) {
            console.error(
                `[UpdateProfile] Error: User ${userId} not found in DB during final update.`
            );
            return res
                .status(404)
                .json({ message: "User not found for update." });
        }

        console.log(
            `[UpdateProfile] User ${userId}: Profile update successful.`
        );
        res.status(200).json(updatedUser);
    } catch (dbError) {
        console.error(
            `[UpdateProfile] DB UPDATE ERROR for user ${userId}: ${dbError.message}`
        );
        if (dbError.name === "ValidationError") {
            return res.status(400).json({ message: dbError.message });
        }
        res.status(500).json({
            message: "Internal server error during database update.",
        });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server error" });
    }
};

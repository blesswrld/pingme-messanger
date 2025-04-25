import bcrypt from "bcryptjs";
import User from "../modules/user.model.js";
import { generateToken } from "../lib/utils.js";
import s3Client from "../lib/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

import { config } from "dotenv";

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
    const { profilePic } = req.body;
    const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    const S3_ENDPOINT_URL = process.env.AWS_S3_ENDPOINT_URL;

    console.log(`[UpdateProfile] Request for user: ${userId}`);

    if (!userId) {
        console.error("[UpdateProfile] Error: User ID not found in request.");
        return res
            .status(401)
            .json({ message: "Unauthorized: User ID missing." });
    }
    if (!s3Client) {
        console.error(
            "[UpdateProfile] CRITICAL ERROR: S3 client not initialized."
        );
        return res
            .status(500)
            .json({ message: "Server configuration error [S3 Client]." });
    }
    if (!BUCKET_NAME || !S3_ENDPOINT_URL) {
        console.error(
            "[UpdateProfile] Error: S3 Bucket Name or Endpoint URL not found in .env"
        );
        return res.status(500).json({
            message: "Server configuration error [S3 Bucket/Endpoint].",
        });
    }
    if (
        !profilePic ||
        typeof profilePic !== "string" ||
        !profilePic.startsWith("data:image/")
    ) {
        console.log(
            `[UpdateProfile] User ${userId}: Invalid or missing profilePic data (expected base64 data URL).`
        );
        return res.status(400).json({
            message: "Profile picture is required as a valid base64 data URL.",
        });
    }

    try {
        const matches = profilePic.match(
            /^data:image\/([A-Za-z-+/.=]+);base64,(.+)$/
        );
        if (!matches || matches.length !== 3) {
            console.log(
                `[UpdateProfile] User ${userId}: Invalid base64 format.`
            );
            return res
                .status(400)
                .json({ message: "Invalid base64 image format" });
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
            `[UpdateProfile] User ${userId}: Updating user in DB with URL: ${fileUrl}`
        );
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: fileUrl },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            console.error(
                `[UpdateProfile] Error: User ${userId} not found in DB after upload.`
            );
            return res
                .status(404)
                .json({ message: "User not found for update." });
        }

        console.log(
            `[UpdateProfile] User ${userId}: Profile update successful.`
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(
            `[UpdateProfile] CRITICAL ERROR for user ${userId}: ${error.message}`
        );
        console.error("Stack:", error.stack);
        const statusCode =
            error.message?.includes("base64") ||
            error.message?.includes("format")
                ? 400
                : error.$metadata?.httpStatusCode || 500;
        res.status(statusCode).json({
            message: "Internal server error during profile update.",
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

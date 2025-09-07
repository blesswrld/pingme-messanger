import bcrypt from "bcryptjs";
import User from "../modules/user.model.js";
import { generateToken } from "../lib/utils.js";
import s3Client from "../lib/s3Client.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
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
            bio,
        });

        if (email === process.env.DEVELOPER_EMAIL) {
            newUser.achievements.push(
                "AppDeveloper",
                "FrontendDeveloper",
                "ReactDeveloper"
            );
            console.log(`Developer achievements awarded to ${email}`);
        }

        if (newUser) {
            // generate jwt token here
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                bio: newUser.bio,
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
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        const userObject = user.toObject();
        delete userObject.password;
        res.status(200).json(userObject);
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
    // --- 1. Получаем все возможные поля из запроса ---
    const { profilePic, bio, fullName } = req.body;
    const {
        AWS_S3_BUCKET_NAME: BUCKET_NAME,
        AWS_S3_ENDPOINT_URL: S3_ENDPOINT_URL,
    } = process.env;

    // --- 2. Создаем пустой объект для данных, которые нужно обновить ---
    const updateData = {};

    console.log(`[UpdateProfile] Request for user: ${userId}`);
    if (!userId)
        return res
            .status(401)
            .json({ message: "Unauthorized: User ID missing." });

    try {
        // Получаем текущего пользователя для сравнения
        const currentUser = await User.findById(userId);
        if (!currentUser)
            return res.status(404).json({ message: "User not found." });

        // --- 3. Обработка profilePic (если поле пришло в запросе) ---
        if (profilePic) {
            console.log(
                `[UpdateProfile] User ${userId}: Processing profilePic.`
            );
            // Проверки конфигурации S3
            if (!s3Client || !BUCKET_NAME || !S3_ENDPOINT_URL)
                return res
                    .status(500)
                    .json({ message: "Server configuration error [S3]." });
            // Проверка формата base64
            if (
                typeof profilePic !== "string" ||
                !profilePic.startsWith("data:image/")
            )
                return res.status(400).json({
                    message: "Profile picture must be a valid base64 data URL.",
                });

            // Вложенный try...catch для операции с S3
            try {
                // Логика парсинга base64
                const matches = profilePic.match(
                    /^data:image\/([A-Za-z-+/.=]+);base64,(.+)$/
                );
                if (!matches || matches.length !== 3)
                    throw new Error("Invalid base64 format");
                const base64Data = matches[2];
                const imageBuffer = Buffer.from(base64Data, "base64");

                // ⭐ ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЯ С ПОМОЩЬЮ SHARP
                const optimizedBuffer = await sharp(imageBuffer)
                    .resize({ width: 300, height: 300, fit: "cover" })
                    .toFormat("jpeg", { quality: 85 })
                    .toBuffer();

                // Загрузка на S3
                const filename = `profilePics/${userId}/${uuidv4()}.jpeg`; // Всегда .jpeg после оптимизации
                const uploadParams = {
                    Bucket: BUCKET_NAME,
                    Key: filename,
                    Body: optimizedBuffer, // Используем оптимизированный буфер
                    ContentType: "image/jpeg",
                };
                await s3Client.send(new PutObjectCommand(uploadParams));

                const fileUrl = `${S3_ENDPOINT_URL}/${BUCKET_NAME}/${filename}`;
                console.log(
                    `[UpdateProfile] User ${userId}: S3 upload successful. URL: ${fileUrl}`
                );

                // Добавляем в объект обновления
                updateData.profilePic = fileUrl;

                // ⭐ УДАЛЕНИЕ СТАРОГО АВАТАРА ИЗ S3
                // Проверяем, был ли у пользователя старый аватар
                if (currentUser.profilePic) {
                    try {
                        // Извлекаем ключ (имя файла) из полного URL
                        const oldKey = currentUser.profilePic.split(
                            `${BUCKET_NAME}/`
                        )[1];
                        if (oldKey) {
                            const deleteCommand = new DeleteObjectCommand({
                                Bucket: BUCKET_NAME,
                                Key: oldKey,
                            });
                            await s3Client.send(deleteCommand);
                            console.log(
                                `[UpdateProfile] User ${userId}: Successfully deleted old profile pic: ${oldKey}`
                            );
                        }
                    } catch (deleteError) {
                        // Важно: ошибка удаления не должна прерывать запрос. Просто логируем ее.
                        console.error(
                            `[UpdateProfile] User ${userId}: FAILED to delete old profile pic. Error: ${deleteError.message}`
                        );
                    }
                }
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

        // --- 4. Обработка bio (если поле пришло в запросе) ---
        if (bio !== undefined && bio !== null) {
            if (bio !== currentUser.bio) {
                console.log(
                    `[UpdateProfile] User ${userId}: Processing bio (it's different).`
                );
                if (typeof bio !== "string")
                    return res
                        .status(400)
                        .json({ message: "Bio must be a string." });
                if (bio.length > 210)
                    return res
                        .status(400)
                        .json({ message: "Bio cannot exceed 210 characters." });
                updateData.bio = bio;
            } else {
                console.log(
                    `[UpdateProfile] User ${userId}: Bio is the same. Skipping update.`
                );
            }
        }

        // --- 5. Обработка fullName ---
        if (fullName !== undefined && fullName !== null) {
            const trimmedFullName = fullName.trim();
            if (trimmedFullName !== currentUser.fullName) {
                console.log(
                    `[UpdateProfile] User ${userId}: Processing fullName (it's different).`
                );
                if (trimmedFullName.length < 2 || trimmedFullName.length > 30) {
                    return res.status(400).json({
                        message: "Validation Error",
                        i18nKey: "profilePage.usernameLengthError",
                    });
                }
                updateData.fullName = trimmedFullName;
            } else {
                console.log(
                    `[UpdateProfile] User ${userId}: FullName is the same. Skipping update.`
                );
            }
        }

        // --- 6. Проверяем, есть ли вообще что обновлять ---
        if (Object.keys(updateData).length === 0) {
            console.log(
                `[UpdateProfile] User ${userId}: No actual changes detected. Returning current user data.`
            );
            const userObject = currentUser.toObject();
            delete userObject.password;
            return res.status(200).json(userObject);
        }

        // --- 7. Обновляем пользователя в базе данных ТОЛЬКО измененными полями ---
        console.log(
            `[UpdateProfile] User ${userId}: Updating DB with changed fields:`,
            Object.keys(updateData)
        );
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        }).select("-password");

        if (!updatedUser)
            return res
                .status(404)
                .json({ message: "User not found during final update." });

        console.log(
            `[UpdateProfile] User ${userId}: Profile update successful.`
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(
            `[UpdateProfile] UNEXPECTED ERROR for user ${userId}: ${error.message}`
        );
        if (error.name === "ValidationError")
            return res.status(400).json({ message: error.message });
        res.status(500).json({
            message: "Internal server error during profile update.",
        });
    }
};

export const updateProfileTheme = async (req, res) => {
    try {
        const { theme } = req.body;
        const userId = req.user._id;

        const allowedThemes = [
            "primary",
            "secondary",
            "accent",
            "neutral",
            "info",
            "success",
            "warning",
            "error",
            "red",
            "orange",
            "lime",
            "teal",
            "cyan",
            "indigo",
            "violet",
            "rose",
        ];
        if (!theme || !allowedThemes.includes(theme)) {
            return res.status(400).json({ error: "Invalid theme value" });
        }

        await User.findByIdAndUpdate(userId, { profileTheme: theme });

        res.status(200).json({ message: "Theme updated successfully", theme });
    } catch (error) {
        console.error("Error in updateProfileTheme controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server error" });
    }
};

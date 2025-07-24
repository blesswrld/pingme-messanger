import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
            maxLength: 210,
            default: "",
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        profileTheme: { type: String, default: "primary" },
        stats: {
            messagesSent: {
                type: Number,
                default: 0,
            },
        },
        achievements: [String],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

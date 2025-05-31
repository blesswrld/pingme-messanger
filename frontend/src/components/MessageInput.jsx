import React, { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, Video, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const MessageInput = () => {
    const { t } = useTranslation();
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const imageFileInputRef = useRef(null);
    const videoFileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const { sendMessage, selectedUser, isSendingMessage } = useChatStore();

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
        }
    }, [text]);

    const clearMedia = () => {
        setImagePreview(null);
        setVideoPreview(null);

        if (imageFileInputRef.current) imageFileInputRef.current.value = "";
        if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    };

    const handleMediaChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) {
            clearMedia();
            return;
        }

        // Строгая проверка типа файла
        if (!file.type.startsWith(type + "/")) {
            toast.error(
                t(
                    `chatInput.select${
                        type === "image" ? "Image" : "Video"
                    }Error`
                )
            );
            e.target.value = "";
            clearMedia();
            return;
        }

        // Очищаем другое медиа, если пользователь выбирает новый тип
        if (type === "image") {
            setVideoPreview(null);
            if (videoFileInputRef.current) videoFileInputRef.current.value = "";
        } else if (type === "video") {
            // Используем else if для ясности
            setImagePreview(null);
            if (imageFileInputRef.current) imageFileInputRef.current.value = "";
        }

        const MAX_VIDEO_SIZE_MB = 25;
        const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

        if (type === "video" && file.size > MAX_VIDEO_SIZE_BYTES) {
            toast.error(
                t("chatInput.videoTooLarge", { size: MAX_VIDEO_SIZE_MB })
            );
            e.target.value = "";
            clearMedia();
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // --- словное присвоение ---
            if (type === "image") {
                setImagePreview(reader.result);
                setVideoPreview(null);
            } else if (type === "video") {
                setVideoPreview(reader.result);
                setImagePreview(null);
            }
            console.log(`[DEBUG: handleMediaChange] Set ${type} preview.`);
            console.log(
                `[DEBUG: handleMediaChange] imagePreview is now: ${!!imagePreview}`
            );
            console.log(
                `[DEBUG: handleMediaChange] videoPreview is now: ${!!videoPreview}`
            );
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const canSend =
            (text.trim() || imagePreview || videoPreview) && !isSendingMessage;
        if (!canSend || !selectedUser) return;

        console.log("--- DEBUG: Sending Message ---");
        console.log("Text:", text);
        console.log("Image Preview (exists):", !!imagePreview);
        console.log("Video Preview (exists):", !!videoPreview);
        if (imagePreview) {
            console.log(
                "Image Preview (first 50 chars):",
                imagePreview.substring(0, 50),
                "..."
            );
            console.log("Image Preview Length:", imagePreview.length);
        }
        if (videoPreview) {
            console.log(
                "Video Preview (first 50 chars):",
                videoPreview.substring(0, 50),
                "..."
            );
            console.log("Video Preview Length:", videoPreview.length);
        }
        console.log("----------------------------");

        await sendMessage(selectedUser._id, text, imagePreview, videoPreview);

        setText("");
        clearMedia();
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const showSendButton =
        (text.trim() || imagePreview || videoPreview) && !isSendingMessage;

    return (
        <div className="p-4 border-t border-base-300 bg-base-100 md:bg-base-200 md:rounded-br-lg">
            {(imagePreview || videoPreview) && (
                <div className="mb-2 relative w-32 h-32 group flex items-center justify-center rounded-lg border border-base-300 overflow-hidden">
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt={t("chatInput.imagePreviewAlt")}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {videoPreview && (
                        <video
                            src={videoPreview}
                            controls
                            className="w-full h-full object-contain bg-black"
                        />
                    )}
                    <button
                        onClick={clearMedia}
                        className="btn btn-xs btn-error absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                        aria-label={t("chatInput.removeMedia")}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                {/* Textarea Input - takes up most space */}
                <textarea
                    ref={textareaRef}
                    className="textarea textarea-bordered rounded-lg w-full text-sm resize-none overflow-y-auto flex-grow focus:textarea-primary focus-within:outline-none"
                    placeholder={t("chatInput.placeholder")}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ maxHeight: "120px" }}
                    disabled={isSendingMessage}
                />

                {/* Buttons Group */}
                <div className="flex items-end flex-shrink-0">
                    {/* Кнопка прикрепления изображения */}
                    <div
                        className="tooltip"
                        data-tip={t("chatInput.attachImage")}
                    >
                        {" "}
                        {/* <--- Перевод */}
                        <button
                            type="button"
                            className={`btn btn-ghost btn-circle ${
                                imagePreview
                                    ? "text-primary"
                                    : "text-base-content/50"
                            }`}
                            onClick={() => imageFileInputRef.current?.click()}
                            disabled={isSendingMessage || videoPreview}
                        >
                            <Image className="w-5 h-5" />
                        </button>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={imageFileInputRef}
                        onChange={(e) => handleMediaChange(e, "image")}
                        disabled={isSendingMessage || videoPreview}
                    />

                    {/* Video Button */}
                    <div
                        className="tooltip"
                        data-tip={t("chatInput.attachVideo")}
                    >
                        <button
                            type="button"
                            className={`btn btn-ghost btn-circle ${
                                videoPreview
                                    ? "text-primary"
                                    : "text-base-content/50"
                            }`}
                            onClick={() => videoFileInputRef.current?.click()}
                            disabled={isSendingMessage || imagePreview}
                        >
                            <Video className="w-5 h-5" />
                        </button>
                    </div>
                    <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        ref={videoFileInputRef}
                        onChange={(e) => handleMediaChange(e, "video")}
                        disabled={isSendingMessage || imagePreview}
                    />

                    {/* Send Button - Conditional Rendering */}
                    <div
                        className={`transition-opacity duration-200 ${
                            showSendButton ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        {showSendButton && (
                            <div
                                className="tooltip"
                                data-tip={t("chatInput.sendMessage")}
                            >
                                {" "}
                                {/* <--- Перевод */}
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-circle"
                                    disabled={!showSendButton}
                                >
                                    {isSendingMessage ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MessageInput;

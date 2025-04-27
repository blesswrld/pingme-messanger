import React, { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const canSend = (text.trim() || imagePreview) && !isSendingMessage;
        if (!canSend || !selectedUser) return;

        await sendMessage(selectedUser._id, text, imagePreview);

        setText("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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

    const showSendButton = (text.trim() || imagePreview) && !isSendingMessage;

    return (
        <div className="p-4 border-t border-base-300 bg-base-100 md:bg-base-200 md:rounded-br-lg">
            {imagePreview && (
                <div className="mb-2 relative w-20 h-20 group">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border border-base-300"
                    />
                    <button
                        onClick={removeImage}
                        className="btn btn-xs btn-circle btn-error absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                        aria-label="Remove image"
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
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{ maxHeight: "120px" }}
                    disabled={isSendingMessage}
                />

                {/* Buttons Group */}
                <div className="flex items-end flex-shrink-0">
                    {/* Attach Image Button */}
                    <div className="tooltip" data-tip="Attach image">
                        <button
                            type="button"
                            className={`btn btn-ghost btn-circle ${
                                imagePreview
                                    ? "text-primary"
                                    : "text-base-content/50"
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSendingMessage}
                        >
                            <Image className="w-5 h-5" />
                        </button>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        disabled={isSendingMessage}
                    />

                    {/* Send Button - Conditional Rendering */}
                    <div
                        className={`transition-opacity duration-200 ${
                            showSendButton ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        {showSendButton && (
                            <div className="tooltip" data-tip="Send message">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-circle"
                                    disabled={!showSendButton} // disable if not shown
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

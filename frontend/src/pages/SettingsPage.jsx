import React from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, Check, Paperclip, Smile, CheckCheck } from "lucide-react";

// --- Стили ---
const chatBubbleBase =
    "max-w-[70%] sm:max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm text-sm leading-relaxed relative";
const chatBubbleSent = "bg-primary text-primary-content";
const chatBubbleReceived = "bg-base-100 text-content";
const messageInputWrapperClasses = "relative flex items-center flex-1";
const messageInputBaseClasses =
    "block w-full rounded-xl border-0 py-2 pl-10 pr-10 bg-base-100 text-content shadow-sm ring-1 ring-inset ring-transparent placeholder:text-base-content/40 focus:ring-1 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 resize-none";
const iconButtonClasses =
    "inline-flex items-center justify-center p-2 rounded-full text-base-content/60 hover:text-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 transition-colors duration-150 ease-in-out";
const sendButtonClasses =
    "inline-flex items-center justify-center size-10 rounded-full bg-primary text-primary-content hover:bg-primary/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 disabled:!bg-primary/40 transition-all duration-150 ease-in-out shrink-0";

const PREVIEW_MESSAGES = [
    { id: 1, content: "Hey! How's it going?", isSent: false },
    {
        id: 2,
        content: "I'm doing great! Just working on some new features.",
        isSent: true,
    },
    {
        id: 3,
        content: "Awesome! Let me know if you need help testing.",
        isSent: false,
    },
];

const SettingsPage = () => {
    const { theme, setTheme } = useThemeStore();
    const { authUser } = useAuthStore();
    return (
        <div className="min-h-screen container mx-auto px-4 pt-20 max-w-4xl pb-10">
            <div className="space-y-8">
                {/* --- Theme Section --- */}
                <div>
                    <h2 className="text-xl font-semibold mb-1">Theme</h2>
                    <p className="text-sm text-base-content/70">
                        Choose a theme for your chat interface.
                    </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {THEMES.map((t) => (
                        <button
                            key={t}
                            className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                                theme === t
                                    ? "bg-primary/5 ring-1 ring-primary"
                                    : "hover:bg-base-200"
                            }`}
                            onClick={() => setTheme(t)}
                            aria-pressed={theme === t}
                        >
                            <div
                                className="h-8 w-full rounded-md overflow-hidden"
                                data-theme={t}
                            >
                                <div className="grid grid-cols-4 h-full">
                                    <div className="bg-primary"></div>
                                    <div className="bg-secondary"></div>
                                    <div className="bg-accent"></div>
                                    <div className="bg-neutral"></div>
                                </div>
                            </div>
                            <span className="text-xs font-medium truncate w-full text-center">
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </span>
                            {theme === t && (
                                <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 rounded-full bg-primary">
                                    <Check className="size-3 text-primary-content" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* --- Preview Section --- */}
                <div>
                    <h2 className="text-xl font-semibold mb-1">Preview</h2>
                    <p className="text-sm text-base-content/70 mb-4">
                        See how the selected theme looks in action.
                    </p>
                </div>
                <div className="rounded-xl overflow-hidden bg-base-200 shadow-sm">
                    {/* Preview Header */}
                    <div className="p-3 border-base-content/5 bg-base-100 flex items-center justify-between shrink-0 h-[65px]">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative shrink-0">
                                <img
                                    src="/avatar.png"
                                    alt="Preview User"
                                    className="size-10 object-cover rounded-full"
                                />
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-base-100" />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-semibold truncate text-sm">
                                    Jane Doe
                                </h3>
                                <p className="text-xs truncate text-success/80">
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Preview Messages */}
                    <div className="p-3 space-y-1.5 h-[250px] overflow-y-auto bg-base-200">
                        {PREVIEW_MESSAGES.map((message, index) => {
                            const isSent = message.isSent;
                            // Используем authUser?.profilePic для аватара отправленного сообщения
                            const profilePic = isSent
                                ? authUser?.profilePic || "/avatar.png"
                                : "/avatar.png";
                            const isLastInGroup =
                                index === PREVIEW_MESSAGES.length - 1 ||
                                PREVIEW_MESSAGES[index + 1]?.isSent !==
                                    message.isSent;
                            const isRead = isSent && index % 3 === 0; // Заглушка статуса
                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-2 ${
                                        isSent ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    {!isSent && isLastInGroup && (
                                        <img
                                            src={profilePic}
                                            alt="Avatar"
                                            className="size-7 rounded-full self-end shrink-0 mb-1"
                                        />
                                    )}
                                    {!isSent && !isLastInGroup && (
                                        <div className="w-7 shrink-0"></div>
                                    )}
                                    <div
                                        className={`flex flex-col ${
                                            isSent ? "items-end" : "items-start"
                                        }`}
                                    >
                                        <div
                                            className={`${chatBubbleBase} ${
                                                isSent
                                                    ? chatBubbleSent
                                                    : chatBubbleReceived
                                            }`}
                                        >
                                            <p className="break-words">
                                                {message.content}
                                            </p>
                                            <div
                                                className={`text-[10px] mt-1 ml-2 flex items-center gap-1 ${
                                                    isSent
                                                        ? "text-primary-content/70 justify-end"
                                                        : "text-base-content/50 justify-end"
                                                }`}
                                            >
                                                <span>12:00 PM</span>
                                                {isSent &&
                                                    (isRead ? (
                                                        <CheckCheck size={14} />
                                                    ) : (
                                                        <Check size={14} />
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Preview Input */}
                    <div className="p-2 sm:p-3 bg-base-100 shrink-0">
                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                className={`${iconButtonClasses} mb-0.5`}
                                aria-label="Emoji"
                            >
                                <Smile size={22} />
                            </button>
                            <div className={messageInputWrapperClasses}>
                                <input
                                    type="text"
                                    className={`${messageInputBaseClasses} !pl-10 !pr-10`}
                                    placeholder="Message"
                                    value="This is a preview..."
                                    readOnly
                                />{" "}
                                <button
                                    type="button"
                                    className={`${iconButtonClasses} absolute right-1.5`}
                                    aria-label="Attach file"
                                >
                                    <Paperclip size={22} />
                                </button>
                            </div>
                            <button
                                type="button"
                                className={sendButtonClasses}
                                aria-label="Send message"
                            >
                                <Send size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

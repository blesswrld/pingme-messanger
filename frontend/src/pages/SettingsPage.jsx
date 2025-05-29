import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import {
    Send as SendIcon,
    Check,
    CheckCheck,
    Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const chatBubbleBase =
    "rounded-lg px-3 py-1.5 shadow-sm text-sm leading-relaxed relative";
const chatBubbleSent = "bg-primary text-primary-content";
const chatBubbleReceived = "bg-base-100 text-content";

const PREVIEW_MESSAGES_KEYS = [
    { id: 1, contentKey: "settingsPage.previewMessages.msg1", isSent: false },
    {
        id: 2,
        contentKey: "settingsPage.previewMessages.msg2",
        isSent: true,
    },
    {
        id: 3,
        contentKey: "settingsPage.previewMessages.msg3",
        isSent: false,
    },
];

const SettingsPage = () => {
    const { t } = useTranslation();
    const { theme, setTheme } = useThemeStore();
    const { authUser } = useAuthStore();
    return (
        <div className="min-h-screen container mx-auto px-4 pt-20 max-w-4xl pb-10">
            <div className="space-y-8">
                {/* --- Theme Section --- */}
                <div>
                    <h2 className="text-xl font-semibold mb-1">
                        {t("settingsPage.themeTitle")}
                    </h2>
                    <p className="text-sm text-base-content/70">
                        {t("settingsPage.themeSubtitle")}
                    </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {THEMES.map(
                        (
                            themeOption // themeOption - это ключ темы, например "light", "dark"
                        ) => (
                            <button
                                key={themeOption}
                                className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                                    theme === themeOption
                                        ? "bg-primary/5 ring-1 ring-primary"
                                        : "hover:bg-base-200"
                                }`}
                                onClick={() => setTheme(themeOption)}
                                aria-pressed={theme === themeOption}
                            >
                                <div
                                    className="h-8 w-full rounded-md overflow-hidden"
                                    data-theme={themeOption} // data-theme остается ключом темы
                                >
                                    <div className="grid grid-cols-4 h-full">
                                        <div className="bg-primary"></div>
                                        <div className="bg-secondary"></div>
                                        <div className="bg-accent"></div>
                                        <div className="bg-neutral"></div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium truncate w-full text-center">
                                    {t(`settingsPage.themes.${themeOption}`, {
                                        defaultValue:
                                            themeOption
                                                .charAt(0)
                                                .toUpperCase() +
                                            themeOption.slice(1),
                                    })}
                                    {/* Используем t() для перевода названия темы. defaultValue на случай, если перевод отсутствует. */}
                                </span>
                                {theme === themeOption && (
                                    <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 rounded-full bg-primary">
                                        <Check className="size-3 text-primary-content" />
                                    </div>
                                )}
                            </button>
                        )
                    )}
                </div>

                {/* --- Preview Section --- */}
                <div>
                    <h2 className="text-xl font-semibold mb-1">
                        {t("settingsPage.previewTitle")}
                    </h2>
                    <p className="text-sm text-base-content/70 mb-4">
                        {t("settingsPage.previewSubtitle")}
                    </p>
                </div>
                <div className="rounded-xl overflow-hidden bg-base-200 shadow-sm">
                    {/* Preview Header */}
                    <div className="p-3 bg-base-100 flex items-center justify-between shrink-0 h-[65px]">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative shrink-0">
                                <img
                                    src={authUser?.profilePic || "/avatar.png"}
                                    alt={t("settingsPage.previewUserName")}
                                    className="size-10 object-cover rounded-full"
                                />
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-base-100" />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-semibold truncate text-sm">
                                    {authUser?.fullName ||
                                        t("settingsPage.previewUserName")}
                                </h3>
                                <p className="text-xs truncate text-success/80">
                                    {t("settingsPage.previewStatusOnline")}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Preview Messages */}
                    <div className="p-3 space-y-1.5 h-[250px] overflow-y-auto bg-base-200">
                        {PREVIEW_MESSAGES_KEYS.map((message, index) => {
                            const isSent = message.isSent;
                            // Используем authUser?.profilePic для аватара отправленного сообщения
                            const profilePic = isSent
                                ? authUser?.profilePic || "/avatar.png"
                                : "/avatar.png";
                            const isLastInGroup =
                                index === PREVIEW_MESSAGES_KEYS.length - 1 ||
                                (PREVIEW_MESSAGES_KEYS[index + 1] &&
                                    PREVIEW_MESSAGES_KEYS[index + 1]?.isSent !==
                                        message.isSent);
                            const isRead = isSent && index % 3 === 0;
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
                                                {t(message.contentKey)}
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
                    {/* Preview Input - стили как в MessageInput.jsx */}
                    <div className="p-4 bg-base-100">
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="flex items-end gap-2"
                        >
                            <textarea
                                className="textarea textarea-bordered rounded-lg w-full text-sm resize-none overflow-y-auto flex-grow focus:textarea-primary focus-within:outline-none"
                                placeholder={t("chatInput.placeholder")}
                                value={t("settingsPage.previewMessageValue")}
                                rows={1}
                                style={{ maxHeight: "120px" }}
                                readOnly
                                onChange={() => {}} //
                            />
                            <div className="flex items-end flex-shrink-0">
                                <div
                                    className="tooltip"
                                    data-tip={t("chatInput.attachImage")}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-circle text-base-content/50"
                                        disabled
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="transition-opacity duration-200 opacity-100">
                                    {/* Кнопка всегда видима в превью */}
                                    <div
                                        className="tooltip"
                                        data-tip={t("chatInput.sendMessage")}
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-circle"
                                            disabled
                                        >
                                            <SendIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

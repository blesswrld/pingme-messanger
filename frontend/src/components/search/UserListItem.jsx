import React from "react";
// import useChatStore from "../../store/useChatStore";
import { useTranslation } from "react-i18next";

const UserListItem = ({ user, onUserSelect }) => {
    // const { setSelectedUser } = useChatStore();
    const { t } = useTranslation();

    const handleClick = () => {
        // Удаляем setSelectedUser(user) здесь, так как навигация перенаправит на страницу профиля,
        // где выбранный пользователь не устанавливается, чтобы не ломать логику чата
        if (onUserSelect) {
            onUserSelect(user); // Передаем объект пользователя в колбэк
        }
    };

    return (
        <li>
            <button
                className="flex items-center w-full p-2 hover:bg-base-300 focus:bg-base-300 rounded-md cursor-pointer transition-colors duration-150 outline-none text-left"
                onClick={handleClick}
            >
                <div className="avatar mr-2 flex-shrink-0">
                    <div className="w-8 rounded-full">
                        <img
                            src={user.profilePic || "/avatar.png"}
                            alt={t("userSearch.userProfileAlt", {
                                name: user.fullName,
                            })}
                        />
                    </div>
                </div>
                <span className="font-medium text-sm text-base-content truncate">
                    {user.fullName}
                </span>
            </button>
        </li>
    );
};

export default UserListItem;

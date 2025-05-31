import React from "react";
// import useChatStore from "../../store/useChatStore";
import { useTranslation } from "react-i18next";

const UserListItem = ({ user, onUserSelect }) => {
    // Получаем весь объект состояния из useChatStore
    // const chatStore = useChatStore();
    const { t } = useTranslation();

    const handleClick = () => {
        // Убрал setSelectedUser(user) отсюда, так как UserSearch.jsx уже вызывает navigate на профиль.
        // Если вы хотите, чтобы при клике на пользователя в поиске он сразу открывался в чате,
        // то можете вернуть chatStore.setSelectedUser(user) и убрать navigate(`/profile/${user._id}`) в UserSearch.
        if (onUserSelect) {
            onUserSelect(user);
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

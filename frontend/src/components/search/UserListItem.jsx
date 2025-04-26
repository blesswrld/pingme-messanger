import React from "react";
import useChatStore from "../../store/useChatStore";

const UserListItem = ({ user, onUserSelect }) => {
    // <<< Добавляем пропс onUserSelect
    const { setSelectedUser } = useChatStore(); // <<< Получаем функцию из стора

    const handleClick = () => {
        setSelectedUser(user); // <<< Устанавливаем выбранного пользователя в сторе чата
        if (onUserSelect) {
            onUserSelect(); // <<< Вызываем колбэк для очистки поиска
        }
    };

    return (
        <li
            className="flex items-center p-2 bg-base-200 hover:bg-base-300 rounded-lg cursor-pointer transition-colors duration-150"
            onClick={handleClick} // <<< Обработчик клика
        >
            <div className="avatar mr-2">
                <div className="w-8 rounded-full">
                    <img
                        src={user.profilePic || "/avatar.png"}
                        alt={`${user.fullName}'s profile`}
                    />
                </div>
            </div>
            <span className="font-medium text-sm">{user.fullName}</span>
        </li>
    );
};

export default UserListItem;

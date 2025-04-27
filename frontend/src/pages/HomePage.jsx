import React from "react";
import { useChatStore } from "../store/useChatStore";
import NoChatSelected from "../components/NoChatSelected";
import SideBar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import Navbar from "../components/Navbar";

const HomePage = () => {
    const { selectedUser } = useChatStore();

    return (
        <div className="flex flex-col h-screen bg-base-100">
            <Navbar />
            <main className="flex-1 pt-16 overflow-hidden">
                <div className="h-full max-w-full mx-auto p-0">
                    <div className="flex flex-row h-full overflow-hidden bg-base-100 md:bg-base-200 md:shadow-lg rounded-none md:rounded-lg">
                        {/* Sidebar: Управляем видимостью и шириной */}
                        {/* По умолчанию (мобильные, планшеты): flex и w-full ЕСЛИ НЕТ selectedUser, иначе hidden */}
                        {/* На lg+: всегда flex и w-auto (ширина из style) */}
                        <div
                            className={`${
                                selectedUser
                                    ? "hidden lg:flex"
                                    : "flex w-full lg:w-auto"
                            }`}
                        >
                            <SideBar />
                        </div>

                        <div
                            className={`flex-1 ${
                                selectedUser
                                    ? "flex w-full lg:w-auto"
                                    : "hidden lg:flex"
                            }`}
                        >
                            {selectedUser ? (
                                <ChatContainer />
                            ) : (
                                <NoChatSelected />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;

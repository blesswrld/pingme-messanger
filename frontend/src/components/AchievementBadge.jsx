import React from "react";
import { MessageSquareText, Flame, Trophy, Gem } from "lucide-react";
import { useTranslation } from "react-i18next";

const AchievementBadge = ({ achievementId }) => {
    const { t } = useTranslation();

    const achievementData = {
        MSG_10: {
            icon: <MessageSquareText className="w-5 h-5" />,
            name: t("achievements.MSG_10.name"),
            description: t("achievements.MSG_10.desc"),
        },
        MSG_100: {
            icon: <Flame className="w-5 h-5" />,
            name: t("achievements.MSG_100.name"),
            description: t("achievements.MSG_100.desc"),
        },
        MSG_1000: {
            icon: <Trophy className="w-5 h-5" />,
            name: t("achievements.MSG_1000.name"),
            description: t("achievements.MSG_1000.desc"),
        },
        MSG_10000: {
            icon: <Gem className="w-5 h-5" />,
            name: t("achievements.MSG_10000.name"),
            description: t("achievements.MSG_10000.desc"),
        },
    };

    const data = achievementData[achievementId];

    if (!data) return null;

    return (
        <div className="tooltip" data-tip={`${data.name}: ${data.description}`}>
            <div className="placeholder">
                <div className="flex justify-center items-center bg-primary text-primary-content rounded-xl w-12 h-12">
                    {data.icon}
                </div>
            </div>
        </div>
    );
};

export default AchievementBadge;

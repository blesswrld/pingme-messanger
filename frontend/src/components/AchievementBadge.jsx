import React from "react";
import {
    MessageSquareText,
    Flame,
    Trophy,
    Gem,
    Code,
    Brush,
    Atom,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const AchievementBadge = ({ achievementId, index }) => {
    const { t } = useTranslation();

    const achievementData = {
        AppDeveloper: {
            icon: <Code className="w-6 h-6" />,
            name: t("achievements.AppDeveloper.name"),
            description: t("achievements.AppDeveloper.desc"),
            gradient: "from-indigo-500 to-purple-600",
            shadow: "shadow-indigo-500/50",
        },
        FrontendDeveloper: {
            icon: <Brush className="w-6 h-6" />,
            name: t("achievements.FrontendDeveloper.name"),
            description: t("achievements.FrontendDeveloper.desc"),
            gradient: "from-blue-400 to-emerald-400",
            shadow: "shadow-emerald-500/50",
        },
        ReactDeveloper: {
            icon: <Atom className="w-6 h-6" />,
            name: t("achievements.ReactDeveloper.name"),
            description: t("achievements.ReactDeveloper.desc"),
            gradient: "from-sky-500 to-cyan-400",
            shadow: "shadow-cyan-500/50",
        },
        MSG_10: {
            icon: <MessageSquareText className="w-6 h-6" />,
            name: t("achievements.MSG_10.name"),
            description: t("achievements.MSG_10.desc"),
            gradient: "from-sky-400 to-cyan-500",
            shadow: "shadow-cyan-500/50",
        },
        MSG_100: {
            icon: <Flame className="w-6 h-6" />,
            name: t("achievements.MSG_100.name"),
            description: t("achievements.MSG_100.desc"),
            gradient: "from-orange-400 to-red-500",
            shadow: "shadow-orange-500/50",
        },
        MSG_1000: {
            icon: <Trophy className="w-6 h-6" />,
            name: t("achievements.MSG_1000.name"),
            description: t("achievements.MSG_1000.desc"),
            gradient: "from-amber-400 to-yellow-500",
            shadow: "shadow-yellow-500/50",
        },
        MSG_10000: {
            icon: <Gem className="w-6 h-6" />,
            name: t("achievements.MSG_10000.name"),
            description: t("achievements.MSG_10000.desc"),
            gradient: "from-fuchsia-500 to-pink-600",
            shadow: "shadow-fuchsia-500/50",
        },
    };

    const data = achievementData[achievementId];

    if (!data) return null;

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            className="tooltip-bottom md:tooltip"
            data-tip={`${data.name}: ${data.description}`}
        >
            <div
                className={`relative w-24 h-20 rounded-2xl bg-gradient-to-br ${data.gradient} text-white shadow-lg ${data.shadow} flex flex-col items-center justify-center p-3`}
            >
                <div
                    className={`absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-0 animate-pulse-slow`}
                ></div>

                <div className="mb-1">{data.icon}</div>
                <p className="text-xs font-semibold text-center">{data.name}</p>
            </div>
        </motion.div>
    );
};

export default AchievementBadge;

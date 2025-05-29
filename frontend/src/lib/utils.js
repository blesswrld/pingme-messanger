export function formatMessageTime(date, t, currentLocale = "en-US") {
    const messageDate = new Date(date);
    const now = new Date();

    const time = messageDate.toLocaleTimeString(currentLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const diffInMs = now - messageDate;
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30.4375);
    const diffInYears = Math.floor(diffInDays / 365.25);

    if (diffInDays === 0) {
        return `${t("time.today")}, ${time}`;
    } else if (diffInDays === 1) {
        return `${t("time.yesterday")}, ${time}`;
    } else if (diffInDays >= 2 && diffInDays <= 6) {
        return `${diffInDays} ${t("time.day", { count: diffInDays })} ${t(
            "time.ago"
        )}, ${time}`;
    } else if (diffInDays >= 7 && diffInDays <= 13) {
        return `${t("time.week", { count: 1 })} ${t("time.ago")}, ${time}`;
    } else if (diffInDays >= 14 && diffInDays < Math.floor(30.4375 * 2) - 1) {
        return `${diffInWeeks} ${t("time.week", { count: diffInWeeks })} ${t(
            "time.ago"
        )}, ${time}`;
    } else if (diffInDays >= Math.floor(30.4375 * 2) - 1 && diffInDays < 365) {
        return `${
            diffInMonths <= 1
                ? t("time.month", { count: 1 })
                : diffInMonths + " " + t("time.month", { count: diffInMonths })
        } ${t("time.ago")}, ${time}`;
    } else {
        return `${
            diffInYears <= 1
                ? t("time.year", { count: 1 })
                : diffInYears + " " + t("time.year", { count: diffInYears })
        } ${t("time.ago")}, ${time}`;
    }
}

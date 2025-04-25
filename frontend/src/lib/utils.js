export function formatMessageTime(date) {
    const messageDate = new Date(date);
    const now = new Date();
    const time = messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const diffInMs = now - messageDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInDays === 0) {
        return `Today, ${time}`;
    } else if (diffInDays === 1) {
        return `Yesterday, ${time}`;
    } else if (diffInDays >= 2 && diffInDays <= 6) {
        return `${diffInDays} days ago, ${time}`;
    } else if (diffInDays >= 7 && diffInDays <= 13) {
        return `A week ago, ${time}`;
    } else if (diffInDays >= 14 && diffInDays <= 29) {
        return `${diffInWeeks} weeks ago, ${time}`;
    } else if (diffInDays >= 30 && diffInDays <= 59) {
        return `A month ago, ${time}`;
    } else if (diffInDays >= 60 && diffInDays <= 364) {
        return `${diffInMonths} months ago, ${time}`;
    } else if (diffInDays >= 365 && diffInDays <= 729) {
        return `A year ago, ${time}`;
    } else if (diffInDays >= 730) {
        return `${diffInYears} years ago, ${time}`;
    }

    return `${messageDate.toLocaleDateString("en-US")}, ${time}`;
}

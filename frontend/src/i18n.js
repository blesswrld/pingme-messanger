import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Импортируем файлы переводов
import translationEN from "./locales/en/translation.json";
import translationRU from "./locales/ru/translation.json";

const resources = {
    en: {
        translation: translationEN,
    },
    ru: {
        translation: translationRU,
    },
};

i18n.use(LanguageDetector) // Обнаруживает язык пользователя
    .use(initReactI18next) // Передает экземпляр i18n в react-i18next
    .init({
        resources,
        fallbackLng: "ru", // Язык по умолчанию, если язык пользователя не найден
        debug: process.env.NODE_ENV === "development", // Включает логи в консоли для разработки

        interpolation: {
            escapeValue: false, // React уже защищает от XSS
        },

        detection: {
            // Порядок и откуда определять язык
            order: [
                "localStorage",
                "navigator",
                "htmlTag",
                "path",
                "subdomain",
            ],
            // Ключ для сохранения выбранного языка в localStorage
            caches: ["localStorage"],
        },
    });

export default i18n;

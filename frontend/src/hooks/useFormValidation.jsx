import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useFormValidation = (initialState) => {
    const { t } = useTranslation();
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        // При изменении поля, если есть ошибка, сразу ее проверяем
        if (errors[name]) {
            validateField(name, value);
        }
    };

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "fullName":
                if (!value.trim()) error = t("signUpPage.usernameRequired");
                else if (value.trim().length < 3 || value.trim().length > 30)
                    error = t("signUpPage.usernameHint");
                break;
            case "email":
                if (!value) error = t("loginPage.emailRequired");
                else if (!/\S+@\S+\.\S+/.test(value))
                    error = t("loginPage.invalidEmail");
                break;
            case "password":
                if (!value) error = t("loginPage.passwordRequired");
                else if (value.length < 6)
                    error = t("loginPage.passwordMinLength");
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
        return !error;
    };

    const validateAll = () => {
        // validateAll
        const newErrors = {};
        if (values.hasOwnProperty("fullName")) {
            if (!values.fullName.trim())
                newErrors.fullName = t("signUpPage.usernameRequired");
            else if (
                values.fullName.trim().length < 3 ||
                values.fullName.trim().length > 30
            )
                newErrors.fullName = t("signUpPage.usernameHint");
        }
        if (!values.email) newErrors.email = t("loginPage.emailRequired");
        else if (!/\S+@\S+\.\S+/.test(values.email))
            newErrors.email = t("loginPage.invalidEmail");
        if (!values.password)
            newErrors.password = t("loginPage.passwordRequired");
        else if (values.password.length < 6)
            newErrors.password = t("loginPage.passwordMinLength");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        //  Отмечаем поле как "тронутое"
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        isSubmitting,
        setIsSubmitting,
    };
};

export const FormError = ({ message }) => {
    if (!message) return null;
    return <p className="text-error text-xs mt-1 animate-fade-in">{message}</p>;
};

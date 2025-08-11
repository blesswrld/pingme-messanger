import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormValidation, FormError } from "../hooks/useFormValidation.jsx";

const LoginPage = () => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoggingIn } = useAuthStore();

    const { values, errors, handleChange, handleBlur, validateAll } =
        useFormValidation({
            email: "",
            password: "",
        });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateAll()) {
            login(values);
        }
    };

    // TODO: ADD INTEGRATION WITH GOOGLE AND GITHUB
    // const handleGoogleAuth = () => {
    //     window.location.href = "/api/auth/google"; // Перенаправление на бэкенд
    // };

    // const handleGitHubAuth = () => {
    //     window.location.href = "/api/auth/github"; // Перенаправление на бэкенд
    // };

    return (
        <div className="h-screen grid lg:grid-cols-2">
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center mb-6">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <MessageSquare className="size-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">
                                {t("loginPage.welcomeBack")}
                            </h1>
                            <p className="text-base-content/60">
                                {t("loginPage.signInToAccount")}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label
                                className={`input w-full flex items-center gap-2 outline-none focus:outline-none focus-within:outline-none ${
                                    errors.email ? "input-error" : ""
                                }`}
                            >
                                <svg
                                    className="h-[1em] opacity-50"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <g
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        strokeWidth="2.5"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <rect
                                            width="20"
                                            height="16"
                                            x="2"
                                            y="4"
                                            rx="2"
                                        ></rect>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </g>
                                </svg>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder={t(
                                        "loginPage.emailPlaceholder"
                                    )}
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </label>
                            <FormError message={errors.email} />
                        </div>

                        <div className="space-y-1">
                            <label
                                className={`input w-full flex items-center gap-2 relative outline-none focus:outline-none focus-within:outline-none ${
                                    errors.password ? "input-error" : ""
                                }`}
                            >
                                <svg
                                    className="h-[1em] opacity-50"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <g
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        strokeWidth="2.5"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                                        <circle
                                            cx="16.5"
                                            cy="7.5"
                                            r=".5"
                                            fill="currentColor"
                                        ></circle>
                                    </g>
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder={t(
                                        "loginPage.passwordPlaceholder"
                                    )}
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-5 text-base-content/40" />
                                    ) : (
                                        <Eye className="size-5 text-base-content/40" />
                                    )}
                                </button>
                            </label>
                            <FormError message={errors.password} />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-outline btn-primary w-full flex flex-wrap"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    {t("loginPage.loading")}
                                </>
                            ) : (
                                t("loginPage.signIn")
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        {t("loginPage.orContinueWith")}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        {/* Google Button - светлая с рамкой */}
                        <button
                            type="button"
                            className="btn bg-white text-black border border-[#e5e5e5] hover:bg-gray-100 dark:bg-zinc-900 dark:text-white dark:border-black dark:hover:opacity-70 duration-200 transition-all"
                            // onClick={handleGoogleAuth}
                        >
                            <svg
                                aria-label="Google logo"
                                width="16"
                                height="16"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                            >
                                <g>
                                    <path d="m0 0H512V512H0" fill="#fff"></path>
                                    <path
                                        fill="#34a853"
                                        d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                                    ></path>
                                    <path
                                        fill="#4285f4"
                                        d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                                    ></path>
                                    <path
                                        fill="#fbbc02"
                                        d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                                    ></path>
                                    <path
                                        fill="#ea4335"
                                        d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                                    ></path>
                                </g>
                            </svg>
                            {t("loginPage.loginWithGoogle")}
                        </button>
                        {/* GitHub Button - темная */}
                        <button
                            type="button"
                            className="btn bg-black text-white border border-black hover:opacity-70 dark:bg-zinc-900 dark:border-black dark:hover:opacity-70 duration-200 transition-opacity"
                            // onClick={handleGitHubAuth}
                        >
                            <svg
                                aria-label="GitHub logo"
                                width="16"
                                height="16"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="white"
                                    d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                                ></path>
                            </svg>
                            {t("loginPage.loginWithGitHub")}
                        </button>
                    </div>

                    <p className="text-center text-sm">
                        {t("signUpPage.GoogleGitHubServices")}
                    </p>

                    <div className="text-center mt-4">
                        <p className="text-base-content/60">
                            {t("loginPage.noAccount")}{" "}
                            <Link
                                to="/signup"
                                className="link link-primary hover:opacity-70 transition-opacity duration-200"
                            >
                                {t("loginPage.createAccountLink")}
                            </Link>
                        </p>
                    </div>
                    <div
                        tabIndex={0}
                        className="collapse collapse-plus bg-base-100 border-base-300 border"
                    >
                        <div className="collapse-title font-semibold">
                            {t("loginPage.howToCreateTitle")}
                        </div>
                        <div className="collapse-content text-sm">
                            {t("loginPage.howToCreateContent")}
                        </div>
                    </div>
                </div>
            </div>

            <AuthImagePattern
                titleKey={t("authImagePattern.loginTitle")}
                subtitleKey="authImagePattern.loginSubtitle"
            />
        </div>
    );
};

export default LoginPage;

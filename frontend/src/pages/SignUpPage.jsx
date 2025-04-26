import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showUsernameHint, setShowUsernameHint] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const { signup, isSigningUp } = useAuthStore();

    const validateForm = () => {
        const usernameRegex = /^[a-zA-Z0-9-]{3,30}$/;
        if (!formData.fullName.trim()) {
            toast.error("Username is required");
            setShowUsernameHint(true);
            return false;
        }
        if (!usernameRegex.test(formData.fullName)) {
            toast.error(
                "Username must be 3 to 30 characters, containing only letters, numbers, or dash"
            );
            setShowUsernameHint(true);
            return false;
        }
        setShowUsernameHint(false);

        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Invalid email format");
            return false;
        }

        if (!formData.password) {
            toast.error("Password is required");
            return false;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.dismiss();

        const isValid = validateForm();
        if (isValid) {
            signup(formData);
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
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* left side */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-6">
                    {/* LOGO */}
                    <div className="text-center mb-6">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <MessageSquare className="size-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">
                                Create Account
                            </h1>
                            <p className="text-base-content/60">
                                Get started with your free account
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="input w-full validator flex items-center gap-2">
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
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </g>
                                </svg>
                                <input
                                    type="text"
                                    required
                                    placeholder="Username"
                                    minLength={3}
                                    maxLength={30}
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            fullName: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <p
                                className={`text-sm text-error ${
                                    showUsernameHint ? "block" : "hidden"
                                }`}
                            >
                                Must be 3 to 30 characters, containing only
                                letters, numbers, or dash
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="input w-full validator flex items-center gap-2">
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
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    required
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </label>
                        </div>

                        <div className="space-y-1">
                            <label className="input w-full validator flex items-center gap-2 relative">
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
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
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
                        </div>

                        <button
                            type="submit"
                            className="btn btn-outline btn-primary flex flex-wrap w-full"
                            disabled={isSigningUp}
                        >
                            {isSigningUp ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Loading
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-base-content/60">
                            Already have an account?
                            <Link
                                to="/login"
                                className="link link-primary hover:opacity-70 transition-opacity duration-200"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                    <div className="divider">OR CONTINUE WITH</div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        {/* Google Button - светлая с рамкой */}
                        <button
                            type="button"
                            className="btn bg-white text-black border-[#e5e5e5] transition-colors hover:bg-transparent/10 duration-200"
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
                            Login with Google
                        </button>
                        {/* GitHub Button - темная */}
                        <button
                            type="button"
                            className="btn bg-black text-white border-black transition-opacity hover:opacity-70 duration-200"
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
                            Login with GitHub
                        </button>
                    </div>
                    <div
                        tabIndex={0}
                        className="collapse collapse-plus bg-base-100 border-base-300 border"
                    >
                        <div className="collapse-title font-semibold">
                            What if I already have an account?
                        </div>
                        <div className="collapse-content text-sm">
                            Click the "Sign in" link above or continue with
                            Google or GitHub account
                        </div>
                    </div>
                </div>
            </div>

            {/* right side */}
            <AuthImagePattern
                title="Join our community"
                subtitle="Connect with friends, share moments, and stay in touch with your loved ones"
            />
        </div>
    );
};

export default SignUpPage;

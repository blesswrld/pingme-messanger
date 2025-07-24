// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
// import { MailCheck, Loader2 } from "lucide-react";
// import toast from "react-hot-toast";

// const VerifyEmailPage = () => {
//     const [code, setCode] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { verifyEmail } = useAuthStore();

//     const email = location.state?.email;

//     useEffect(() => {
//         if (!email) {
//             navigate("/signup");
//         }
//     }, [email, navigate]);

//     if (!email) {
//         return null;
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         toast.dismiss();

//         const success = await verifyEmail({ email, code });
//         if (success) {
//             navigate("/");
//         }

//         setIsLoading(false);
//     };

//     return (
//         <div className="flex justify-center items-center min-h-screen bg-base-200 p-4">
//             <div className="card w-full max-w-sm bg-base-100 shadow-xl p-8">
//                 <div className="text-center mb-6">
//                     <MailCheck className="mx-auto size-12 text-primary" />
//                     <h1 className="text-2xl font-bold mt-4">
//                         Подтвердите вашу почту
//                     </h1>
//                     <p className="text-base-content/70 mt-2">
//                         Мы отправили 6-значный код на{" "}
//                         <span className="font-semibold break-all">{email}</span>
//                         . Введите его ниже.
//                     </p>
//                 </div>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <input
//                         type="text"
//                         placeholder="123456"
//                         className="input input-bordered input-primary w-full text-center text-2xl tracking-[0.5em] font-mono"
//                         maxLength="6"
//                         value={code}
//                         onChange={(e) =>
//                             setCode(e.target.value.replace(/[^0-9]/g, ""))
//                         }
//                     />
//                     <button
//                         type="submit"
//                         className="btn btn-primary w-full"
//                         disabled={isLoading || code.length !== 6}
//                     >
//                         {isLoading ? (
//                             <Loader2 className="animate-spin" />
//                         ) : (
//                             "Подтвердить"
//                         )}
//                     </button>
//                     <p className="text-center text-sm text-base-content/60">
//                         Не получили код?{" "}
//                         <Link to="/signup" className="link link-hover">
//                             Попробовать снова
//                         </Link>
//                     </p>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default VerifyEmailPage;

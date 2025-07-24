// import { Resend } from "resend";

// const apiKey = process.env.RESEND_API_KEY;
// if (!apiKey) {
//     throw new Error(
//         "RESEND_API_KEY is not defined in your .env file. Please check your environment variables."
//     );
// }

// const resend = new Resend(apiKey);

// export const sendVerificationEmail = async (to, code) => {
//     try {
//         await resend.emails.send({
//             from: "PingMe <onboarding@resend.dev>",
//             to: to,
//             subject: "Код подтверждения для PingMe",
//             html: `
//                 <div style="font-family: Arial, sans-serif; text-align: center; color: #333; line-height: 1.6;">
//                     <h2 style="color: #000;">Добро пожаловать в PingMe!</h2>
//                     <p>Ваш код для подтверждения регистрации:</p>
//                     <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; background: #f2f2f2; padding: 12px 24px; border-radius: 8px; display: inline-block; margin: 20px 0;">
//                         ${code}
//                     </p>
//                     <p style="font-size: 14px; color: #666;">Этот код действителен в течение 10 минут.</p>
//                 </div>
//             `,
//         });
//         console.log(`Verification email sent to ${to} via Resend.`);
//     } catch (error) {
//         console.error(`Error sending email via Resend to ${to}:`, error);
//         throw new Error("Could not send verification email.");
//     }
// };

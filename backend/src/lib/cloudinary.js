// import { v2 as cloudinary } from "cloudinary";
// import { config } from "dotenv";

// config();

// // --- НАЧАЛО ВАЖНОГО БЛОКА ДИАГНОСТИКИ ---
// console.log("--- [cloudinary.js] Checking environment variables ---");
// console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
// // Проверяем только наличие секрета, не выводим его!
// console.log(
//     "CLOUDINARY_API_SECRET loaded:",
//     process.env.CLOUDINARY_API_SECRET ? "Yes" : "NO or empty!"
// );
// console.log("------------------------------------------------------");
// // --- КОНЕЦ ВАЖНОГО БЛОКА ДИАГНОСТИКИ ---

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

//     api_key: process.env.CLOUDINARY_API_KEY,

//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export default cloudinary;

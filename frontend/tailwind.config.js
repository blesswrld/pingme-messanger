import daisyui from "daisyui";
import mantine from "@mantine/core";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [daisyui, mantine],

    daisyui: {
        themes: ["light", "dark"],
    },
};

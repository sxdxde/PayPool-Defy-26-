/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                linkedin: {
                    dark: "#1b1f23",
                    card: "#2d3339",
                    border: "#424751",
                    blue: "#0a66c2",
                    "blue-hover": "#004182",
                    "text-secondary": "#b0b3b8",
                },
            },
        },
    },
    plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                zen: ['"Zen Old Mincho"', "serif"],
                shippori: ['"Shippori Mincho"', "serif"],
                handwritten: ['"Zen Kurenaido"', "sans-serif"],
            },
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary-color)',
                hover: 'var(--primary-hover)',
                accent: 'var(--accent-color)',
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is crucial for Tailwind to find your classes
  ],
  theme: {
    extend: {},
  },
 plugins: [require('@tailwindcss/line-clamp')],


}
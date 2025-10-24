/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // If index.html is at repo root (and references FrontEnd/src/...), keep it:
    "./index.html",

    // The frontend folder where your actual React app lives
    "./FrontEnd/index.html",
    "./FrontEnd/src/**/*.{js,ts,jsx,tsx,html}",

    // Also include possible shared frontend files at top-level src (if any)
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

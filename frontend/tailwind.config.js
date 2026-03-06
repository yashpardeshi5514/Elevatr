/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        ink:     { DEFAULT:"#0a0f1e", 2:"#1a2035" },
        surface: { DEFAULT:"#ffffff", 2:"#f7f8fc", 3:"#eef0f8" },
        border:  { DEFAULT:"#e2e5f0", 2:"#c8cde0" },
        text:    { DEFAULT:"#0a0f1e", 2:"#3d4a6b", 3:"#6b7a9f", 4:"#9aaac8" },
        green:   { DEFAULT:"#16a34a", 2:"#15803d", pale:"#f0fdf4", border:"#bbf7d0" },
        red:     { DEFAULT:"#dc2626", pale:"#fef2f2" },
        amber:   { DEFAULT:"#d97706", pale:"#fffbeb" },
        blue:    { DEFAULT:"#2563eb", pale:"#eff6ff" },
      },
      borderRadius: {
        sm:"8px", DEFAULT:"12px", lg:"18px", xl:"24px"
      },
      boxShadow: {
        sm:  "0 1px 3px rgba(10,15,30,0.06), 0 1px 2px rgba(10,15,30,0.04)",
        DEFAULT:"0 4px 12px rgba(10,15,30,0.08), 0 2px 4px rgba(10,15,30,0.04)",
        lg:  "0 12px 32px rgba(10,15,30,0.10), 0 4px 8px rgba(10,15,30,0.06)",
        xl:  "0 24px 56px rgba(10,15,30,0.12), 0 8px 16px rgba(10,15,30,0.06)",
        green:"0 4px 20px rgba(22,163,74,0.35)",
      },
      animation: {
        "fade-up":  "fadeUp 0.5s ease both",
        "fade-in":  "fadeIn 0.4s ease",
        shimmer:    "shimmer 1.6s infinite",
        "ping-ring":"pingRing 2s ease-out infinite",
        spin:       "spin 2s linear infinite",
      },
      keyframes: {
        fadeUp:   { from:{opacity:0,transform:"translateY(20px)"}, to:{opacity:1,transform:"translateY(0)"} },
        fadeIn:   { from:{opacity:0}, to:{opacity:1} },
        shimmer:  { "0%":{backgroundPosition:"-600px 0"}, "100%":{backgroundPosition:"600px 0"} },
        pingRing: { "0%":{transform:"scale(1)",opacity:0.7}, "100%":{transform:"scale(1.8)",opacity:0} },
      }
    }
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        red: "#FF0000",
        black: "#000000",

        // background colors
        default: "#0C111D",
        secondary: "#161B26",
        tertiary: "#1F242F",
        emphasis: "#1F242F",
        accent: "#060A14",
        "success-primary": "#053321",
        "success-secondary": "#074D31",
        "brand-primary": "#ACFF73",
        "brand-secondary": "#A3E683",
        attention: "#4E1D09",
        e: "#55160C",
        "alt-default": "#1E2022",
        "brand-dimmed-1": "#252f2f",
        "brand-dimmed-2": "#161b26",
        "progress-gray": "#1a202a",
        "progress-left": "#01C38D",
        "progress-right": "#FFFF00",
        overlay: "#0C111D",
        "error-primary": "#3D1B16",
        "error-secondary": "#6C261B",
        "default-hover": "#131822",

        // font colors
        fg: {
          primary: "#F5F5F6",
          secondary: "#CECFD2",
          tertiary: "#94969C",
          disabled: "#85888E",
          accent: "#ffffff",
          "success-primary": "#75E0A7",
          "success-secondary": "#47CD89",
          "brand-primary": "#BCFE8F",
          "brand-secondary": "#A3E683",
          "error-primary": "#F97066",
          "alt-default": "#0C111D",
          "alt-default-muted": "#868A8E",
          "gray-line": "#d9d9d983",
        },

        // border colors
        bd: {
          primary: "#333741",
          secondary: "#1F242F",
          subtle: "#1F242F",
          emphasis: "#0C111D",
          disabled: "#333741",
          success: "#074D31",
          attention: "#4E1D09",
          danger: "#F97066",
          danger2: "#55160C",
          "success-primary": "#074D31",
        },

        // other colors
      },
      backgroundImage: {
        texture: "url(/src/assets/texture-min.png)",
        "texture-zoomed-out": "url(/src/assets/grainy-horizontal.png)",
        "top-contributor": "url(/src/assets/bg-top-contributor.png)",
      },
      backgroundColor: {
        "contribution-gradient":
          "linear-gradient(90deg, #F4FFEC 0%, #ACFF73 8%, rgba(172, 255, 115, 0.25) 29.5%, rgba(172, 255, 115, 0.00) 100%);",
      },
      fontFamily: {
        geist: ["Geist", "Arial", "sans-serif"],
        "geist-mono": ["GeistMono", "monospace"],
        "sulphur-point": ["Sulphur Point", "sans-serif"],
      },
      boxShadow: {
        underline: "0px 2px 0px 0px rgba(188,254,143,1)",
        header: "0px 10px 10px -2px rgba(172,255,115,0.05);",
        "header-transparent": "0px 5px 6px -2px rgba(172,255,115,0.0);",
      },
      gridTemplateColumns: {
        "borg-input": "minmax(180px, 1fr) 88px",
        "curator-socials": "128px, 24px, 328px, 32px",
        "bo-timeline": "160px minmax(320px, 1fr)",
      },
      lineHeight: {
        11: "44px",
      },
      "body-xl-semibold": [
        "18px",
        {
          lineHeight: "26px",
          fontWeight: "bold",
        },
      ],
      "body-l-medium": [
        "16px",
        {
          lineHeight: "24px",
          fontWeight: 500,
        },
      ],
      fontSize: {
        "body-xl-semibold": [
          "18px",
          {
            lineHeight: "26px",
            fontWeight: 600,
          },
        ],
        "body-l-medium": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: 500,
          },
        ],
        "body-l-regular": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: 400,
          },
        ],
      },
      keyframes: {
        "top-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
      },
      animation: {
        "top-down": "top-down 0.1s ease-out forwards",
        "fade-in": "fade-in 0.2s ease-in-out",
        "fade-out": "fade-out 0.31s ease-in-out",
      },
    },
  },
  plugins: [],
}

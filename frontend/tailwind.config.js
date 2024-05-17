/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // background colors
        "default": "#0C111D",
        "secondary": "#161B26",
        "tertiary": "#1F242F",
        "emphasis": "#1F242F",
        "accent": "#060A14",
        "success-primary": "#053321",
        "success-secondary": "#074D31",
        "brand-primary": "#BCFE8F",
        "brand-secondary": "#A3E683",
        "attention": "#4E1D09",
        "e": "#55160C",
        "alt-default": "#1E2022",
        "brand-dimmed-1": "#252f2f",
        "brand-dimmed-2": "#161b26",
        "progress-gray": "#1a202a",
        "progress-left": "#01C38D",
        "progress-right": "#FFF78A",

        // font colors
        "fg": {
          "primary": "#F5F5F6",
          "secondary": "#CECFD2",
          "tertiary": "#94969C",
          "disabled": "#85888E",
          "accent": "#ffffff",
          "success-primary": "#75E0A7",
          "success-secondary": "#47CD89",
          "brand-primary": "#BCFE8F",
          "brand-secondary": "#A3E683",
          "error-primary":"#F97066",
          "alt-default": "#0C111D",
          "alt-default-muted": "#868A8E",
          "gray-line": "#d9d9d983",
        },

        // border colors
        "bd": {
          "primary": "#333741",
          "secondary": "#1F242F",
          "subtle": "#1F242F",
          "emphasis": "#0C111D",
          "disabled": "#333741",
          "success": "#074D31",
          "attention": "#4E1D09",
          "danger": "#F97066",
          "danger2": "#55160C"
        }

        // other colors

      },
      fontFamily: {
        "geist": ["Geist", "Arial", "sans-serif"],
        "geist-mono": ["GeistMono", "monospace"]
      },
      boxShadow: {
        "underline": "0px 2px 0px 0px rgba(188,254,143,1)"
      }
    },
  },
  plugins: [],
}


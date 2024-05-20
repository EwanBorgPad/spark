import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // enable below to serve on local network (for testing on mobile devices)
  // server: {
  //   host: true,
  // }
})

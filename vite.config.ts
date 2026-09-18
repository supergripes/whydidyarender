import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// React Compiler is wired in unconditionally for now; the live on/off
// toggle (comparing compiled vs. uncompiled render counts) lands in a
// later step once the dashboard itself exists.
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    tailwindcss(),
  ],
});

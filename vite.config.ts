import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Avoids pulling in @types/node just for this one lookup.
declare const process: { env: Record<string, string | undefined> };

// React Compiler is a build-time (babel) transform, so it can't be
// flipped on/off while the app is running. Instead, WHYDIDYARENDER_COMPILER
// picks which variant this particular build/dev-server is: "on" (default)
// or "off". The two variants get built separately and compared side by
// side (see compare.html and the build:compare script).
const compilerEnabled = process.env.WHYDIDYARENDER_COMPILER !== "off";

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: compilerEnabled
        ? { plugins: [["babel-plugin-react-compiler", {}]] }
        : undefined,
    }),
    tailwindcss(),
  ],
  // React strips the Profiler's onRender instrumentation from the
  // production react-dom build for performance. Since this whole app is
  // built around that callback, production builds need the dedicated
  // profiling bundle instead (dev already includes it unconditionally).
  // See https://react.dev/reference/react/Profiler#adding-performance-tracking-to-a-production-app-experimental
  resolve:
    command === "build"
      ? { alias: { "react-dom/client": "react-dom/profiling" } }
      : undefined,
  define: {
    __REACT_COMPILER_ENABLED__: JSON.stringify(compilerEnabled),
  },
}));

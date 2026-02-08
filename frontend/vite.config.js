import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Karwa",
        short_name: "Karwa",
        theme_color: "#0F172A",
        icons: [
          {
            src: "/logo192.png", // تأكد الصورة موجودة بـ public
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});

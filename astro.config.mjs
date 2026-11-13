import { defineConfig } from "astro/config";

// GitHub Pages 的專案網址是 https://bobyu89.github.io/obsidian-research-notes/
export default defineConfig({
  site: "https://bobyu89.github.io",
  base: "/obsidian-research-notes",
  trailingSlash: "always",
});

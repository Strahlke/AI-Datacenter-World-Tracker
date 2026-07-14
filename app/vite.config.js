import { defineConfig } from "vite";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBase = repository ? `/${repository}/` : "/";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? pagesBase : "/",
});

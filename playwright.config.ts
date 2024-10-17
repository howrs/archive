import { defineConfig } from "@playwright/test";
import ms from "ms";

export default defineConfig({
  timeout: ms("15m"),
});

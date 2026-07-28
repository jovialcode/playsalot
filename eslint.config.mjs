import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "design/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/game-server/**/*.ts", "packages/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);

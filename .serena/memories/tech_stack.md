# Tech Stack

- JavaScript/JSX React SPA under `Code/`; package config uses ESM via `"type": "module"`.
- Build/dev: Vite with `@vitejs/plugin-react` in `Code/vite.config.js`.
- Styling: Tailwind CSS 3 via `tailwind.config.js`, `postcss.config.js`, and `Code/src/index.css`.
- Dependencies are intentionally minimal: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`; dev deps `tailwindcss`, `postcss`, `autoprefixer`.
- Package manager: npm; `package-lock.json` is present.
- No backend, test runner, linter, formatter, router, state library, or API client is currently configured.
- Theme: Tailwind `darkMode: "class"`; app toggles `.dark` on `<html>` and persists `legal-affairs-theme` in `localStorage`.
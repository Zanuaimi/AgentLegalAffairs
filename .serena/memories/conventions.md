# Conventions

- Components are plain function components in `.jsx`; default export at file end is common.
- State is local React `useState`/`useEffect`; there is no router, context, backend client, or global store.
- Navigation is role-based but implemented as in-memory `currentPage` + `navigationByRole` in `App.jsx`, not URL routes.
- Demo/domain constants belong in `Code/src/data/mockData.js`; keep role/category/status vocabulary aligned there.
- Backend integration placeholders use explicit `BACKEND TODO: METHOD /api/...` comments near the UI action that will call the API.
- Files intentionally include explanatory comments and `BEGINNER DOCUMENTATION` block comments so the user can learn HTML/CSS/JavaScript/React like a programming class while the project is built; preserve and extend this teaching style when adding major beginner-facing files/components.
- Styling uses Tailwind utility classes in JSX plus global base/dark-mode overrides in `Code/src/index.css`.
- AI output must be visibly labeled as draft/human-review-required in the UI; current `AiSummaryBox` follows this domain invariant.
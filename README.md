# Call Center Project

A production-ready **Vue 3** call center management application built with Vite, Tailwind CSS v4, Pinia, Vue Router, and Axios.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Vue 3](https://vuejs.org/) | ^3.5 | Frontend framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Utility-first CSS |
| [Pinia](https://pinia.vuejs.org/) | ^3 | State management |
| [Vue Router](https://router.vuejs.org/) | ^4 | Client-side routing |
| [Axios](https://axios-http.com/) | ^1 | HTTP client |
| [ESLint](https://eslint.org/) | ^10 | Linting (flat config) |
| [Prettier](https://prettier.io/) | ^3 | Code formatting |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/Fotoglb/call-center-project.git
cd call-center-project
npm install
```

### Environment Variables

Copy the example file and configure your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://call-center-backend-kvok.onrender.com/api` |
| `VITE_APP_NAME` | Application display name | `CallCenter` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

> All environment variables exposed to the client must be prefixed with `VITE_`.

---

## Development

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Build

```bash
npm run build
```

Output is placed in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Lint & Format

```bash
# Lint and auto-fix
npm run lint

# Format source files with Prettier
npm run format
```

---

## Folder Structure

```
call-center-project/
├── public/                  # Static public assets
├── src/
│   ├── assets/              # Images, icons, fonts
│   ├── components/
│   │   └── common/          # Reusable base components
│   │       ├── AppButton.vue
│   │       ├── AppInput.vue
│   │       ├── AppModal.vue
│   │       └── AppNotifications.vue
│   ├── composables/         # Reusable reactive logic
│   │   ├── useApi.js        # Generic async API wrapper
│   │   └── useNotification.js
│   ├── layouts/             # Page shell wrappers
│   │   ├── DefaultLayout.vue  # Sidebar + header layout
│   │   └── AuthLayout.vue     # Centered card layout
│   ├── pages/               # Route-level view components
│   │   ├── Dashboard.vue
│   │   ├── Login.vue
│   │   └── NotFound.vue
│   ├── router/
│   │   └── index.js         # Vue Router config + navigation guards
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance with auth interceptors
│   │   └── auth.service.js
│   ├── stores/              # Pinia state stores
│   │   ├── auth.store.js
│   │   └── ui.store.js
│   ├── styles/
│   │   └── main.css         # Tailwind entry point + global styles
│   ├── utils/               # Pure utility functions
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.vue
│   └── main.js
├── .env                     # Local environment variables (gitignored)
├── .env.example             # Environment variable template
├── .prettierrc              # Prettier configuration
├── eslint.config.js         # ESLint flat config
├── index.html
├── package.json
└── vite.config.js
```

---

## Path Aliases

The `@` alias resolves to `src/`:

```js
import { useAuthStore } from '@/stores/auth.store'
import AppButton from '@/components/common/AppButton.vue'
import api from '@/services/api'
```

---

## Architecture Notes

### Layouts
Routes are nested under layout components (`DefaultLayout`, `AuthLayout`). The layout acts as the visual shell; the page content renders inside `<RouterView />`.

### Services
All HTTP calls go through `src/services/api.js`, which attaches the Bearer token automatically and handles `401` responses globally by redirecting to login.

### Stores (Pinia)
Stores use the **Composition API** (setup store) syntax for better ergonomics. `auth.store` manages authentication state; `ui.store` manages sidebar state and toast notifications.

### Composables
- `useApi(fn)` — wraps any service call with `isLoading`, `error`, and `data` reactive refs.
- `useNotification()` — shortcut helpers (`success`, `error`, `warning`, `info`) that dispatch notifications via `ui.store`.

---

## License

MIT

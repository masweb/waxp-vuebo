# Waxp — Vue 3 Admin Frontend

Frontend del CMS con page builder [Waxp](https://github.com/masweb/waxp). Panel de administración para gestionar sitios, páginas y bloques.

## Stack

- **Vue 3** + Composition API + `<script setup>`
- **TypeScript**
- **Vite** (dev server + build)
- **TipTap** — rich text editor
- **Pinia** — state management
- **vue-i18n** — internationalización (ES/EN)
- **Bootstrap 5** — UI framework
- **vue-router** — routing

## Setup

```bash
pnpm install
cp .env.example .env   # configure VITE_END_POINT
pnpm dev
```

## Environment

| Variable | Descripción |
|---|---|
| `VITE_END_POINT` | URL del backend API (ej: `http://localhost:8080`) |

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build |
| `pnpm test` | Ejecutar tests unitarios (Vitest) |

## Tests

Tests unitarios con **Vitest** + **@vue/test-utils** + **happy-dom**.

```bash
pnpm test              # Run all tests
pnpm test -- --watch   # Watch mode
```

**Coverage**: 20 suites, 150 tests.

| Directorio | Contenido | Tests |
|---|---|---|
| `tests/stores/` | Pinia stores (auth, page, editor, errors, navigation…) | 49 tests |
| `tests/components/` | Vue components (Button, Icon, Image, LoginView, ColorPicker…) | 101 tests |

Tests están separados del código fuente (`tests/`) siguiendo la convención del proyecto.

## Estructura

```
src/
├── components/
│   ├── editor/          # Page builder: canvas, bloques, settings
│   ├── manager/         # Gestión de sitios y páginas
│   └── MediaManager.vue # Galería de medios
├── composables/         # Lógica reutilizable (auth, API, bloques)
├── stores/              # Pinia stores (auth, sites, pages, blocks)
├── i18n/                # Traducciones ES/EN
├── types/               # TypeScript types
└── views/               # Vistas principales
tests/
├── stores/              # Store unit tests
└── components/          # Component unit tests
```

## Licencia

MIT

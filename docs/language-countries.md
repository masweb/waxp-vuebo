# Datos de referencia: idiomas y países

Sistema independiente de datos de referencia para nombres de idiomas y países, con traducciones en `es` y `en`. No forma parte del circuito i18n de la UI — es un módulo propio que reacciona al locale actual de la app.

## Estructura

```
src/i18n/reference/
  index.ts         ← barrel export
  languages.ts     ← 184 idiomas (ISO 639-1)
  countries.ts     ← ~249 países (ISO 3166 alpha-2)

src/composables/
  useReferenceData.ts  ← composable reactivo
```

## Formato de datos

Código ISO como clave, traducciones como valor:

```ts
// languages.ts
{ "en": { en: "English", es: "Inglés" } }

// countries.ts
{ "US": { en: "United States", es: "Estados Unidos" } }
```

## Uso en componentes

```vue
<script setup>
const { languageName, countryName, languages, countries } = useReferenceData()
</script>

<template>
  <!-- Obtener nombre de un idioma según el locale actual -->
  <span>{{ languageName('en') }}</span>  <!-- 'Inglés' o 'English' -->

  <!-- Obtener nombre de un país según el locale actual -->
  <span>{{ countryName('US') }}</span>  <!-- 'Estados Unidos' o 'United States' -->

  <!-- Lista reactiva de idiomas/países -->
  <option v-for="lang in languages" :key="lang.code" :value="lang.code">
    {{ lang.name.es }}
  </option>
</template>
```

## API del composable `useReferenceData()`

| Retorno | Tipo | Descripción |
|---|---|---|
| `languageName(code)` | `(code: string) => string` | Nombre de un idioma en el locale actual |
| `countryName(code)` | `(code: string) => string` | Nombre de un país en el locale actual |
| `languages` | `ComputedRef<LanguageEntry[]>` | Lista reactiva de todos los idiomas |
| `countries` | `ComputedRef<CountryEntry[]>` | Lista reactiva de todos los países |
| `languageNames` | `ComputedRef<Record<string, string>>` | Mapa reactivo `{ code: nombre }` |
| `countryNames` | `ComputedRef<Record<string, string>>` | Mapa reactivo `{ code: nombre }` |

### Tipos

```ts
interface LanguageEntry {
  code: string
  name: { en: string; es: string }
}

interface CountryEntry {
  code: string
  name: { en: string; es: string }
}
```

## Funciones directas (sin composable)

Si no necesitas reactividad, puedes importar directamente:

```ts
import { getLanguageName, getCountryName, getAllCountries, getAllLanguages } from '@/i18n/reference'

getLanguageName('fr', 'es')   // 'Francés'
getCountryName('AR', 'en')    // 'Argentina'
getAllLanguages('es')         // LanguageEntry[]
```

## Reactividad

El composable usa `useI18n()` internamente para leer el locale actual. Cuando el usuario cambia el idioma en la app, los nombres devueltos se actualizan automáticamente.

## Añadir idiomas o países

Editar directamente `src/i18n/reference/languages.ts` o `countries.ts`. Mantener orden alfabético por código y añadir siempre ambas traducciones (`en` y `es`).

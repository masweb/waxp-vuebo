<script setup lang="ts">
const { theme, setTheme } = useTheme()
const { locale, availableLocales, t } = useI18n()
import { IconSunFilled, IconMoonFilled } from '@tabler/icons-vue'
</script>

<template>
  <div class="container mt-4">
    <div class="row">
      <h4>{{ t('section.App settings') }}</h4>
    </div>
    <div class="row mt-4">
      <div class="col-3">
        <div class="d-flex justify-content-between align-items-center">
          <label for="langselect">{{ t('sites.languages') }}</label>
          <select v-model="locale" class="form-select form-select-sm" id="langselect" style="width: 80px">
            <option v-for="lang in availableLocales" :key="lang" :value="lang">{{ lang }}</option>
          </select>
        </div>
        <div
          class="d-flex justify-content-between align-items-center mt-4"
          @click="setTheme(theme === 'dark' ? 'light' : 'dark')"
        >
          <label for="langselect" v-if="theme === 'dark'">{{ t('settings.lightMode') }}</label>
          <label for="langselect" v-if="theme === 'light'">{{ t('settings.darkMode') }}</label>

          <button
            :title="theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')"
            class="btn btn-sm btn-link pe-3"
          >
            <IconSunFilled v-if="theme === 'dark'" :size="26" stroke-width="1.2" />
            <IconMoonFilled v-else :size="24" stroke-width="1.2" />
          </button>
        </div>
      </div>
      <div class="col-6"></div>
    </div>
  </div>
</template>

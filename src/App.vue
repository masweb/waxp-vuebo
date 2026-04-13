<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const nav = navigationStore()
auth.initializeAuth()
if (!auth.isAuthenticated) nav.main = 'login'
</script>

<template>
  <MainBar />
  <LoginView v-if="nav.main == 'login'" />
  <DashBoard v-if="nav.main == 'dashboard'" />
  <AppSettings v-if="nav.main == 'settings'" />
  <SiteEditor v-if="nav.main == 'site'" />
</template>

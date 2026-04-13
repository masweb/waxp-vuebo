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
  <div v-if="nav.main == 'dashboard'" class="container mt-4">
    <h5>Dashboard</h5>
    <SiteManager />
  </div>
</template>

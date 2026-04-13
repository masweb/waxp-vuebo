<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
auth.initializeAuth()
</script>

<template>
  <MainBar />
  <LoginView v-if="!auth.isAuthenticated" />
  <div class="container mt-4" v-else>
    <h5>Dashboard</h5>
    <SiteManager />
  </div>
</template>

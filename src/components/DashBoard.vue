<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const nav = navigationStore()
auth.initializeAuth()
if (!auth.isAuthenticated) nav.main = 'login'
</script>

<template>
  <div class="container mt-4">
    <h5>{{ t('section.Dashboard') }}</h5>
    <SiteManager class="mt-3" />
  </div>
</template>

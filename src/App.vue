<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
auth.initializeAuth()
</script>

<template>
  <MainBar />
  <LoginView v-if="!auth.isAuthenticated" />
  <div v-else>Dashboarda</div>
</template>

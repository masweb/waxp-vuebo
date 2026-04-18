<script lang="ts" setup>
import { IconSettingsFilled, IconTrashFilled, IconArrowsMaximize, IconArrowsDiagonal2 } from '@tabler/icons-vue'

defineProps<{
  onDelete: () => void
  onSettings: () => void
}>()
</script>

<template>
  <div class="blockui move">
    <IconArrowsMaximize size="16" />
  </div>
  <button class="btn btn-sm blockui config" @click="onSettings">
    <IconSettingsFilled size="18" />
  </button>
  <button class="btn btn-sm blockui delete" @click="onDelete">
    <IconTrashFilled size="18" />
  </button>
  <div class="blockui resize">
    <IconArrowsDiagonal2 size="18" />
  </div>
</template>

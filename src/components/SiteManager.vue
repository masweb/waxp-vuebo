<script lang="ts" setup>
const { t } = useI18n()

const tableSchema: TableSchema = [
  { key: 'name', label: t('name') },
  { key: 'domain', label: t('domain') }
]

const filters: FilterSchemas = [
  { key: 'name', label: t('name') },
  { key: 'domain', label: t('domain') }
]

const createEditSchema: ColumnSchema[] = [
  { key: 'name', label: t('name'), required: true },
  { key: 'domain', label: t('domain'), required: true }
]
</script>

<template>
  <TableModel
    :schema="tableSchema"
    :create-edit-schema="createEditSchema"
    :filters="filters"
    url="/api/sites"
    :limit="10"
    :title="t('sites.sites')"
  >
    <template #item-name="{ row, value }">
      <div class="btn btn-link p-0">{{ value }}</div>
    </template>
  </TableModel>
</template>

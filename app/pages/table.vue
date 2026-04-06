<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'

const { t } = useI18n()

definePageMeta({
  icon: 'mdi-table',
  title: 'appbar.table',
  drawerIndex: 3,
})

const search = ref('')
const dialogDelete = useTemplateRef('dialogDelete')
function showDialogDelete(name: string) {
  dialogDelete.value
    ?.open(t('dialog.deleteDessertConfirm'))
    .then(async (confirmed: boolean) => {
      if (confirmed) {
        try {
          const index = desserts.value!.findIndex((v) => v.name === name)
          desserts.value!.splice(index, 1)
          Notify.success(t('notification.deleted'))
        } catch (e) {
          Notify.error(e)
        }
      }
    })
}

const headers: DataTableHeader[] = [
  {
    title: t('table.headers.dessert'),
    key: 'name',
  },
  { title: t('table.headers.calories'), key: 'calories' },
  { title: t('table.headers.fat'), key: 'fat' },
  { title: t('table.headers.carbs'), key: 'carbs' },
  { title: t('table.headers.protein'), key: 'protein' },
  { title: t('table.headers.iron'), key: 'iron' },
  { title: t('table.headers.actions'), key: 'actions', sortable: false },
]
const desserts = ref([
  {
    name: 'Frozen Yogurt',
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
    iron: '1',
  },
  {
    name: 'Jelly bean',
    calories: 375,
    fat: 0.0,
    carbs: 94,
    protein: 0.0,
    iron: '0',
  },
  {
    name: 'KitKat',
    calories: 518,
    fat: 26.0,
    carbs: 65,
    protein: 7,
    iron: '6',
  },
  {
    name: 'Eclair',
    calories: 262,
    fat: 16.0,
    carbs: 23,
    protein: 6.0,
    iron: '7',
  },
  {
    name: 'Gingerbread',
    calories: 356,
    fat: 16.0,
    carbs: 49,
    protein: 3.9,
    iron: '16',
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
    iron: '1',
  },
  {
    name: 'Lollipop',
    calories: 392,
    fat: 0.2,
    carbs: 98,
    protein: 0,
    iron: '2',
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
    iron: '8',
  },
  {
    name: 'Honeycomb',
    calories: 408,
    fat: 3.2,
    carbs: 87,
    protein: 6.5,
    iron: '45',
  },
  {
    name: 'Donut',
    calories: 452,
    fat: 25.0,
    carbs: 51,
    protein: 4.9,
    iron: '22',
  },
  {
    name: 'Donut2',
    calories: 452,
    fat: 25.0,
    carbs: 51,
    protein: 4.9,
    iron: '22',
  },
])
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <client-only>
            <teleport to="#app-bar">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                :label="t('common.search')"
                single-line
                hide-details
                density="compact"
                class="mr-2"
                rounded="xl"
                flat
                icon-color
                glow
                variant="solo"
                style="width: 250px"
              />
            </teleport>
          </client-only>
          <v-data-table
            :headers="headers"
            :items="desserts"
            item-value="name"
            :search="search"
          >
            <template #item.actions="{ item }">
              <v-defaults-provider
                :defaults="{
                  VBtn: {
                    size: 20,
                    rounded: 'sm',
                    variant: 'text',
                    class: 'ml-1',
                    color: '',
                  },
                  VIcon: {
                    size: 20,
                  },
                }"
              >
                <v-btn
                  v-tooltip="{ text: t('common.delete'), location: 'top' }"
                  icon="mdi-delete-outline"
                  @click.stop="showDialogDelete(item.name)"
                />
              </v-defaults-provider>
            </template>
          </v-data-table>
          <DialogConfirm ref="dialogDelete" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

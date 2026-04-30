<script setup lang="ts">
interface FaqPageResponse {
  hero: {
    badge: string
    _title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
  }
  search: {
    label: string
    placeholder: string
  }
  categories: Array<{
    key: string
    label: string
    color: string
    description: string
  }>
  items: Array<{
    category: string
    question: string
    answer: string
    detailsParagraphs: string[]
    bullets: string[]
  }>
  emptyState: {
    _title: string
    description: string
    suggestion: string
  }
}

const { locale, _t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const publicPagesStore = usePublicPagesStore()

definePageMeta({ _title: 'appbar.faq' })

const searchTerm = ref('')
const activeCategory = ref('all')

const asyncKey = computed(() => `public-page-faq-${locale.value}`)

const { data, pending, error, _refresh } = await useAsyncData(
  asyncKey,
  () => publicPagesStore.fetchPage<FaqPageResponse>('faq', locale.value),
  {
    watch: [locale],
    default: () =>
      publicPagesStore.getPage<FaqPageResponse>('faq', locale.value),
  },
)

const page = computed(
  () =>
    data.value ??
    publicPagesStore.getPage<FaqPageResponse>('faq', locale.value),
)

const filteredItems = computed(() => {
  if (!page.value) return []

  return page.value.items.filter((item) => {
    const byCategory =
      activeCategory.value === 'all' || item.category === activeCategory.value
    const normalizedSearch = searchTerm.value.trim().toLowerCase()

    if (!normalizedSearch) return byCategory

    const haystack = [
      item.question,
      item.answer,
      ...item.detailsParagraphs,
      ...item.bullets,
    ]
      .join(' ')
      .toLowerCase()

    return byCategory && haystack.includes(normalizedSearch)
  })
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible || pending || !page" />
        <v-card v-else rounded="xl" class="pa-3 mb-2" variant="text">
          <v-chip class="mb-3" color="primary">{{ page.hero.badge }}</v-chip>
          <h1 class="text-h3 mb-2">{{ page.hero.title }}</h1>
          <p class="mb-4">{{ page.hero.subtitle }}</p>
          <v-text-field
            v-model="searchTerm"
            :label="page.search.label"
            :placeholder="page.search.placeholder"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            bg-color="white"
          />
        </v-card>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible || pending || !page" />
        <div v-else>
          <v-list nav density="compact" class="app-left-drawer-list">
            <v-list-subheader>{{ page.search.label }}</v-list-subheader>
            <v-list-item
              v-for="category in page.categories"
              :key="category.key"
              :active="activeCategory === category.key"
              rounded="lg"
              @click="activeCategory = category.key"
            >
              <template #prepend>
                <v-avatar :color="category.color" size="10" class="me-2" />
              </template>
              <v-list-item-title>{{ category.label }}</v-list-item-title>
              <v-list-item-subtitle>{{
                category.description
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card rounded="xl" variant="tonal" color="primary">
            <v-card-title class="pt-4 px-4">{{
              page.hero.primaryCta
            }}</v-card-title>
            <v-card-subtitle class="px-4">{{
              page.hero.secondaryCta
            }}</v-card-subtitle>
            <v-card-actions>
              <v-btn block color="primary" _to="/contact" variant="flat">{{
                page.hero.primaryCta
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </template>
    </AppPageDrawers>

    <v-container>
      <SkeletonPageContent v-if="isPageSkeletonVisible || pending || !page" />
      <v-alert
        v-else-if="error"
        _type="error"
        variant="tonal"
        :text="String(error)"
      />

      <template v-else-if="page">
        <v-card rounded="xl" class="mb-4 pa-6 postcard-gradient-card">
          <div class="d-flex flex-wrap ga-2 mb-6">
            <v-chip
              v-for="category in page.categories"
              :key="category.key"
              :color="
                activeCategory === category.key ? category.color : undefined
              "
              :variant="activeCategory === category.key ? 'flat' : 'outlined'"
              @click="activeCategory = category.key"
            >
              {{ category.label }}
            </v-chip>
          </div>

          <v-row v-if="filteredItems.length" density="comfortable">
            <v-col
              v-for="item in filteredItems"
              :key="item.question"
              cols="12"
              md="6"
            >
              <v-card
                rounded="xl"
                height="100%"
                class="pa-2 postcard-gradient-card"
              >
                <v-card-title>{{ item.question }}</v-card-title>
                <v-card-text>
                  <p class="mb-2">{{ item.answer }}</p>
                  <p
                    v-for="paragraph in item.detailsParagraphs"
                    :key="paragraph"
                    class="mb-2 _text-medium-emphasis"
                  >
                    {{ paragraph }}
                  </p>
                  <v-chip
                    v-for="bullet in item.bullets"
                    :key="bullet"
                    size="small"
                    class="me-2 mb-2"
                    color="primary"
                    variant="tonal"
                    >{{ bullet }}</v-chip
                  >
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-card
            v-else
            rounded="xl"
            variant="outlined"
            class="pa-8 _text-center postcard-gradient-card"
          >
            <h3 class="text-h5 mb-2">{{ page.emptyState.title }}</h3>
            <p class="mb-1">{{ page.emptyState.description }}</p>
            <p class="text-medium-emphasis">{{ page.emptyState.suggestion }}</p>
          </v-card>
        </v-card>
      </template>
    </v-container>
  </div>
</template>

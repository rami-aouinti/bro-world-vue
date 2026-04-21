<script setup lang="ts">
const route = useRoute()

await navigateTo(
  `/blog/${encodeURIComponent(String(route.params.slug ?? ''))}`,
  { redirectCode: 301 },
)
</script>

<script setup lang="ts">
const route = useRoute()

await navigateTo({
  path: '/resume/cover-letter/editor',
  query: route.query,
}, { redirectCode: 302 })
</script>

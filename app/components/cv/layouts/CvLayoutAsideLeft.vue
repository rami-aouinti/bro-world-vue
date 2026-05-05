<template><div class="cv-layout"><aside class="cv-aside"><slot name="header" /></aside><section class="cv-content"><slot name="content" /></section></div></template>
<style scoped>
.cv-layout{width:850px;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;display:grid;grid-template-columns:240px 1fr;overflow:hidden}
.cv-aside{padding:24px;background:rgba(15,23,42,.04)}
.cv-content{padding:24px}
</style>

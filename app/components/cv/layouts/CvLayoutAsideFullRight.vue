<template><div class="cv-layout"><section class="cv-content"><slot name="content" /></section><aside class="cv-aside"><slot name="header" /></aside></div></template>
<style scoped>
.cv-layout{width:850px;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;display:grid;grid-template-columns:1fr 280px;overflow:hidden}
.cv-aside{padding:24px;background:rgba(15,23,42,.08)}
.cv-content{padding:24px}
</style>

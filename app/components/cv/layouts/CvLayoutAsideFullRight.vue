<template><div class="cv-layout"><header class="cv-header"><slot name="header" /></header><div class="cv-grid"><section class="cv-content"><slot name="content" /></section><aside class="cv-aside" /></div></div></template>
<style scoped>
.cv-layout{width:100%;min-height:1123px;background:#fff;border:1px solid rgba(148,163,184,.45);border-radius:16px;overflow:hidden}
.cv-header{padding:24px;border-bottom:1px solid rgba(148,163,184,.35);background:#fff}
.cv-grid{display:grid;grid-template-columns:1fr 280px;min-height:calc(1123px - 89px)}
.cv-aside{background:rgba(15,23,42,.08)}
.cv-content{padding:24px}
</style>

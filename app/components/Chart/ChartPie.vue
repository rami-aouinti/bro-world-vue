<script setup lang="ts">
const { t } = useI18n()

const option: ECOption = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
  },
  legend: {
    left: 'center',
    bottom: '10',
    data: [
      t('dashboard.charts.industries'),
      t('dashboard.charts.technology'),
      t('dashboard.charts.forex'),
      t('dashboard.charts.gold'),
      t('dashboard.charts.forecasts'),
    ],
  },
  series: [
    {
      name: t('dashboard.charts.weeklyArticles'),
      type: 'pie',
      roseType: 'radius',
      radius: [15, 95],
      center: ['50%', '38%'],
      data: [
        { value: 320, name: t('dashboard.charts.industries') },
        { value: 240, name: t('dashboard.charts.technology') },
        { value: 149, name: t('dashboard.charts.forex') },
        { value: 100, name: t('dashboard.charts.gold') },
        { value: 59, name: t('dashboard.charts.forecasts') },
      ],
      animationEasing: 'cubicInOut',
    },
  ],
}
</script>

<template>
  <v-chart :option="option" autoresize />
</template>

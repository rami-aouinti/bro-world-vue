<script setup lang="ts">
const { t } = useI18n()

const option: ECOption = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    top: 20,
    left: '2%',
    right: '2%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: [
        t('dashboard.days.mon'),
        t('dashboard.days.tue'),
        t('dashboard.days.wed'),
        t('dashboard.days.thu'),
        t('dashboard.days.fri'),
        t('dashboard.days.sat'),
        t('dashboard.days.sun'),
      ],
      axisTick: {
        alignWithLabel: true,
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      axisTick: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: t('dashboard.charts.pageA'),
      type: 'bar',
      stack: 'vistors',
      barWidth: '60%',
      data: [79, 52, 200, 334, 390, 330, 220],
    },
    {
      name: t('dashboard.charts.pageB'),
      type: 'bar',
      stack: 'vistors',
      barWidth: '60%',
      data: [80, 52, 200, 334, 390, 330, 220],
    },
    {
      name: t('dashboard.charts.pageC'),
      type: 'bar',
      stack: 'vistors',
      barWidth: '60%',
      data: [30, 52, 200, 334, 390, 330, 220],
    },
  ],
}
</script>

<template>
  <v-chart :option="option" autoresize />
</template>

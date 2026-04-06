<script setup lang="ts">
const { t } = useI18n()

const option: ECOption = {
  backgroundColor: 'transparent',
  radar: {
    radius: '66%',
    center: ['50%', '42%'],
    splitNumber: 8,
    splitArea: {
      areaStyle: {
        color: 'rgba(127,95,132,.3)',
        opacity: 1,
        shadowBlur: 45,
        shadowColor: 'rgba(0,0,0,.5)',
        shadowOffsetX: 0,
        shadowOffsetY: 15,
      },
    },
    indicator: [
      { name: t('dashboard.radar.sales') },
      { name: t('dashboard.radar.administration') },
      { name: t('dashboard.radar.technology') },
      { name: t('dashboard.radar.customerSupport') },
      { name: t('dashboard.radar.development') },
      { name: t('dashboard.radar.marketing') },
    ],
  },
  legend: {
    left: 'center',
    bottom: '10',
    data: [
      t('dashboard.radar.allocatedBudget'),
      t('dashboard.radar.expectedSpending'),
      t('dashboard.radar.actualSpending'),
    ],
  },
  series: [
    {
      type: 'radar',
      symbolSize: 0,
      areaStyle: {
        shadowBlur: 13,
        shadowColor: 'rgba(0,0,0,.2)',
        shadowOffsetX: 0,
        shadowOffsetY: 10,
        opacity: 1,
      },
      data: [
        {
          value: [5000, 7000, 12000, 11000, 15000, 14000],
          name: t('dashboard.radar.allocatedBudget'),
        },
        {
          value: [4000, 9000, 15000, 15000, 13000, 11000],
          name: t('dashboard.radar.expectedSpending'),
        },
        {
          value: [5500, 5000, 12000, 15000, 8000, 6000],
          name: t('dashboard.radar.actualSpending'),
        },
      ],
    },
  ],
}
</script>

<template>
  <v-chart :option="option" autoresize />
</template>

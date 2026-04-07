<template>
  <v-container fluid class="py-4">
    <v-row>
      <v-col cols="12" md="8" class="d-flex flex-column ga-4">
        <v-skeleton-loader type="image, article" />
        <v-skeleton-loader type="card" />
        <v-skeleton-loader type="card" />
      </v-col>

      <v-col cols="12" md="4" class="d-flex flex-column ga-4">
        <v-skeleton-loader type="article" />
        <v-skeleton-loader type="list-item-three-line, list-item-three-line, list-item-three-line" />
      </v-col>
    </v-row>
  </v-container>
</template>

<template>
  <v-card rounded="lg" variant="tonal" class="mb-4">
    <v-card-title class="text-subtitle-1 font-weight-bold">
      Créer une publication
    </v-card-title>
    <v-card-text>
      <v-textarea
        model-value=""
        label="Exprimez-vous..."
        rows="3"
        auto-grow
        variant="outlined"
        hide-details
      />
    </v-card-text>
    <v-card-actions class="px-4 pb-4">
      <v-btn color="primary" variant="flat" prepend-icon="mdi-send" disabled>
        Publier
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

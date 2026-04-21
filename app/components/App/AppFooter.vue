<template>
  <v-footer app>
    <div class="d-flex align-center flex-wrap ga-1">
      <v-btn variant="text" size="x-small" to="/privacy">Privacy Policy</v-btn>
      <v-btn variant="text" size="x-small" to="/terms">Terms of Service</v-btn>
      <v-btn variant="text" size="x-small" to="/data-deletion">Data Deletion</v-btn>
    </div>
    <v-spacer />
    <v-defaults-provider
      :defaults="{ VBtn: { variant: 'text', size: 'x-small' } }"
    >
      <AppNotification />
      <AppSettings />
    </v-defaults-provider>
  </v-footer>
</template>
<style>
.v-footer {
  padding: 0px 10px;
  > .v-btn--icon {
    .v-icon {
      height: 1.25em;
      width: 1.25em;
    }
  }
}
</style>

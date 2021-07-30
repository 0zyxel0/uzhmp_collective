<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="6" sm="6" md="6">
        <v-card>
          <v-card-title> Error 401 : Unauthorized </v-card-title>
          <v-card-text> <v-btn color="error" @click="logout">logout</v-btn> </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: "error",
  auth: "user",
   methods: {
    async logout() {
      await this.$auth.logout();
    }
  }
};
</script>

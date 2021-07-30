<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-card class="elevation-12">
        <v-card-text class="text-center pa-6">
          <v-icon color="success" class="outlined" x-large>mdi-check</v-icon>
          <h1 class="my-4 success--text">Success,</h1>
          <p>
            You have been successfully registered. You will be automatically
            redirected to a Log in page in {{ timerCount }} seconds or you can
            click Log in below.
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-6">
          <v-btn block color="primary" to="/login">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
export default {
  layout: "Blanklayout",
  name: "FullLogin",
  middleware: "auth",
  auth: "guest",
  data() {
    return {
      timerCount: 5,
    };
  },
  watch: {
    timerCount: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        }
        else if (value == 0) {
            this.$router.push({
                name: "login",
              }); 
        }
        
      },
      immediate: true //this ensure the watcher is triggerd upon creation
    }
  }
};
</script>
<style scoped>
.v-icon.outlined {
  border: 1px solid currentColor;
  border-radius: 50%;
  height: 70px;
  width: 70px;
}
</style>

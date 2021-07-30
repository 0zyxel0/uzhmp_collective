<template>
  <v-app dark>
    <v-container fill-height fluid class="x-ctn">
      <v-row :align="center" :justify="center">
        <v-col text-align="center">
          <h1>
            {{ title }}
          </h1>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      fixed: false,
      title: "Access Complete Mapping Service"
    };
  }
};
</script>

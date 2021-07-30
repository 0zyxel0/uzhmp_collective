<template>
  <v-container>
    <UserTable></UserTable>
  </v-container>
</template>

<script>
import UserTable from "./../../../components/UserTable";
export default {
   middleware:'roleView',
  layout: "admin",
  component: {
    UserTable: UserTable
  },

  data() {
    return {};
  },
  methods: {}
};
</script>

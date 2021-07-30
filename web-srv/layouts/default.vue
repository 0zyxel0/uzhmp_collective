<template>
  <v-app dark>
    <Navbar></Navbar>
     <v-main>
        <nuxt class="pa-6" />
      </v-main>
  </v-app>
</template>

<script>
import Navbar from '../components/Navbar';
export default {
  components:{
    'Navbar':Navbar
  },
  middleware: "auth",
  data() {
    return {
      logoutDialog: false,
      drawer: true,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      select: ["English"],
      items: ["English", "French", "German"]
    };
  },
  methods: {
    logoutDialogBox() {
      this.logoutDialog = true;
    }
  }
};
</script>
<style scoped lang="scss">
.v-application--is-ltr
  .v-list--dense.v-list--nav
  .v-list-group--no-action
  > .v-list-group__items
  > .v-list-item {
  padding: 0 8px;
  color: #fff;
}
.v-radio {
  color: #fff;
}
.profile-bg {
  background: url("../assets/images/user-info.jpg") no-repeat;
}
.v-avatar {
  padding: 45px 0;
}
@media (min-width: 1025px) {
  .common-left-right {
    .v-navigation-drawer {
      transform: translatex(0%) !important;
    }
  }
  .logo-width {
    min-width: 235px;
  }
}

#main-sidebar {
  box-shadow: 1px 0 20px rgba(0, 0, 0, 0.08);
  -webkit-box-shadow: 1px 0 20px rgba(0, 0, 0, 0.08);
  .v-navigation-drawer__border {
    display: none;
  }
}
</style>

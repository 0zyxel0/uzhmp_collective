<template>
  <div>
    <nav>
      <!-- Sidebar -->
      <v-navigation-drawer
        v-model="drawer"
        clipped
        :mini-variant="miniVariant"
        floating
        app
        id="main-sidebar"
      >
        <!---USer Area -->
        <v-list-item class="profile-bg px-2">
          <v-list-item-avatar v-if="!$auth.user.profile.p_img">
            <img src="/default-user.png" />
          </v-list-item-avatar>
          <v-list-item-avatar v-else>
            <img :src="$auth.user.profile.p_img" />
          </v-list-item-avatar>

          <v-list-item-content class="white--text">
            <v-list-item-title v-if="$auth.loggedIn"
              >{{ $auth.user.profile.firstname }}
              {{ $auth.user.profile.lastname }}</v-list-item-title
            >
            <v-list-item-title v-if="$auth.loggedIn">{{
              $auth.user.email
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!---USer Area -->
        <v-divider class="mb-4"></v-divider>
        <v-list nav dense v-if="$auth.user.meta.role == 'admin'">
          <div v-for="(link, i) in linksAdmin" :key="i">
            <v-list-item
              v-if="!link.subLinks"
              :to="link.to"
              class="v-list-item"
              active-class="primary--text text--accent-4"
            >
              <v-list-item-icon>
                <v-icon>{{ link.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-title v-text="link.text" />
            </v-list-item>
          </div>
          <v-list-item
            class="v-list-item"
            active-class="primary--text text--accent-4"
            @click="toOSMeditorDialog = true"
          >
            <v-list-item-icon>
              <v-icon>mdi-map</v-icon>
            </v-list-item-icon>

            <v-list-item-title v-text="`Map Editor`" />
          </v-list-item>
        </v-list>
        <v-list nav dense v-else>
          <div v-for="(link, i) in linksBasic" :key="i">
            <v-list-item
              v-if="!link.subLinks"
              :to="link.to"
              class="v-list-item"
              active-class="primary--text text--accent-4"
            >
              <v-list-item-icon>
                <v-icon>{{ link.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-title v-text="link.text" />
            </v-list-item>
          </div>
        </v-list>

        <template v-slot:append>
          <div v-if="$auth.user.meta.role == 'admin'">
          <v-divider></v-divider>
          <div v-if="osmIsProduction != {}">
           <div class="pa-2" v-if="osmIsProduction == false">
            <p class="overline text-center">OSM Environment {{checkOSMEnvironment(osmIsProduction)}}</p>
            <v-btn color="primary" @click="updateOSMEnvironment(true)" small block>Switch To Production</v-btn>
          </div>
           <div class="pa-2" v-else>
            <p class="overline text-center">OSM Environment {{checkOSMEnvironment(osmIsProduction)}}</p>
            <v-btn color="primary" @click="updateOSMEnvironment(false)" small block>Switch To Development</v-btn>
          </div>
          </div>
            <v-divider></v-divider>
          <div class="pa-2">
            <p class="overline text-center">version 1.0.0.0</p>
          </div>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- Topbar -->
      <v-app-bar dark app flat color="primary" clipped-left>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="align-center d-flex">
          <span class="title">Masters Project</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- <v-btn text icon>
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn> -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <!-- <v-btn text icon v-bind="attrs" v-on="on" @click="$auth.logout()">
                <v-icon>mdi-power</v-icon>
              </v-btn> -->
            <v-btn
              text
              icon
              v-bind="attrs"
              v-on="on"
              @click="logoutDialogBox()"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>Logout</span>
        </v-tooltip>
      </v-app-bar>
    </nav>

    <!-- Settings Button -->
    <v-btn
      bottom
      color="info"
      dark
      fab
      fixed
      right
      @click.stop="rightDrawer = !rightDrawer"
    >
      <v-icon>mdi-cog</v-icon>
    </v-btn>

    <!-- Right bar -->
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      fixed
      temporary
      id="main-sidebar"
    >
      <v-list>
        <v-list-item>
          <v-list-item-title class="title">
            <v-icon>mdi-cog</v-icon>
            Site Settings</v-list-item-title
          >
        </v-list-item>
        <hr />
        <v-row class="mt-2">
          <v-col>
            <div class="text-center subtitle-2">LANGUAGE SELECTOR</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mx-6" align="center">
            <v-combobox
              v-model="select"
              :items="items"
              label="Select Language"
              prepend-icon="mdi-earth"
            >
              <template slot="item" slot-scope="data">
                {{ data.item }}
              </template>
            </v-combobox>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row no-gutters class="mb-5">
          <v-col cols="12">
            <v-switch
              hide-details
              v-model="$vuetify.theme.dark"
              class="pl-15"
              primary
              label="Dark Mode"
            ></v-switch>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row no-gutters>
          <v-col cols="12">
            <v-switch
              v-model="miniVariant"
              class="pl-15"
              label="Sidebar Mini"
              primary
            ></v-switch>
          </v-col>
        </v-row>
      </v-list>
    </v-navigation-drawer>

    <!-- Logout Dialog Box -->
    <v-dialog
      v-model="logoutDialog"
      persistent
      max-width="290px"
      z-index="9999"
    >
      <v-sheet rounded="xl" class="py-4 mx-auto text-center d-inline-block">
        <div>
          <v-icon style="font-size: 65px;" color="warning" x-large
            >mdi-information-outline</v-icon
          >
        </div>
        <div class=" text-body-2 mb-5">
          Are you sure you want to Logout?
        </div>
        <v-divider class="my-5"></v-divider>
        <div>
          <v-btn
            depressed
            color="error"
            class="mr-2"
            dark
            @click="logoutDialog = !logoutDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            depressed
            color="green"
            class="ml-2"
            dark
            @click="$auth.logout()"
          >
            Logout
          </v-btn>
        </div>
      </v-sheet>
    </v-dialog>

    <v-dialog v-model="toOSMeditorDialog" width="500">
      <v-card>
        <v-card-title class="grey lighten-3">
          Navigating to OSM Editor
        </v-card-title>

        <v-card-text>
         The OSM Editor is a different application.
         This will be redirecting you to a different application to use the iD OSM Official Editor.
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="warning" mx-1 text @click="toOSMeditorDialog = false">
            Cancel
          </v-btn>
          <v-btn color="success" mx-1 text @click="gotoOSMEditor()">
            Continue to OSM Editor
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>
<script>
import { mapState ,mapActions} from "vuex";
export default {
  created(){
    this.$store.dispatch("GET_OSM_ENVIRONMENT_STATUS");
  },
  computed:{
     ...mapState({
      osmIsProduction: state => state.osmIsProduction
    })
  },
  data() {
    return {
      toOSMeditorDialog: false,
      logoutDialog: false,
      drawer: true,
      linksAdmin: [
        {
          to: "/",
          icon: "mdi-view-dashboard",
          text: "Dashboard"
        },
        {
          to: "/profile",
          icon: "mdi-account",
          text: "My Profile"
        },
        {
          to: "/users/",
          icon: "mdi-account-search",
          text: "Users"
        },
        {
          to: "/quests/",
          icon: "mdi-calendar-check",
          text: "Quests"
        },
        {
          to: "/osm/",
          icon: "mdi-map-check-outline",
          text: "Ready For Osm"
        }
      ],
      linksBasic: [
        {
          to: "/",
          icon: "mdi-view-dashboard",
          text: "Dashboard"
        },
        {
          to: "/profile/",
          icon: "mdi-account",
          text: "My Profile"
        }
      ],

      miniVariant: false,
      right: true,
      rightDrawer: false,
      select: ["English"],
      items: ["English", "French", "German"]
    };
  },
  methods: {
    gotoOSMEditor() {
      window.location.href = "https://ideditor-release.netlify.app";
    },
    logoutDialogBox() {
      this.logoutDialog = true;
    },
    updateOSMEnvironment(payload){
      this.$store.dispatch("UPDATE_OSM_ENVIRONMENT_STATUS",{osm_environment:payload});
    },
    checkOSMEnvironment(status){
      if(status == false){
        return "Development";
      }
      else{ 
        return "Production";
      }
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

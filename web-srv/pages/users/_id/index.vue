<template>
  <div class="userDetailsEdit">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-card v-if="user_profile.profile">
                  <v-card-title
                    >User Details <v-spacer></v-spacer
                    ><v-btn
                      color="warning"
                      :to="`/users/${user_profile.aid}/edit`"
                      >Edit User</v-btn
                    ></v-card-title
                  >

                  <v-card-text>
                    <v-row>
                      <v-col cols="3">
                        <v-img v-if="!user_profile.profile.p_img"
                          src="/default-user.png"
                          max-height="150"
                          max-width="150"
                        ></v-img>
                          <v-img v-else
                          :src="user_profile.profile.p_img"
                          max-height="150"
                          max-width="150"
                        ></v-img>
                      </v-col>
                      <v-col>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title
                              >User ID :
                              {{ user_profile.aid }}</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title
                              >Name : {{ user_profile.profile.firstname }}
                              {{
                                user_profile.profile.lastname
                              }}</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title
                              >Email :
                              {{ user_profile.email }}</v-list-item-title
                            >
                          </v-list-item-content>
                        </v-list-item>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card flat>
                    <v-card-subtitle>
                      Join Date :
                      {{ computeDateData(user_profile.profile.join_date) }}
                    </v-card-subtitle>
                  </v-card>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card v-if="user_profile.profile">
                  <v-card-text
                    >Current Score :
                    {{ user_profile.profile.score }}</v-card-text
                  >
                </v-card>
              </v-col>
            </v-row>
          </v-col>
          <v-col>
            <v-row>
              <v-col>
                <v-card>
                  <v-card-title>Submissions</v-card-title>
                  <v-divider></v-divider>

                  <v-data-table
                    :headers="headers"
                    :items="map_marker_list"
                    :search="search"
                    :loading="loadingBar"
                  >
                    <template slot="item.options" slot-scope="{ item }">
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            v-bind="attrs"
                            v-on="on"
                            tile
                            x-small
                            style="width:80px;"
                            :to="`/quests/${item.mid}`"
                          >
                            <v-icon x-small left>mdi-open-in-new</v-icon>
                            View
                          </v-btn>
                        </template>
                        <span>View Profile</span>
                      </v-tooltip>

                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="accent"
                            v-bind="attrs"
                            v-on="on"
                            tile
                            x-small
                            dark
                            style="width:80px;"
                            @click="deleteUserDialog(item)"
                          >
                            <v-icon x-small left>mdi-delete</v-icon>
                            Delete
                          </v-btn>
                        </template>
                        <span>Delete Marker</span>
                      </v-tooltip>
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-card>
                  <v-card-title>Achievements</v-card-title>
                  <v-divider></v-divider>
                  <v-card-text></v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
<script>
const _ = require("lodash");
import { mapState } from "vuex";
export default {
  layout: "loggedin",
  middleware: "auth",
  created() {
    this.loadUserProfile();
    this.$store.dispatch(
      "GET_CUR_USER_SUBMITTED_MARKERS",
      this.$nuxt.$route.params.id
    );
  },
  computed: {
    ...mapState({
      map_marker_list: state => state.marker_list
    })
  },
  methods: {
    computeDateData: function(time) {
      let options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      let date = new Date(time);
      return date.toLocaleDateString("en-US", options);
    },
    loadUserProfile() {
      let curUrl = this.$nuxt.$route.params.id;
      // this.$store.dispatch("GET_USER_PROFILE_DETAILS", curUrl);
      this.$axios
        .$get(`api/v2/user/profile/details/${curUrl}`)
        .then(response => {
          this.user_profile = response;
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  watch: {
    map_marker_list() {
      this.loadingBar = false;
    }
  },
  data() {
    return {
      selectedFile: null,
      uploadImageDialog: false,
      deleteDialogToggle: false,
      search: "",
      loadingBar: true,
      headers: [
        {
          text: "Title",
          align: "start",
          value: "title"
        },
        { text: "Description", value: "description" },
        { text: "Verifiers", value: "verifier_count" },
        { text: "Option", value: "options" }
      ],
      user_profile: {},
      page: {
        title: "Modify User"
      },
      breadcrumbs: [
        {
          text: "Home",
          disabled: false,
          href: "/"
        },
        {
          text: "User Details",
          disabled: false,
          href: "/users/"
        }
      ]
    };
  }
};
</script>
<style scoped>
#map {
  z-index: 1;
}
</style>

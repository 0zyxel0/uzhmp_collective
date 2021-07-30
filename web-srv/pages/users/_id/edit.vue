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
                    >User Details<v-spacer></v-spacer
                    ><v-btn
                      color="success"
                      small
                      class="mx-1"
                      @click="updateUserProfileData()"
                      >Save</v-btn
                    >
                    <v-btn
                      color="warning"
                      :to="`/users/${user_profile.aid}`"
                      small
                      class="mx-1"
                      >Cancel</v-btn
                    >
                  </v-card-title>
                  <v-row>
                    <v-col cols="3">
                      <v-img
                        src="/default-user.png"
                        max-height="150"
                        max-width="150"
                      ></v-img>
                    </v-col>
                    <v-col>
                      <v-card flat>
                        <v-card-text>
                          <v-text-field
                            label="First Name"
                            :rules="rules"
                            v-model="editProfile.profile.firstname"
                            hide-details="auto"
                          ></v-text-field>
                          <v-text-field
                            label="Last Name"
                            v-model="editProfile.profile.lastname"
                            :rules="rules"
                            hide-details="auto"
                          ></v-text-field>
                          <v-text-field
                            label="Email"
                            v-model="editProfile.email"
                            :rules="rules"
                            hide-details="auto"
                          ></v-text-field>
                        </v-card-text>

                        <v-card flat>
                          <v-card-title>
                            <v-btn
                              v-if="this.editProfile.meta.role == 'basic'"
                              color="primary"
                              outlined
                              dark
                              @click="promoteDialog = true"
                            >
                              Make Admin / Moderator
                            </v-btn>

                            <v-btn
                              v-if="this.editProfile.meta.role == 'admin'"
                              color="primary"
                              outlined
                              dark
                              @click="demoteDialog = true"
                            >
                              Make Basic User
                            </v-btn>

                            <v-dialog v-model="promoteDialog" width="500">
                              <v-card>
                                <v-card-title class="text-h5 grey lighten-2">
                                  Promote User Role
                                </v-card-title>

                                <v-card-text>
                                  <span
                                    v-if="this.user_profile.profile.score >= 20"
                                  >
                                    Are you sure you want to promote the User
                                    Role to a Moderator?
                                  </span>
                                  <span v-else>
                                    Are you sure you want to promote the User to
                                    a Role Moderator without accumulating enough
                                    score?</span
                                  >
                                </v-card-text>

                                <v-divider></v-divider>

                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="error"
                                    text
                                    mx-1
                                    @click="promoteDialog = false"
                                  >
                                    Cancel
                                  </v-btn>
                                  <v-btn
                                    color="success"
                                    text
                                    mx-1
                                    @click="promoteUser()"
                                  >
                                    Proceed
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>

                            <v-dialog v-model="demoteDialog" width="500">
                              <v-card>
                                <v-card-title class="text-h5 grey lighten-2">
                                  Demote User Role
                                </v-card-title>

                                <v-card-text>
                                  <span>
                                    Are you sure you want to change the user
                                    role to a basic user.</span
                                  >
                                </v-card-text>

                                <v-divider></v-divider>

                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="error"
                                    text
                                    mx-1
                                    @click="demoteDialog = false"
                                  >
                                    Cancel
                                  </v-btn>
                                  <v-btn
                                    color="success"
                                    text
                                    mx-1
                                    @click="demoteUser()"
                                  >
                                    Proceed
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>
                            <v-spacer></v-spacer>
                            <v-btn
                              v-if="editProfile.profile.is_active == true"
                              v-model="editProfile.profile.is_active"
                              color="error"
                              @click="toggleUserProfileStatus()"
                              outlined
                              >Deactivate User</v-btn
                            >
                            <v-btn
                              v-else
                              @click="toggleUserProfileStatus()"
                              text
                              color="success"
                              >Activate</v-btn
                            >
                          </v-card-title>
                        </v-card>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card v-if="user_profile.profile">
                  <v-card-text>
                    <v-row>
                      <v-card-subtitle
                        >Current Score :
                        {{ user_profile.profile.score }}</v-card-subtitle
                      >
                    </v-row>
                  </v-card-text>
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
                            :to="`/quests/${item.mid}`"
                            style="width:80px;"
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
            <!-- <v-row>
              <v-col>
                <v-card>
                  <v-card-title>Recent Activity</v-card-title>
                </v-card>
              </v-col>
            </v-row> -->
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
    demoteUser() {
      this.$axios
        .$put(
          "api/v2/user/profile/tobasic",
          { aid: this.editProfile.aid },
          {
            headers: { Authorization: this.$auth.strategy.token.get() }
          }
        )
        .then(response => {
          this.demoteDialog = false;
          this.$toast.success("Successfully Updated User Role", {
            timeout: 2000
          });
           this.loadUserProfile();
        })
        .catch(error => {
          this.demoteDialog = false;
          this.$toast.error("Encountered an Error while updating User Role", {
            timeout: 2000
          });
        });
    },
    promoteUser() {
      this.$axios
        .$put(
          "api/v2/user/profile/promote",
          { aid: this.editProfile.aid },
          {
            headers: { Authorization: this.$auth.strategy.token.get() }
          }
        )
        .then(response => {
          this.promoteDialog = false;
          this.$toast.success("Successfully Updated User Role", {
            timeout: 2000
          });
           this.loadUserProfile();
        })
        .catch(error => {
          this.promoteDialog = false;
          this.$toast.error("Encountered an Error while updating User Role", {
            timeout: 2000
          });
        });
    },

    computeDateData(time) {
      let options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      let date = new Date(time);
      return date.toLocaleDateString("en-US", options);
    },
    updateUserProfileData() {
      try {
        let payload = {
          profileid: this.editProfile.profileid,
          firstname: this.editProfile.profile.firstname,
          lastname: this.editProfile.profile.lastname
        };
        this.$axios
          .$put(`api/v2/user/profile`, payload, {
            headers: { Authorization: this.$auth.strategy.token.get() }
          })
          .then(response => {
            console.log(response);
            this.$router.push(`/users/${this.editProfile.aid}`);
          });
      } catch (err) {
        console.log(err.message);
      }
    },
    toggleUserProfileStatus() {
      let curStatus = this.editProfile.profile.is_active;
      if (curStatus == true) {
        this.$axios
          .$put(
            `api/v2/user/profile/deactivate`,
            {
              profileid: this.editProfile.profileid
            },
            {
              headers: { Authorization: this.$auth.strategy.token.get() }
            }
          )
          .then(response => {
            this.$toast.success(response, {
              timeout: 2000
            });
            this.loadUserProfile();
          })
          .catch(err => {
            this.$toast.error(err.message, {
              timeout: 2000
            });
            console.log(err.message);
          });
      } else {
        this.$axios
          .$put(
            `api/v2/user/profile/activate`,
            {
              profileid: this.editProfile.profileid
            },
            {
              headers: { Authorization: this.$auth.strategy.token.get() }
            }
          )
          .then(response => {
            this.$toast.success(response, { timeout: 2000 });
            this.loadUserProfile();
          })
          .catch(err => {
            this.$toast.error(err.message, { timeout: 2000 });
            console.log(err.message);
          });
      }
    },
    loadUserProfile() {
      let curUrl = this.$nuxt.$route.params.id;
      // this.$store.dispatch("GET_USER_PROFILE_DETAILS", curUrl);
      this.$axios
        .$get(`api/v2/user/profile/details/${curUrl}`)
        .then(response => {
          this.user_profile = response;
          this.editProfile = _.cloneDeep(response);
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
      demoteDialog: false,
      promoteDialog: false,
      editProfile: {},
      rules: [value => !!value || "Required."],
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
          href: "/quests/"
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

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
                    ><v-btn color="success" small class="mx-1" @click="updateMyProfileData()">Save</v-btn>
                    <v-btn color="warning" :to="`/profile`" small class="mx-1"
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
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-card v-if="user_profile.profile">
              <v-card-text
                >Current Score : {{ user_profile.profile.score }}</v-card-text
              >
            </v-card>
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
    updateMyProfileData() {
      try {
        let payload = {
            profileid:this.editProfile.profileid,
          firstname: this.editProfile.profile.firstname,
          lastname: this.editProfile.profile.lastname
        };
        this.$axios.$put(`api/v2/user/profile`, payload).then(response => {
          console.log(response);
          this.$router.push(`/profile`);
        });
      } catch (err) {
        console.log(err.message);
      }
    },
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

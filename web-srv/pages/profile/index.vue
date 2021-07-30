<template>
  <div class="userProfile">
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
                    >User Details <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      @click="uploadImageDialog = true"
                      class="mx-1"
                      >Upload New Image</v-btn
                    >
                    <v-btn
                      color="warning"
                      :to="`/profile/${user_profile.aid}/edit`"
                      class="mx-1"
                    >
                      Edit
                    </v-btn>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-row>
                      <v-col cols="3">
                        <v-img
                          v-if="!user_profile.profile.p_img"
                          src="/default-user.png"
                          max-height="150"
                          max-width="150"
                        ></v-img>
                        <v-img
                          v-else
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
                  <v-card-title>Achievements</v-card-title>
                  <v-divider></v-divider>
                  <v-card-text></v-card-text>
                </v-card>
              </v-col>
            </v-row>
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
                            style="width:80px;"
                            x-small
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
                            style="width:80px;"
                            x-small
                            dark
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
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-dialog v-model="uploadImageDialog" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Upload New Profile Image
        </v-card-title>

        <v-card-text>
          <v-file-input
            v-model="selectedFile"
            @change="onFileSelected"
            show-size
            small-chips
            accept="image/png, image/jpeg, image/bmp"
            placeholder="Pick an avatar"
            prepend-icon="mdi-image"
            label="Avatar"
          ></v-file-input>
          <v-row v-if="showLoadingImage">
            <v-col align="center" justify="center">
              Loading Image...
              <v-progress-circular
                :size="20"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="onUpload()">
            Upload
          </v-btn>
          <v-btn color="success" @click="uploadImageDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogToggle" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Delete Quest Marker
        </v-card-title>

        <v-card-text>
          Are You sure you want to Delete This Quest Marker?
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="deleteDialogToggle = false">
            Delete
          </v-btn>
          <v-btn color="success" @click="deleteDialogToggle = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  middleware: ["auth","checkUserDeactivated"],
  created() {
    this.$store.dispatch("GET_USER_PROFILE_DETAILS", this.$nuxt.$auth.user.aid);
    this.$store.dispatch(
      "GET_CUR_USER_SUBMITTED_MARKERS",
      this.$nuxt.$auth.user.aid
    );
  },
  computed: {
    ...mapState({
      user_profile: state => state.user_profile,
      map_marker_list: state => state.marker_list
    })
  },
  data() {
    return {
      showLoadingImage: false,
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
      page: {
        title: "User Profile"
      },
      breadcrumbs: [
        {
          text: "Home",
          disabled: false,
          href: "/"
        },
        {
          text: "User List",
          disabled: false,
          href: "/user/"
        },
        {
          text: "User Profile",
          disabled: true
        }
      ]
    };
  },
  methods: {
    onFileSelected(event) {      
      if (event) {
        this.showLoadingImage = true;
        this.selectedFile = event;
        this.showLoadingImage = false;        
      }
    },
    onUpload() {
      this.uploadImageDialog = false;
      let fd = new FormData();
      fd.append("file", this.selectedFile, this.selectedFile.name);

      this.$axios
        .$post(
          "api/v1/apg/imsrv/s",
          fd,
          {
            headers: { Authorization: this.$auth.strategy.token.get() }
          },
          {
            onUploadProgress: uploadEvent => {
              console.log(
                `Upload Progress: ${Math.round(
                  (uploadEvent.loaded / uploadEvent.total) * 100
                )} + %`
              );
            }
          }
        )
        .then(response => {
          try {
            let myData = {
              aid: this.user_profile.aid,
              p_img: response.img_url
            };
            let uploadResults = this.$axios.$put(
              `api/v2/user/profile/pic`,
              myData,
              {
                headers: { Authorization: this.$auth.strategy.token.get() }
              }
            );
            // console.log(uploadResults);
            this.$store.dispatch("GET_USER_PROFILE_DETAILS", this.$nuxt.$auth.user.aid);
          } catch (err) {
            console.log(err.message);
          }
        });
    },
    deleteUserDialog() {
      if (this.deleteDialogToggle == true) {
        this.deleteDialogToggle = false;
      } else {
        this.deleteDialogToggle = true;
      }
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
    }
  },
  watch: {
    map_marker_list() {
      this.loadingBar = false;
    }
  }
};
</script>

<style></style>

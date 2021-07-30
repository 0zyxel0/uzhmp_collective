<template>
  <div class="user">
    <BaseBreadcrumb
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
      <v-col>
        <h3>
          <v-icon left>mdi-format-list-bulleted-square</v-icon> Users List
        </h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card flat class="mb-7">
          <v-card-title>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              hide-details
              clearable
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="users_list"
              :search="search"
              :items-per-page="10"
              :loading="loadingBar"
              loading-text="Loading... Please wait"
            >
              <template slot="item.join_date" slot-scope="{ item }">
                {{ computeDateData(item.join_date) }}
              </template>
              <template slot="item.last_loggedin" slot-scope="{ item }">
                {{ computeDateData(item.last_loggedin) }}
              </template>
              <template slot="item.actions" slot-scope="{ item }">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      v-bind="attrs"
                      v-on="on"
                      tile
                      x-small
                      @click="viewUserDetails(item.aid)"
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
                      @click="deleteUserDialog(item)"
                      style="width:80px;"
                    >
                      <v-icon x-small left>mdi-delete</v-icon>
                      Delete
                    </v-btn>
                  </template>
                  <span>Delete Machine</span>
                </v-tooltip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- DIALOG BOX -->
    <!-- User Profile Dialog Box -->
    <v-dialog v-model="userDialog" persistent max-width="500px">
      <v-card max-width="600" tile>
        <v-toolbar dark color="primary" class="mb-4">
          <v-btn icon dark @click="userDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>User Profile</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="5" class="text-center">
              <v-badge
                bordered
                color="green"
                offset-x="40"
                offset-y="25"
                content="Active"
                v-if="this.status == true"
              >
                <v-hover v-slot="{ hover }">
                  <v-avatar size="160" class="profile-img">
                    <v-img
                      :src="require('~/assets/images/user.png')"
                      v-if="profile_img == null"
                    >
                      <v-fade-transition>
                        <div
                          v-if="hover"
                          class="d-flex grey  v-img--reveal  white--text"
                          style="height: 100%;"
                        >
                          <v-btn @click="editUserPhotoProfileDialog" icon dark
                            ><v-icon>mdi-camera</v-icon></v-btn
                          >
                        </div>
                      </v-fade-transition>
                    </v-img>
                    <v-img :src="profile_img" v-if="profile_img != null">
                      <v-fade-transition>
                        <div
                          v-if="hover"
                          class="d-flex grey  v-img--reveal  white--text"
                          style="height: 100%;"
                        >
                          <v-btn @click="editUserPhotoProfileDialog" icon dark
                            ><v-icon>mdi-camera</v-icon></v-btn
                          >
                        </div>
                      </v-fade-transition>
                    </v-img>
                  </v-avatar>
                </v-hover>
              </v-badge>

              <v-badge
                bordered
                color="grey"
                offset-x="40"
                offset-y="25"
                content="Inactive"
                v-if="this.status == false"
              >
                <v-avatar
                  size="160"
                  class="profile-img"
                  v-if="profile_img == null"
                >
                  <v-img :src="require('~/assets/images/user.png')"> </v-img>
                </v-avatar>
                <v-avatar
                  size="160"
                  class="profile-img"
                  v-if="profile_img != null"
                >
                  <v-img :src="profile_img"></v-img>
                </v-avatar>
              </v-badge>

              <div class="mt-6">
                <v-btn
                  color="primary"
                  class="white--text"
                  small
                  @click="editUserProfileDialog"
                >
                  <v-icon left dark small>
                    mdi-pencil
                  </v-icon>
                  Edit
                </v-btn>
                <v-btn color="error" class="white--text" small>
                  <v-icon left dark small>
                    mdi-delete
                  </v-icon>
                  Delete
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" md="7" class="mt-4">
              <h1 class="text-capitalize">
                {{ this.firstname }} {{ this.lastname }}
              </h1>
              <p class="primary--text subtitle-1">{{ this.email }}</p>
              <v-chip
                class="mb-2 text-capitalize"
                color="cyan"
                label
                text-color="white"
              >
                <v-icon left>
                  mdi-account-circle-outline
                </v-icon>
                {{ this.role }}
              </v-chip>
              <p class="caption">Last Logged in: {{ this.lastloggedin }}</p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit User Profile Dialog Box -->
    <v-dialog v-model="editUserDialog" persistent max-width="600px">
      <v-card tile>
        <v-toolbar dark color="primary" class="mb-4">
          <v-btn icon dark @click="closeEditUserProfileDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Edit User Profile</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form
            @submit.prevent="submitForm()"
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-row>
              <v-col cols="12" md="5" class="text-center">
                <v-avatar size="160" class="profile-img">
                  <v-img
                    v-if="profile_img != null"
                    :lazy-src="require('~/assets/images/user.png')"
                    :src="profile_img"
                  >
                  </v-img>
                  <v-img
                    v-if="profile_img == null"
                    :lazy-src="require('~/assets/images/user.png')"
                    :src="require('~/assets/images/user.png')"
                  >
                  </v-img>
                </v-avatar>

                <v-file-input
                  v-model="userPhoto"
                  @change="onFileSelected"
                  show-size
                  small-chips
                  ref="file"
                  accept="image/png, image/jpeg, image/bmp"
                  placeholder="Pick an avatar"
                  prepend-icon="mdi-image"
                ></v-file-input>

                <v-switch
                  v-model="is_active"
                  inset
                  :label="`Status`"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="firstname"
                  label="First Name"
                  :rules="fnameRules"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="lastname"
                  label="Last Name"
                  :rules="lnameRules"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  label="Email Address"
                  :rules="emailRules"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="mobileno"
                  :rules="mobilenoRules"
                  label="Mobile No"
                  required
                ></v-text-field>
                <v-btn
                  block
                  color="primary"
                  @click="submitForm()"
                  class="mt-4"
                  :disabled="!valid"
                  :loading="isUploading"
                >
                  Update
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit User Photo Dialog Box -->
    <v-dialog v-model="editUserPhotoDialog" persistent max-width="400px">
      <v-card max-width="400" tile>
        <v-toolbar dark color="primary" class="mb-4">
          <v-btn icon dark @click="closeEditUserPhotoDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Update User Photo</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="text-center">
          <v-row>
            <v-col cols="12">
              <v-form
                @submit.prevent="submitForm()"
                ref="form"
                v-model="valid"
                lazy-validation
                enctype="multipart/form-data"
              >
                <v-avatar size="160" class="profile-img">
                  <!-- <v-img lazy-src="https://via.placeholder.com/450" :src="require('~/assets/images/user.png')"> </v-img> -->
                  <v-img
                    :lazy-src="require('~/assets/images/user.png')"
                    :src="imgUrl"
                  >
                  </v-img>
                </v-avatar>
                <v-file-input
                  v-model="userPhoto"
                  @change="onFileSelected"
                  :rules="imgRules"
                  show-size
                  small-chips
                  ref="file"
                  accept="image/png, image/jpeg, image/bmp"
                  placeholder="Pick an avatar"
                  prepend-icon="mdi-image"
                ></v-file-input>

                <div class="mt-6">
                  <!-- <v-btn color="blue-grey" class="white--text" small>
                    <v-icon left dark small>
                      mdi-cloud-upload
                    </v-icon>
                    Upload
                  </v-btn> -->
                  <v-btn
                    color="primary"
                    block
                    @click="updateUserPhoto()"
                    class="mr-4"
                    :loading="isUploading"
                    :disabled="!valid"
                  >
                    Update
                  </v-btn>
                </div>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete user Dialog Box -->
    <v-dialog v-model="deleteDialog" persistent max-width="300px">
      <v-sheet
        class="px-7 pt-7 pb-4 mx-auto text-center d-inline-block"
        color="blue-grey darken-3"
        dark
      >
        <div class="grey--text text--lighten-1 text-body-2 mb-4">
          Are you sure you want to delete this user?
        </div>
        <v-btn
          elevation="0"
          class="ma-1"
          color="grey"
          text
          @click="deleteDialog = !deleteDialog"
        >
          Cancel
        </v-btn>
        <v-btn class="ma-1" color="error" text @click="deleteUser">
          Delete
        </v-btn>
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  middleware: "roleView",
  data() {
    return {
      dialog: false,
      deleteDialog: false,
      userDialog: false,
      editUserPhotoDialog: false,
      loadingBar: true,
      isUploading: false,
      search: "",
      valid: true,
      page: {
        title: "User List"
      },
      breadcrumbs: [
        {
          text: "Home",
          disabled: false,
          to: "/"
        },
        {
          text: "User List",
          disabled: true
        }
      ],
      headers: [
        {
          text: "Last Name",
          align: "start",
          sortable: true,
          value: "profile.lastname"
        },
        { text: "First Name", sortable: false, value: "profile.firstname" },
        { text: "Email", sortable: false, value: "email" },
        { text: "Joined Date", sortable: false, value: "join_date" },
        { text: "Last logged in", sortable: false, value: "last_loggedin" },
        { text: "Actions", value: "actions", sortable: false }
      ],
      users: [],
      is_active: "",
      userPhoto: null,
      imgUrl: null,
      selectedImage: null,
      userid: "",
      firstname: "",
      lastname: "",
      email: "",
      lastloggedin: "",
      role: "",
      status: "",
      mobileno: "",
      profile_img: null,
      fnameRules: [v => !!v || "First Name is required"],
      lnameRules: [v => !!v || "Last Name is required"],
      mobilenoRules: [v => !!v || "Mobile Number is required"],
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      imgRules: [
        v => !!v || "User Photo is required",
        v => !v || v.size < 2000000 || "Photo size should be less than 2 MB!"
      ]
    };
  },
  computed: {
    ...mapState({
      editUserDialog: state => state.editUserDialog,
      users_list: state => state.users_list
    })
  },
  mounted() {
    this.$store.dispatch("getUsers");
  },

  methods: {
    viewUserDetails(payload) {
      this.$router.push(`/users/${payload}`);
    },
    userProfileDialog(item) {
      this.id = item._id;
      this.userid = item.aid;
      this.firstname = item.firstname;
      this.lastname = item.lastname;
      this.email = item.email;
      this.lastloggedin = item.last_loggedin;
      this.role = item.role;
      this.board = item.board;
      this.language = item.language;
      this.is_active = item.is_active;
      this.is_dark = item.is_dark;
      this.is_verified = item.is_verified;
      this.status = item.is_active;
      this.mobileno = item.mobileno;
      this.profile_img = item.profile_img;
      this.userDialog = true;
      this.isUploading = false;
    },
    editUserProfileDialog() {
      //this.editUserDialog = true;
      this.$store.commit("toggleEditUserDialog");
      this.userDialog = false;
    },
    editUserPhotoProfileDialog() {
      this.editUserPhotoDialog = true;
      this.userDialog = false;
    },
    deleteUserDialog(item) {
      this.userid = item.aid;
      this.lastname = item.lastname;
      this.deleteDialog = true;
    },
    deleteUser() {
      //this.$store.dispatch("deleteUser", { machineID: this.machineID, machineName: this.machineName });
      this.deleteDialog = false;
      this.$toast.success(`${this.lastname} Deleted successfully!`);
    },

    closeEditUserPhotoDialog() {
      this.editUserPhotoDialog = false;
      this.isUploading = false;
      this.userDialog = true;
      this.userPhoto = null;
    },
    closeEditUserProfileDialog() {
      this.$store.commit("toggleEditUserDialog");
      //this.userDialog = true;
      //this.isUploading = false;
      //this.userDialog = true;
      //this.userPhoto = null;
    },

    updateUserPhoto() {
      if (this.$refs.form.validate(true)) {
        this.isUploading = true;
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
    },
    onFileSelected(event) {
      if (event) {
        this.selectedImage = event;
        //console.log(event);
        //this.$toast.info(`${this.selectedImage.name}`);
        this.profile_img = URL.createObjectURL(this.userPhoto);
      } else {
        this.isUploading = false;
        this.profile_img = require("~/assets/images/user.png");
      }
    },

    submitForm() {
      if (this.$refs.form.validate(true)) {
        let data = new FormData();
        data.append("file", this.selectedImage);

        let payload = {
          aid: this.userid,
          fname: this.firstname,
          lname: this.lastname,
          email: this.email,
          mobileno: this.mobileno,
          role: this.role,
          board: this.board,
          language: this.language,
          is_active: this.is_active,
          is_dark: this.is_dark,
          is_verified: this.is_verified,
          profile_img: data
        };
        if (this.selectedImage == null) {
          // Upload image is empty
          this.isUploading = true;
          this.$store.dispatch("updateUserInfo", payload);
        } else {
          // Upload image is not empty
          this.isUploading = true;
          this.$store.dispatch("updateUserInfoPhoto", payload);
        }
      }
    }
  },

  watch: {
    users_list() {
      this.loadingBar = false;
    }
  }
};
</script>

<style>
.profile-img {
  border: 3px dotted red;
}
.v-img--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.5;
  position: absolute;
  width: 100%;
}
</style>

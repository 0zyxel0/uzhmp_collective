<template>
  <v-row>
    <v-col
      cols="12"
      lg="7"
      xl="6"
      class="info d-none d-md-flex align-center justify-center"
    >
      <v-container>
        <div class="pa-10">
          <v-row justify="center">
            <v-col cols="8" xl="5">
              <div>
                <h2 class="display-1 white--text font-weight-medium">
                  UZH MASTERS PROJECT
                </h2>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-col>
    <v-col cols="12" lg="5" xl="6" class="d-flex align-center">
      <v-container>
        <div class="pa-7 pa-sm-12">
          <v-row>
            <v-col cols="12" lg="9" xl="6">
              <!-- <img src="@/assets/images/logo-icon.png" /> -->
              <!-- <v-img src="/logo.png" max-height="150" max-width="250"></v-img> -->
              <h2 class="font-weight-bold mt-4 blue-grey--text text--darken-2">
                Sign in
              </h2>
              <h6 class="subtitle-1">
                Don't have an account?
                <a href="/register/" class="text-decoration-none">Sign Up</a>
              </h6>
              <v-alert type="success" v-if="$route.params.registered == 'yes'">
                You have registered successfully
              </v-alert>
              <v-form
                ref="form"
                v-model="valid"
                @submit.prevent="submit()"
                lazy-validation
              >
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail"
                  class="mt-4"
                  required
                  outlined
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  :counter="10"
                  :rules="passwordRules"
                  label="Password"
                  required
                  outlined
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show ? 'text' : 'password'"
                  @click:append="toggleShow"
                ></v-text-field>
                <v-btn
                  :disabled="!valid"
                  color="info"
                  block
                  class="mr-4"
                  type="submit"
                  >Sign In
                  <template v-slot:loader>
                    <span>Loading...</span>
                  </template></v-btn
                >
              </v-form>
              <v-dialog v-model="dialog" persistent width="300">
                <v-card color="primary" dark class="pt-3">
                  <v-card-text>
                    Logging in ...
                    <v-progress-linear
                      indeterminate
                      color="white"
                      class="mb-0"
                    ></v-progress-linear>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: "Blanklayout",
  middleware: "auth",
  auth: "guest",
  data() {
    return {
      valid: true,
      dialog: false,
      login_error: null,
      password: "",
      show: false,
      passwordRules: [
        v => !!v || "Password is required",
        v => (v && v.length <= 10) || "Password must be less than 10 characters"
      ],
      email: "",
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      checkbox: false
    };
  },
  methods: {
    toggleShow() {
      this.show = !this.show;
    },
    submit() {
      this.$refs.form.validate();
      if (this.$refs.form.validate(true)) {
        this.dialog = true;
        this.$auth
          .loginWith("local", {
            data: {
              email: this.email,
              password: this.password
            }
          })
          .catch(error => {
            console.log(error);
            if (error) {
              this.dialog = false;
              this.$toast.error("Error In Logging In, Please Check Credentials Provided.");
            }
          });
      }
    }
  }
};
</script>

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
              <h2 class="font-weight-bold mt-4 blue-grey--text text--darken-2">
                Sign Up
              </h2>
              <h6 class="subtitle-1">
                Don't have an account?
                <a href="/login/" class="text-decoration-none">Sign in</a>
              </h6>
              <v-alert type="error" v-if="errors && errors.email">
                {{ errors.email.value }}
              </v-alert>              
              <v-form
                ref="form"
                v-model="valid"
                lazy-validation
                action="/pages/boxedlogin"
              >
                <v-text-field
                  v-model="fname"
                  :rules="fnameRules"
                  label="Given Name"
                  class="mt-4"
                  required
                  outlined
                ></v-text-field>
                <v-text-field
                  v-model="lname"
                  :rules="fnameRules"
                  label="Family Name"
                  class="mt-4"
                  required
                  outlined
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail"
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

                <div class="d-block d-sm-flex align-center mb-4 mb-sm-0">
                  <v-checkbox
                    v-model="checkbox"
                    :rules="[v => !!v || 'You must agree to continue!']"
                    label="I agree that my data can be used for further research and data processing to further improve overall field accessibility for citizens and improvement on the performance of the application."
                    required
                  ></v-checkbox>
                </div>
                <v-btn
                  :disabled="!valid"
                  color="info"
                  block
                  class="mr-4"
                  submit
                  @click="submit"
                  >Sign Up</v-btn
                >
              </v-form>
              <v-dialog v-model="dialog" persistent width="300">
                <v-card color="primary" dark class="pt-3">
                  <v-card-text>
                    Signing up ...
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
  name: "FullRegistration",
  auth: "guest",
  data: () => ({
    valid: true,
    errors: null,
    lname:null,
    fname:null,
    password: "",
    dialog: false,
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
    checkbox: false,
    full_name: "",
    fnameRules: [
      v => !!v || "Name is required",
      v => (v && v.length <= 20) || "Name must be less than 20 characters"
    ]
  }),
  methods: {
    toggleShow() {
      this.show = !this.show
    },
    submit() {
      this.$refs.form.validate();
      if (this.$refs.form.validate(true)) {
        this.dialog = true
        this.$axios.$post("api/v2/register", {
            fname: this.fname,
            lname: this.lname,           
            email: this.email,
            password: this.password
          })
          .then(response => {
            if (response) {
              this.$router.push({ path: '/register-success'});             
            }
          })
          .catch(error => {
            console.log(error);
            if (error.message) {
              this.dialog = false
              this.$toast.error(error.message);
            }
          });
      }
    }
  }
};
</script>

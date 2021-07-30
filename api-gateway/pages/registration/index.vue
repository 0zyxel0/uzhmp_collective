<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="6" sm="6" md="6">
        <v-card>
          <v-card-title> Registration </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitForm()">
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="givenname"
                    label="Given Name"
                    outlined
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="familyname"
                    label="Family Name"
                    outlined
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="email"
                    label="Email"
                    :rules="emailRules"
                    outlined
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="password"
                    required
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    label="Password"
                    outlined
                    @click:append="show1 = !show1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="confirmPassword"
                    required
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    label="Confirm Password"
                    outlined
                    @click:append="show1 = !show1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn type="submit" color="primary">Register</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: "default",
  auth: "guest",
  data() {
    return {
      givenname: null,
      familyname: null,
      errors: null,
      login_error: null,
      email: null,
      password: null,
      confirmPassword: null,
      status: false,
      show1: false,
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ]
    };
  },
  methods: {}
};
</script>

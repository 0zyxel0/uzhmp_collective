export const state = () => ({
  // MODAL
  showModal: false,
  editUserDialog: false,

  // Progress Status
  loadingMapMarker: true,
  osmProgress: false,
  // USERS STATE
  users_list: [],
  user_details: {},
  user_profile: {},

  // MAP STATES
  marker_list: [],
  verified_marker_list: [],
  unverified_marker_list: [],
  map_marker_details: {},
  possible_marker_list: [],
  osmIsProduction: {}
});

export const mutations = {
  toggleModal(state) {
    state.showModal = !state.showModal;
  },
  toggleEditUserDialog(state) {
    state.editUserDialog = !state.editUserDialog;
  },
  toggleUpdateUser(state) {
    state.editUserDialog = false;
  },

  // USERS MUTATIONS
  GET_USERS(state, payload) {
    state.users_list = payload;
  },

  // SET USER DETAILS BEING VIEWED
  SET_USER_DETAILS(state, payload) {
    state.user_details = payload;
  },

  // HIDE THE MAP MARKER PROFRESS
  SET_MAP_MARKER_LOADING(state, payload) {
    state.loadingMapMarker = payload;
  },

  // MAPPING SERVICE MUTATIONS
  SET_MAP_MARKERS(state, payload) {
    state.marker_list = payload;
  },
  SET_UNVERIFIED_MAP_MARKERS(state, payload) {
    state.unverified_marker_list = payload;
  },
  SET_MAP_MARKER_DETAILS(state, payload) {
    state.map_marker_details = payload;
  },
  SET_VERIFIED_MARKER_list(state, payload) {
    state.verified_marker_list = payload;
  },
  SET_POSSIBLE_MARKER_DUPLICATES(state, payload) {
    state.possible_marker_list = payload;
  },
  SET_UPDATED_MARKER_DETAILS(state, payload) {
    state.map_marker_details = payload;
  },
  SET_OSM_PROGRESS(state, payload) {
    state.osmProgress = payload;
  },
  SET_VIEW_USER_PROFILE(state, payload) {
    state.user_profile = payload;
  },
  SET_OSM_ENVIRONMENT(state, payload) {
    state.osmIsProduction = payload;
  }
};

export const actions = {
  // USERS ACTIONS
  getUsers({ commit }) {
    this.$axios
      .$get("api/v2/user/list", {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        commit("GET_USERS", response);
      })
      .catch(err => {
        console.log(`[ERROR] ${err.message}`);
      });
  },

  updateUserInfo(
    { commit, dispatch },
    {
      aid,
      fname,
      lname,
      email,
      mobileno,
      role,
      board,
      language,
      is_active,
      is_dark,
      is_verified,
      profile_img
    }
  ) {
    this.$axios
      .$put(
        "api/v1/user/profile",
        {
          aid: aid,
          fname: fname,
          lname: lname,
          email: email,
          mobileno: mobileno,
          role: role,
          board: board,
          language: language,
          is_active: is_active,
          is_dark: is_dark,
          is_verified: is_verified,
          profile_img: profile_img
        },
        { headers: { Authorization: this.$auth.strategy.token.get() } }
      )
      .then(response => {
        //console.log(response);
        this.$toast.success(`${fname} has been successfully updated!`);
        commit("toggleUpdateUser");
        dispatch("getUsers");
      })
      .catch(error => {
        console.log(error);
        this.$toast.error(error.response.data[0].message);
      });
  },

  updateUserInfoPhoto(
    { commit, dispatch },
    {
      aid,
      fname,
      lname,
      email,
      mobileno,
      role,
      board,
      language,
      is_active,
      is_dark,
      is_verified,
      profile_img
    }
  ) {
    this.$axios
      .$put(
        "api/v1/user/profile",
        {
          aid: aid,
          fname: fname,
          lname: lname,
          email: email,
          mobileno: mobileno,
          role: role,
          board: board,
          language: language,
          is_active: is_active,
          is_dark: is_dark,
          is_verified: is_verified,
          profile_img: profile_img
        },
        { headers: { Authorization: this.$auth.strategy.token.get() } }
      )
      .then(response => {
        dispatch("updateUserPhoto", { profile_img, aid, fname });
      })
      .catch(error => {
        console.log(error);
        this.$toast.error(error.response.data[0].message);
      });
  },

  updateUserPhoto({ commit, dispatch }, { profile_img, aid, fname }) {
    this.$axios
      .$post("api/v1/apg/imsrv/s", profile_img)
      .then(response => {
        this.$toast.success(`${fname} has been successfully updated!`);
        commit("toggleUpdateUser");
        this.$axios
          .$put(
            "api/v1/user/profile/pic",
            {
              aid: aid,
              profile_img: response.img_url
            },
            {
              headers: { Authorization: this.$auth.strategy.token.get() }
            }
          )
          .then(response => {
            dispatch("getUsers");
          });
      })
      .catch(error => {
        console.log(error);
      });
  },

  GET_USER_PROFILE_DETAILS({ commit }, payload) {
    this.$axios
      .$get(`api/v2/user/profile/details/${payload}`)
      .then(response => {
        commit("SET_VIEW_USER_PROFILE", response);
      })
      .catch(error => {
        console.log(error);
      });
  },
  GET_MAP_MARKERS({ commit }) {
    this.$axios
      .$get("api/v1/apg/msrv/list", {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        commit("SET_MAP_MARKERS", response);
      })
      .catch(error => {
        console.log(error);
      });
  },
  GET_UNVERIFIED_MAP_MARKERS({ commit }) {
    this.$axios
      .$get("api/v1/apg/msrv/open/markers", {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        commit("SET_UNVERIFIED_MAP_MARKERS", response);
        commit("SET_MAP_MARKER_LOADING", false);
      })
      .catch(error => {
        console.log(error);
      });
  },
  GET_MAP_MARKER_DETAILS({ commit }, { mid }) {
    this.$axios
      .$get(`api/v1/apg/msrv/marker/${mid}`, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        commit("SET_MAP_MARKER_DETAILS", response);
      })
      .catch(error => {
        console.log(error);
      });
  },
  GET_VERIFIED_MAP_MARKERS({ commit }) {
    this.$axios
      .$get(`api/v1/apg/msrv/verified/markers`, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        commit("SET_VERIFIED_MARKER_list", response);
      })
      .catch(error => {
        console.log(error);
      });
  },

  GET_POSSIBLE_MARKER_DUPLICATES({ commit }, payload) {
    this.$axios
      .post(`api/v1/apg/msrv/check/marker/duplicates`, payload, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        commit("SET_POSSIBLE_MARKER_DUPLICATES", response.data);
      })
      .catch(error => {
        console.log(error);
      });
  },

  UPDATE_MARKER_DETAILS({ commit }, payload) {
    this.$axios
      .put("api/v1/apg/msrv/marker", payload, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        commit("SET_UPDATED_MARKER_DETAILS", response.data);
      })
      .catch(error => {
        console.log(error);
      });
  },
  DEACTIVATE_MARKER({ commit }, payload) {
    this.$axios
      .post("api/v1/apg/msrv/status/marker/update", payload, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  },
  SUBMIT_PAYLOAD_TO_OSMDEV({ commit }, payload) {
    commit("SET_OSM_PROGRESS", true);
    this.$axios
      .post(`api/v1/apg/msrv/osm/dev/node/create`, payload, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        // console.log(response.data);
        commit("SET_OSM_PROGRESS", false);
        this.$toast.success("Successfully Uploaded Data to OSM Servers");
      })
      .catch(error => {
        // console.log(error);
        commit("SET_OSM_PROGRESS", false);
        this.$toast.error("Error Uploading Data to OSM Servers");
      });
  },
  SUBMIT_PAYLOAD_TO_OSMPROD({ commit }, payload) {
    commit("SET_OSM_PROGRESS", true);
    this.$axios
      .post(`api/v1/apg/msrv/osm/prod/node/create`, payload, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        // console.log(response.data);
        commit("SET_OSM_PROGRESS", false);
        this.$toast.success("Successfully Uploaded Data to OSM Servers");
      })
      .catch(error => {
        // console.log(error);
        commit("SET_OSM_PROGRESS", false);
        this.$toast.error("Error Uploading Data to OSM Servers");
      });
  },
  GET_USER_DETAILS({ commit }, payload) {
    this.$axios
      .get(`api/v2/user/profile`, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        // console.log(response.data);
        commit("SET_USER_DETAILS", payload);
      })
      .catch(error => {
        // console.log(error);
      });
  },
  GET_CUR_USER_SUBMITTED_MARKERS({ commit }, payload) {
    commit("SET_MAP_MARKERS", []);
    this.$axios
      .get(`api/v1/apg/msrv/submitted/markers/${payload}`, {
        headers: { Authorization: this.$auth.strategy.token.get() }
      })
      .then(response => {
        // console.log(response.data);
        commit("SET_MAP_MARKERS", response.data);
      })
      .catch(error => {
        console.log(error);
      });
  },
  GET_OSM_ENVIRONMENT_STATUS({ commit }) {
    this.$axios
      .get("api/v2/osm/site/settings")
      .then(response => {
        commit("SET_OSM_ENVIRONMENT", response.data.osm_environment);
      })
      .catch(error => {
        console.log(error);
      });
  },
  UPDATE_OSM_ENVIRONMENT_STATUS({ commit }, payload) {
    this.$axios
      .$put("api/v2/osm/site/settings/update", {
        osm_environment: payload.osm_environment
      })
      .then(response => {
        commit("SET_OSM_ENVIRONMENT", response.osm_environment);
        this.$toast.success("Successfully Updated OSM Environment", 2000);
      })
      .catch(error => {
        console.log(error);
        this.$toast.error("Error In Updating OSM Environment", 2000);
      });
  }
};

export const getters = {};

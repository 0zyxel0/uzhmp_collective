import axios from "axios";

export const state = () => ({
  app_title:"Some Gateway",
  metauser: null,
  userlist: []
});

export const mutations = {
  SET_USER_LIST(state, payload) {
    state.userlist = payload;
  },
  SET_USER_TYPE(state, payload){
    
  }
};

export const actions = {
  FETCH_USERS({ commit }) {
    axios
      .get(`/api/v1/users`, {
        headers: {
          Authorization: this.$auth.strategy.token.get()
        }
      })
      .then(response => {          
        commit("SET_USER_LIST", response.data);
      });
  },
  UPDATE_USER({ commit}){

  },
  // Get Environment Variables for the Dashboard Title
};

export const getters = {};

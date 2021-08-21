// import colors from "vuetify/es5/util/colors";

const lightTheme = {
  primary: "#005cb9", // change header color from here || "#1e88e6", "#21c1d6", "#fc4b6c", "#563dea", "#9C27b0", "#ff9800"
  info: "#005cb9",
  success: "#21c1d6",
  accent: "#fc4b6c",
  default: "#563dea",
  background: "EEF5F9"
};
const darkTheme = {
  primary: "#005cb9", // change header color from here || "#1e88e6", "#21c1d6", "#fc4b6c", "#563dea", "#9C27b0", "#ff9800"
  info: "#005cb9",
  success: "#21c1d6",
  accent: "#fc4b6c",
  default: "#563dea"
};

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "%s - web-ui",
    title: "web-ui",
    htmlAttrs: {
      lang: "en"
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Server Side Rendering Configuration
  ssr: false,

  // Authentication Config

  auth: {
    strategies: {
      local: {
        endpoints: {
          // these are the API endpoints we created in Express
          login: {
            url:
              process.env.GATEWAY_LOGIN_URL || `http://localhost:8081/api/v2/login`,
            method: "post",
            propertyName: "token"
          },
          logout: true,
          // User Profile Will be automatically be fetched when user login
          user: {
            url:
              process.env.GATEWAY_PROFILE_URL || `http://localhost:8081/api/v2/user/profile`,
            method: "get",
            propertyName: "user"
          }
        },
        tokenRequired: true,
        tokenType: "Bearer"
      }
    },
    redirect: {
      login: "/login",
      callback: "/auth/signed-in",
      logout: "/login",
      home: "/"
    },
    rewriteRedirects: true
  },

  // Adding a AXIOS PATH DEFAULT
  axios: {
    baseURL:
      process.env.GATEWAY_BASE_URL || `http://localhost:8081`,
    proxyHeaders: false,
    credentials: false
  },

  // Proxy Configuration
  // proxy: {
  //   '/api/': 'http://api.example.com'
  // },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify"
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    "nuxt-leaflet",
    "@nuxtjs/axios",
    "@nuxtjs/auth-next",
    "@nuxtjs/proxy",
    "vue-toastification/nuxt"
  ],

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    treeShake: true,
    theme: {
      options: {
        customProperties: true
      },
      themes: {
        dark: darkTheme,
        light: lightTheme
      },
      dark: false // If you want to set dark theme then dark:true else set to false
    },
    defaultAssets: {
      font: {
        family: "Poppins"
      }
    },
    rtl: false // If you want to set rtl theme then rtl:true else set to false
  },

  // Vue Toastification Configuration
  toast: {
    draggable: false,
    position: "top-right",
    timeout: 2000
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {}
};

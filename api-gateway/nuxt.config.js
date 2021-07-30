import colors from "vuetify/es5/util/colors";

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "%s - Gateway",
    title: "Masters Project",
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

  // Server Side Rendering
  ssr: false,

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify"
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxtjs/axios", "@nuxtjs/auth-next"],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Adding a runtimeConfig

  publicRuntimeConfig: {
    axios: {
      baseURL: process.env.APIBASE_URL || "http://localhost:3000"
    }
  },

  privateRuntimeConfig: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  // To Connect the API Layer to VUE UI
  serverMiddleware: ["~/api/index.js"],
  
  // Authentication for the UI
  auth: {
    strategies: {
      local: {
        endpoints: {
          // these are the API endpoints we created in Express
          login: {
            url: "/api/v1/login",
            method: "post",
            propertyName: "token"
          },
          logout: true,
          user: {
            url: "/api/v1/user/profile", //Call Endpoint when Login is Successful
            method: "get",
            propertyName: "user"
          }
        },
        tokenRequired: true,
        tokenType: "Bearer"
      }
    },
    redirect: {
      login: "/", // User will be redirected to this path if login is required
      logout: "/", // User will be redirected to this path if after logout, current route is protected
      home: "/admin/dashboard" // User will be redirect to this path after login if accessed login page directly
    },
    rewriteRedirects: true
  },
  router: {
    middleware: ["auth"]
  }
};

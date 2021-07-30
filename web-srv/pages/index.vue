<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title
          >Map Options
          <v-spacer></v-spacer>
          <v-col class="text-right">          
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark v-bind="attrs" v-on="on">
                  View Map Legend
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="(item, index) in mapLegend" :key="index">
                  <v-avatar rounded size="50">
                    <v-img
                      max-height="33"
                      max-width="20"
                      :src="item.icon"
                    ></v-img>
                  </v-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.title"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-card-title>
      </v-card>
    </v-col>

    <div id="map-wrap" style="height: 700px; width:100%;">
      <v-dialog v-model="loadingMapMarkers" fullscreen>
        <v-container
          fluid
          fill-height
          style="background-color: rgba(255, 255, 255, 0.5);"
        >
          <v-layout justify-center align-center>
            <v-progress-circular indeterminate color="primary">
            </v-progress-circular>
          </v-layout>
        </v-container>
      </v-dialog>
      <client-only>
        <l-map :zoom="zoomOption" :center="mapCenter" v-if="loadingMapMarkers != []">
          <l-tile-layer :url="osmurl"></l-tile-layer>
          <l-marker
            v-for="item in marker_list"
            :key="item._id"
            :lat-lng="item.marker_location"
          >
            <l-icon
              v-if="item.verifier_count >= 2"
              :icon-size="dynamicSize"
              :icon-anchor="dynamicAnchor"
              icon-url="/marker-icon-green.png"
            />
            <l-icon
              v-else
              :icon-size="dynamicSize"
              :icon-anchor="dynamicAnchor"
              icon-url="/marker-icon-orange.png"
            />
            <l-popup>
              <v-card-subtitle>{{ item.title }}</v-card-subtitle>
              <v-divider></v-divider>

              <v-card-text>
                {{ item.description }}
              </v-card-text>
              <v-divider></v-divider>
              <v-btn color="primary" block :to="`/quests/${item.mid}`"
                >View Quest</v-btn
              >
            </l-popup>
          </l-marker>
        </l-map>
      </client-only>
    </div>
  </v-row>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  layout: "default",
  middleware: ["auth","checkUserDeactivated"],
  mounted() {
    this.getMarkersBasedOnRole();
  },
  computed: {
    ...mapState({
      loadingMapMarkers: state => state.loadingMapMarkers,
      marker_list: state => state.marker_list
    }),
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    }
  },
  created() {},
  methods: {
    viewMarkerDetails(payload) {
      console.log(payload);
    },
    openMapFilterModal(payload) {},
    getMarkersBasedOnRole() {
      if (this.$auth.user.meta.role != "admin") {
        this.$store.dispatch(
          "GET_CUR_USER_SUBMITTED_MARKERS",
          this.$auth.user.aid
        );
      } else {
        this.$store.dispatch("GET_MAP_MARKERS");
      }
    }
  },
  data() {
    return {
      mapLegend: [
        { title: "Verified", icon: "/marker-icon-green.png" },
        { title: "Not Verified", icon: "/marker-icon-orange.png" }
      ],
      mapFilters: [
        { title: "Verified", status: "false" },
        { title: "Unverified", status: "false" },
        { title: "Show All", status: "false" }
      ],
      mapCenter: [47.3769, 8.5417],
      openMapMarkers: [],
      osmurl: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      zoomOption: 10
    };
  },
  watch: {}
};
</script>

<style scoped>
#map-wrap {
  z-index: 1;
}
</style>

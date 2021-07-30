<template>
  <div class="questModifyPage">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <v-card>
              <v-card-title>
                Quests ID : {{ map_marker_details.mid }} <v-spacer></v-spacer>
                <div>
                  <v-btn
                    color="primary"
                    tile
                    small
                    v-if="editStatus == false"
                    @click="toggleHistoryDialog()"
                    >History</v-btn
                  >
                  <v-btn
                    v-if="this.$auth.user.meta.role == 'admin'"
                    color="warning"
                    tile
                    small
                    :to="`/quests/${map_marker_details.mid}/edit`"
                    >Edit</v-btn
                  >
                </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      map_marker_details.title
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      map_marker_details.subtitle
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>Description</v-list-item-title>
                    <v-list-item-subtitle>{{
                      map_marker_details.description
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-card-subtitle>Tags</v-card-subtitle>
                <v-chip
                  v-for="item in map_marker_details.tags"
                  :key="item._id"
                  class="ma-2"
                  color="primary"
                  label
                  text-color="white"
                >
                  <v-icon left>
                    mdi-label
                  </v-icon>
                  {{ item.k }} : {{ item.v }}
                </v-chip>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card>
              <v-card-title
                >Verifiers <v-spacer></v-spacer>Verifier Count :
                {{ map_marker_details.verifier_count }}
              </v-card-title>

              <v-card-text>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">
                          User
                        </th>
                        <th class="text-left">
                          Date Verified
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in map_marker_details.verifiers"
                        :key="item._id"
                      >
                        <td>{{ item.aid }}</td>
                        <td>{{ computeDateData(item.updatedon) }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-card>
              <l-map
                :zoom="zoomOption"
                :center="map_marker_details.marker_location"
                style="z-index: 0; height:300px"
              >
                <l-tile-layer :url="osmurl"></l-tile-layer>

                <l-marker
                  v-if="map_marker_details.marker_location"
                  :lat-lng="extractMarkerLocation(map_marker_details)"
                >
                </l-marker>
              </l-map>
              <v-card-subtitle>
                Reported By :
                {{ map_marker_details.updatedby }}</v-card-subtitle
              >
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card>
              <v-card-title>Images</v-card-title>
              <v-card-text>
                <v-img
                  v-for="(item, index) in map_marker_details.image_url"
                  :key="index"
                  max-height="100"
                  max-width="200"
                  :src="item"
                ></v-img>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="historyDialog" width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Quest Marker History</span>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="historyDialog = false">
            Exit
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-timeline dense align-top>
            <v-timeline-item
              v-for="(item, index) in map_marker_details.history"
              :key="item._id"
              small
              fill-dot
              right
            >
              <v-alert
                :value="true"
                color="primary"
                icon="mdi-information"
                class="white--text"
              >
                <h3 class="text-h5">
                  {{ item.notes }}
                </h3>
                <div>Comments : {{ item.description }}</div>
                <v-divider></v-divider>
                <div>Submission Date : {{ item.createdon }}</div>
                <div>Verified By : {{ item.verifierid }}</div>
              </v-alert>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="editDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Quest Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="editDialog = false">
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <v-list three-line subheader>
            <v-subheader>Quest ID : {{ tempDetails.mid }}</v-subheader>
            <v-row>
              <v-col cols="6">
                <v-row>
                  <v-col cols="2">
                    <v-subheader>Title</v-subheader>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="tempDetails.title"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col></v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-row>
                  <v-col cols="2">
                    <v-subheader>Description</v-subheader>
                  </v-col>
                  <v-col cols="4">
                    <v-textarea
                      outlined
                      name="input-7-4"
                      label="Outlined textarea"
                      v-model="tempDetails.description"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-col>
              <v-col></v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-subheader>Tags</v-subheader>
                <v-row
                  v-for="(item, index) in tempDetails.tags"
                  :key="item._id"
                >
                  <v-col cols="3" outlined>
                    <v-text-field
                      label="Name"
                      outlined
                      dense
                      :value="item.k"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Value"
                      outlined
                      dense
                      :value="item.v"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-btn @click="removeTagItem(index)">
                      X
                    </v-btn>
                  </v-col>
                </v-row>
                <v-btn color="success" @click="addMapTags()">Add</v-btn>
              </v-col>
              <v-col>
                <v-row>
                  <v-col>
                    <div>
                      <l-map
                        :url="osmurl"
                        :zoom="zoomOption"
                        :center="tempDetails.marker_location"
                        style="z-index: 0; width:100%; height:300px"
                      ></l-map>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
const _ = require("lodash");
import { mapState } from "vuex";
export default {
  layout: "loggedin",
  middleware: "auth",
  mounted() {
    this.initializeMarkerDetails();
  },

  computed: {
    ...mapState({
      map_marker_details: state => state.map_marker_details
    })
  },
  created() {},
  methods: {
    checkUserSubmission(payload) {
      if (payload == this.$auth.user.aid || payload == null) {
        return "User Submission";
      } else {
        return payload;
      }
    },
    initializeMarkerDetails() {
      // if (_.isEmpty(this.map_marker_details)) {
      this.$store.dispatch("GET_MAP_MARKER_DETAILS", {
        mid: this.$route.params.id
      });
      // }
    },

    removeTagItem(index) {
      this.tempDetails.tags.splice(index, 1);
    },
    createTempDetailCopy() {
      this.tempDetails = _.cloneDeep(this.map_marker_details);
    },
    addMapTags() {
      this.tempDetails.tags.push({ k: "", v: "" });
    },
    toggleHistoryDialog() {
      if (this.historyDialog == true) {
        this.historyDialog = false;
      } else {
        this.historyDialog = true;
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
    saveMarkerEdit() {},
    extractMarkerLocation(payload) {
      let latLong = payload.marker_location;
      return latLong;
    },
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
    editMarkerDetails() {
      if (this.editDialog == true) {
        this.editDialog = false;
        this.tempDetails = {};
      } else {
        this.editDialog = true;
        this.createTempDetailCopy();
      }
    }
  },
  data() {
    return {
      editDialog: false,
      tempDetails: {},
      historyDialog: false,
      editStatus: false,
      newTags: [],
      page: {
        title: "Modify Quest"
      },
      breadcrumbs: [
        {
          text: "Home",
          disabled: false,
          href: "/"
        },
        {
          text: "Quest List",
          disabled: false,
          href: "/quests/"
        }
      ],
      mapLegend: [
        { title: "Verified", icon: "/marker-icon-2xx-green.png" },
        { title: "Not Verified", icon: "/marker-icon-2xx-orange.png" }
      ],
      mapFilters: [
        { title: "Verified" },
        { title: "Unverified" },
        { title: "Show All" }
      ],
      mapCenter: [],
      osmurl: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      zoomOption: 13
    };
  },
  watch: {}
};
</script>
<style scoped>
#map {
  z-index: 1;
}
</style>

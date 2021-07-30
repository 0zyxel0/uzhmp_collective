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
                <v-row>
                  <v-col> Options</v-col>
                  <v-spacer></v-spacer>
                  <v-col>
                    <v-btn
                      small
                      dense
                      color="primary"
                      @click="toggleHistoryDialog()"
                      >History</v-btn
                    >
                    <v-btn
                      small
                      dense
                      color="success"
                      @click="toggleSubmissionDialog()"
                      >Submit To OSM</v-btn
                    >
                  </v-col>
                </v-row>
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
                <v-card-text>
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
                  </v-chip></v-card-text
                >
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
                <v-row>
                  <v-col>
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
                  </v-col>
                </v-row>
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
                style="z-index: 0;height:500px"
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

    <v-dialog v-model="historyDialog" width="700px">
      <v-card>
        <v-card-title>
          <span class="text-h5">History</span>
        </v-card-title>
        <v-card-text>
          <v-timeline :dense="$vuetify.breakpoint.smAndDown">
            <v-timeline-item
              v-for="(item, index) in map_marker_details.history"
              :key="item._id"
              >{{ item }}</v-timeline-item
            >
          </v-timeline>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="historyDialog = false">
            Exit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="osmProgress" width="400px">
      <v-card>
        <v-card-title class="justify-center"
          >Data Upload in Progress</v-card-title
        >
        <v-card-text>
        

          <v-row class="justify-center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-row>
            <v-card-subtitle class="justify-center">
            Uploading Quest Marker Data to OSM Servers</v-card-subtitle
          >
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="osmDialog" width="1000px">
      <v-card>
        <v-card-title
          >Submit Marker Data To OSM<v-spacer></v-spacer
          ><v-btn small color="error" @click="toggleSubmissionDialog()">Close</v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>{{
                    osmSubmissionPayload.details.title
                  }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ osmSubmissionPayload.details.description }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-card-subtitle>Tags</v-card-subtitle>
              <v-card flat>
                <v-chip
                  v-for="item in osmSubmissionPayload.details.tags"
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
              </v-card>
              <v-divider> </v-divider>
              <v-card flat>
                <v-card-text>
                  <v-card-subtitle>Location</v-card-subtitle>
                  <l-map
                    :zoom="zoomOption"
                    :center="osmSubmissionPayload.details.marker_location"
                    style="z-index: 0;height:200px"
                    ref="osmMarkerDialog"
                  >
                    <l-tile-layer :url="osmurl"></l-tile-layer>

                    <l-marker
                      v-if="osmSubmissionPayload.details.marker_location"
                      :lat-lng="
                        extractMarkerLocation(osmSubmissionPayload.details)
                      "
                    >
                    </l-marker>
                  </l-map> </v-card-text
              ></v-card>
              <v-divider></v-divider>
              <v-card flat>
                <v-card-subtitle>Images</v-card-subtitle>
                <v-card-text>
                  <v-img
                    v-for="(item, index) in osmSubmissionPayload.details
                      .image_url"
                    :key="index"
                    max-height="100"
                    max-width="200"
                    :src="item"
                  ></v-img>
                </v-card-text>
              </v-card>
              <v-divider></v-divider>
              <v-card flat>
                <v-card-text>
                  <v-textarea
                    outlined
                    name="input-7-4"
                    label="Submission Comments"
                    v-model="osmSubmissionPayload.comments"
                    :rules="commentRules"
                    required
                  ></v-textarea>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="osmSubmissionPayload.comments.length > 0"
                    block
                    color="success"
                    @click="submitOSMPayload()"
                    >Submit To OSM</v-btn
                  >
                  <v-btn v-else block color="success" disabled
                    >Submit To OSM</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
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
    this.$store.dispatch("GET_OSM_ENVIRONMENT_STATUS");
    this.$store.dispatch("GET_MAP_MARKER_DETAILS", {
      mid: this.$route.params.id
    });
  },
  computed: {
    ...mapState({
      map_marker_details: state => state.map_marker_details,
      osmProgress: state => state.osmProgress,
      osmCurrentEnvironment : state => state.osmIsProduction
    })
  },
  methods: {
    submitOSMPayload() {      
      let payload = {
        mid: this.osmSubmissionPayload.details.mid,
        lat: this.osmSubmissionPayload.details.location.coordinates.lat,
        lon: this.osmSubmissionPayload.details.location.coordinates.long,
        nodeid: this.osmSubmissionPayload.details.nodeid,
        tags: this.osmSubmissionPayload.details.tags,
        comment: this.osmSubmissionPayload.comments,
        version: this.osmSubmissionPayload.details.version
      };
      console.log(this.osmCurrentEnvironment,this.osmProgress);
      if(this.osmCurrentEnvironment == true){
        console.log("Sending Payload to OSM Production");
        this.$store.dispatch("SUBMIT_PAYLOAD_TO_OSMPROD", payload);
      }else{
        console.log("Sending Payload to OSM Development");
        this.$store.dispatch("SUBMIT_PAYLOAD_TO_OSMDEV", payload);
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
    toggleSubmissionDialog() {
      if (this.osmDialog == true) {
        this.osmDialog = false;
        Object.assign({}, this.osmSubmissionPayload.details);
      } else {
        this.osmDialog = true;
        this.osmSubmissionPayload.details = _.cloneDeep(
          this.map_marker_details
        );
        setTimeout(() => {
          //mapObject is a property that is part of leaflet
          this.$refs.osmMarkerDialog.mapObject.invalidateSize();
        }, 100);
      }
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
      osmSubmissionPayload: {
        details: {},
        comments: ""
      },
      commentRules: [
        v => !!v || "Please Provide a Descriptive Change Message."
      ],
      osmDialog: false,
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

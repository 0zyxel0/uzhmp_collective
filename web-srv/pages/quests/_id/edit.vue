<template>
  <div class="questModifyPage">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            Editing Quests ID : {{ map_marker_details.mid }}
            <v-spacer></v-spacer>
            <div>
              <v-btn
                color="primary"
                small
                tile
                :to="`/quests/${map_marker_details.mid}`"
                >Cancel</v-btn
              >
              <v-btn color="success" small tile @click="saveMarkerEdit()"
                >Save</v-btn
              >
            </div>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-text-field
              v-model="tempDetails.title"
              label="Title"
              outlined
            ></v-text-field>
            <v-text-field
              v-model="tempDetails.subtitle"
              label="Subtitle"
              outlined
            ></v-text-field>
            <v-textarea
              outlined
              name="input-7-4"
              label="Description"
              v-model="tempDetails.description"
            ></v-textarea>
            <v-divider></v-divider>
            <v-card-subtitle>Tags</v-card-subtitle>
            <v-card-text>
              <v-row v-for="(item, index) in tempDetails.tags" :key="item._id">
                <v-col cols="3" outlined>
                  <v-text-field
                    label="Name"
                    outlined
                    dense
                    v-model="item.k"
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="Value"
                    outlined
                    dense
                    v-model="item.v"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-btn color="error" @click="removeTagItem(index)">
                    X
                  </v-btn></v-col
                >
              </v-row>
              <v-btn color="success" @click="addMapTags()">Add</v-btn>
            </v-card-text>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <l-map
          :zoom="zoomOption"
          :center="map_marker_details.marker_location"
          style="z-index: 0; height:300px"
        >
          <l-tile-layer :url="osmurl"></l-tile-layer>

          <l-marker
            v-for="item in possible_marker_list"
            :key="item._id"
            :lat-lng="extractMarkerLocation(item)"
          >
          </l-marker>
        </l-map>
        <v-card>
          <v-card-title>Markers Near </v-card-title>

          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Marker ID
                    </th>
                    <th class="text-left">
                      Title
                    </th>
                    <th class="text-left">
                      Verification Count
                    </th>
                    <th class="text-left">
                      Option
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in possible_marker_list"
                    :key="item._id"
                  >
                    <td>{{ item.mid }}</td>
                    <td>{{ item.title }}</td>
                    <td>{{ item.verifier_count }}</td>
                    <td>
                      <v-btn
                        tile
                        x-small
                        color="primary"
                        v-if="checkMarkerId(map_marker_details.mid, item.mid)"
                        @click="toggleMarkerDetails(index)"
                        >View</v-btn
                      >
                      <v-btn
                        tile
                        x-small
                        color="warning"
                        v-if="checkMarkerId(map_marker_details.mid, item.mid)"
                        @click="toggleMergeDialog(index)"
                        >Merge</v-btn
                      >
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col> </v-col>
      <v-col></v-col>
    </v-row>

    <!-- Merge Dialog Box -->
    <v-dialog v-model="viewMergeDialog">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col
              ><v-row>
                <v-col>
                  <v-card flat>
                    <v-card-title> Main Quest</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <l-map
                            :zoom="zoomOption"
                            :center="mergingData.original.marker_location"
                            style="z-index: 0; height:200px;"
                            ref="MarkerOriginal"
                          >
                            <l-tile-layer :url="osmurl"></l-tile-layer>
                            <l-marker
                              v-if="mergingData.original.marker_location"
                              :lat-lng="
                                extractMarkerLocation(mergingData.original)
                              "
                            >
                            </l-marker>
                          </l-map>
                        </v-col>
                      </v-row>
                      <v-divider></v-divider>
                      <v-row>
                        <v-col>
                          <v-card flat>
                            <v-card-text>
                              <v-card-subtitle>Details</v-card-subtitle>
                              <v-list-item three-line>
                                <v-list-item-content>
                                  <v-list-item-title>{{
                                    mergingData.original.title
                                  }}</v-list-item-title>
                                  <v-list-item-subtitle>
                                    {{
                                      mergingData.original.subtitle
                                    }}</v-list-item-subtitle
                                  >

                                  <v-list-item-subtitle>
                                    {{
                                      mergingData.original.description
                                    }}</v-list-item-subtitle
                                  >
                                </v-list-item-content>
                              </v-list-item>
                              <v-divider></v-divider>
                              <v-card-subtitle>Tags</v-card-subtitle>
                              <v-chip
                                v-for="item in mergingData.original.tags"
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
                              <v-divider></v-divider>
                              <v-card-subtitle
                                >Verification Count</v-card-subtitle
                              >
                              <v-divider></v-divider>
                              <v-card-subtitle>Images</v-card-subtitle>
                              <v-img
                                v-for="(item, index) in mergingData.original
                                  .image_url"
                                :key="index"
                                max-height="100"
                                max-width="200"
                                :src="item"
                              ></v-img>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col
              ><v-row>
                <v-col>
                  <v-card flat>
                    <v-card-title> To Merge</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <l-map
                            :zoom="zoomOption"
                            :center="mergingData.merging.marker_location"
                            style="z-index: 0; height:200px;"
                            ref="MarkerToMerge"
                          >
                            <l-tile-layer :url="osmurl"></l-tile-layer>
                            <l-marker
                              v-if="mergingData.merging.marker_location"
                              :lat-lng="
                                extractMarkerLocation(mergingData.merging)
                              "
                            >
                            </l-marker>
                          </l-map>
                        </v-col>
                      </v-row>
                      <v-divider></v-divider>
                      <v-row>
                        <v-col>
                          <v-card flat>
                            <v-card-text>
                              <v-card-subtitle>Details</v-card-subtitle>
                              <v-list-item three-line>
                                <v-list-item-content>
                                  <v-list-item-title>{{
                                    mergingData.merging.title
                                  }}</v-list-item-title>
                                  <v-list-item-subtitle>
                                    {{
                                      mergingData.merging.subtitle
                                    }}</v-list-item-subtitle
                                  >

                                  <v-list-item-subtitle>
                                    {{
                                      mergingData.merging.description
                                    }}</v-list-item-subtitle
                                  >
                                </v-list-item-content>
                              </v-list-item>
                              <v-divider></v-divider>
                              <v-card-subtitle>Tags</v-card-subtitle>
                              <v-chip
                                v-for="item in mergingData.merging.tags"
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
                              <v-divider></v-divider>
                              <v-card-subtitle
                                >Verification Count</v-card-subtitle
                              >
                              <v-divider></v-divider>
                              <v-card-subtitle>Images</v-card-subtitle>
                              <v-img
                                v-for="(item, index) in mergingData.merging
                                  .image_url"
                                :key="index"
                                max-height="100"
                                max-width="200"
                                :src="item"
                              ></v-img>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col
              ><v-row>
                <v-col>
                  <v-card flat>
                    <v-card-title> Outcome</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <l-map
                            :zoom="zoomOption"
                            :center="mergingData.merging.marker_location"
                            style="z-index: 0; height:200px;"
                            ref="MarkerOutcome"
                          >
                            <l-tile-layer :url="osmurl"></l-tile-layer>
                            <l-marker
                              v-if="mergingData.original.marker_location"
                              :lat-lng="
                                extractMarkerLocation(mergingData.original)
                              "
                            >
                            </l-marker>
                          </l-map>
                        </v-col>
                      </v-row>
                      <v-divider></v-divider>
                      <v-row>
                        <v-col>
                          <v-card flat>
                            <v-card-text>
                              <v-card-subtitle>Details</v-card-subtitle>
                              <v-list-item three-line>
                                <v-list-item-content>
                                  <v-list-item-title>{{
                                    mergingData.original.title
                                  }}</v-list-item-title>
                                  <v-list-item-subtitle>
                                    {{
                                      mergingData.original.subtitle
                                    }}</v-list-item-subtitle
                                  >

                                  <v-list-item-subtitle>
                                    {{
                                      mergingData.original.description
                                    }}</v-list-item-subtitle
                                  >
                                </v-list-item-content>
                              </v-list-item>
                              <v-divider></v-divider>
                              <v-card-subtitle>Tags</v-card-subtitle>

                              <v-chip
                                v-for="item in mergingData.outcome.tags"
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
                              <v-divider></v-divider>
                              <v-card-subtitle
                                >Verification Count</v-card-subtitle
                              >
                              <v-divider></v-divider>
                              <v-card-subtitle>Images</v-card-subtitle>
                              <v-img
                                v-for="(item, index) in mergingData.outcome
                                  .image_url"
                                :key="index"
                                max-height="100"
                                max-width="200"
                                :src="item"
                              ></v-img>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row>
            <v-col>
              <v-btn color="warning" block @click="toggleMergeReply()"
                >Merge</v-btn
              >
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- View Possible Duplicate Marker Dialog Box -->
    <v-dialog v-model="viewMarkerDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Quest ID : {{ tempDataDialog.mid }} <v-spacer></v-spacer>
          <v-btn @click="toggleMarkerDetails(tempDataDialog.mid)">Close</v-btn>
        </v-card-title>
        <v-card-text>
          <div id="dialogMarkerViewer">
            <l-map
              :zoom="zoomOption"
              :center="tempDataDialog.marker_location"
              style="z-index: 0; height:300px;"
              ref="MarkerDialogMap"
            >
              <l-tile-layer :url="osmurl"></l-tile-layer>
              <l-marker
                v-if="tempDataDialog.marker_location"
                :lat-lng="extractMarkerLocation(tempDataDialog)"
              >
              </l-marker>
            </l-map>
          </div>
          <v-divider></v-divider>
          <v-card-subtitle>Details</v-card-subtitle>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>{{ tempDataDialog.title }}</v-list-item-title>
              <v-list-item-subtitle>{{
                tempDataDialog.description
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-card-subtitle>Tags</v-card-subtitle>
          <v-chip
            v-for="item in tempDataDialog.tags"
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
          <v-divider></v-divider>
          <v-card-subtitle>Images</v-card-subtitle>
          <v-img
            v-for="(item, index) in tempDataDialog.image_url"
            :key="index"
            max-height="100"
            max-width="200"
            :src="item"
          ></v-img>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Merge Save Pop Up Box -->
    <v-dialog v-model="mergeFinalReply" width="500">
      <!-- <template v-slot:activator="{ on, attrs }">
        <v-btn color="red lighten-2" dark v-bind="attrs" v-on="on">
          Click Me
        </v-btn>
      </template> -->

      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Merge Markers
        </v-card-title>

        <v-card-text>
          Are you sure you want to Merge the Map Markers? This action cannot be
          undone.
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="finalizeMerging()">
            Merge Markers
          </v-btn>
          <v-btn color="primary" text @click="mergeFinalReply = false">
            Cancel
          </v-btn>
        </v-card-actions>
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
    this.initialize();
  },

  computed: {
    ...mapState({
      map_marker_details: state => state.map_marker_details,
      possible_marker_list: state => state.possible_marker_list
    })
  },
  created() {},
  methods: {
    initialize() {
      this.$store.dispatch("GET_MAP_MARKER_DETAILS", {
        mid: this.$route.params.id
      });
    },
    checkMarkerId(original, payload) {
      if (payload != original) {
        return true;
      }
      return false;
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
    saveMarkerEdit() {
      this.$store.dispatch("UPDATE_MARKER_DETAILS", this.tempDetails);
      this.$router.push(`/quests/${this.tempDetails.mid}`);
    },
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
    toggleMarkerDetails(payload) {
      if (this.viewMarkerDialog == true) {
        this.viewMarkerDialog = false;
        // Delete Contents
        this.tempDataDialog = {};
      } else {
        this.viewMarkerDialog = true;
        this.tempDataDialog = _.cloneDeep(this.possible_marker_list[payload]);
        // Reset Vue Leaflet Window for map reload Hack
        setTimeout(() => {
          //mapObject is a property that is part of leaflet
          this.$refs.MarkerDialogMap.mapObject.invalidateSize();
        }, 100);
      }
    },
    finalizeMerging() {
      this.$store.dispatch("DEACTIVATE_MARKER",{
        mid:this.mergingData.merging.mid,
        isActive:false
      });
      this.$store.dispatch("UPDATE_MARKER_DETAILS",this.mergingData.outcome)

      this.mergeFinalReply = false;
      this.viewMergeDialog = false;

    },
    toggleMergeDialog(payload) {
      if (this.viewMergeDialog == true) {
        this.viewMergeDialog = false;
      } else {
        this.viewMergeDialog = true;
        this.mergingData.original = _.cloneDeep(this.tempDetails);
        this.mergingData.merging = _.cloneDeep(
          this.possible_marker_list[payload]
        );

        this.combineOutcomeData(
          this.mergingData.original,
          this.mergingData.merging
        );

        setTimeout(() => {
          //mapObject is a property that is part of leaflet
          this.$refs.MarkerOriginal.mapObject.invalidateSize();
          this.$refs.MarkerToMerge.mapObject.invalidateSize();
          this.$refs.MarkerOutcome.mapObject.invalidateSize();
        }, 100);
      }
    },

    combineOutcomeData(original, duplicated) {
      function copyTagData(tagValue) {
        return tempTagStorage.push(tagValue);
      }

      function copyImageData(imageValue) {
        return tempImageStorage.push(imageValue);
      }

      let tempTagStorage = [];
      let tempVerifiedCount =
        parseInt(original.verifier_count) + parseInt(duplicated.verifier_count);
      let tempImageStorage = [];
      let original_tags = original.tags;
      let duplicated_tags = duplicated.tags;

      let original_image = original.image_url;
      let duplicated_image = duplicated.image_url;

      // Loop over the list
      original_tags.forEach(copyTagData);
      duplicated_tags.forEach(copyTagData);

      original_image.forEach(copyImageData);
      duplicated_image.forEach(copyImageData);

      // copy details from original
      this.mergingData.outcome.mid = original.mid;
      this.mergingData.outcome.title = original.title;
      this.mergingData.outcome.subtitle = original.subtitle;
      this.mergingData.outcome.description = original.description;
      this.mergingData.outcome.image_url = _.cloneDeep(tempImageStorage);
      this.mergingData.outcome.tags = _.cloneDeep(tempTagStorage);
      this.mergingData.outcome.verifier_count = tempVerifiedCount;
    },

    toggleMergeReply() {
      if (this.mergeFinalReply == true) {
        this.mergeFinalReply = false;
      } else {
        this.mergeFinalReply = true;
      }
    }
  },
  data() {
    return {
      mergeFinalReply: false,
      mergingData: {
        original: {},
        merging: {},
        outcome: {}
      },
      viewMergeDialog: false,
      viewMarkerDialog: false,
      tempDataDialog: {},
      tempDetails: {},
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
      zoomOption: 18
    };
  },
  watch: {
    map_marker_details() {
      this.createTempDetailCopy();
      this.$store.dispatch("GET_POSSIBLE_MARKER_DUPLICATES", {
        lat: this.map_marker_details.location.coordinates.lat,
        long: this.map_marker_details.location.coordinates.long
      });
    }
  }
};
</script>
<style scoped>
#map {
  z-index: 1;
}
</style>

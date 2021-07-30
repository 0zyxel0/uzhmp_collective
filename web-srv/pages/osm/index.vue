<template>
  <div class="osmReadyPage">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            Quests
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="verified_marker_list"
            :search="search"
            :loading="loadingBar"
          >
            <template slot="item.options" slot-scope="{ item }">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    v-bind="attrs"
                    v-on="on"
                    tile
                    x-small
                    :to="`/osm/${item.mid}`"
                  >
                    <v-icon x-small left>mdi-open-in-new</v-icon>
                    View
                  </v-btn>
                </template>
                <span>View Profile</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="accent"
                    v-bind="attrs"
                    v-on="on"
                    tile
                    x-small
                    dark
                    @click="deleteUserDialog(item)"
                  >
                    <v-icon x-small left>mdi-delete</v-icon>
                    Delete
                  </v-btn>
                </template>
                <span>Delete Machine</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  layout: "default",
  middleware: "auth",
  mounted() {
    this.$store.dispatch("GET_VERIFIED_MAP_MARKERS");
  },
  
  computed: {
    ...mapState({
      verified_marker_list: state => state.verified_marker_list
    })
  },
  data() {
    return {
      search: "",
      loadingBar: true,
      headers: [
        {
          text: "Title",
          align: "start",
          value: "title"
        },
        { text: "Description", value: "description" },
        { text: "Verifiers", value: "verifier_count" },
        { text: "Created By", value: "updatedby" },
        { text: "Option", value: "options" }
      ],
      page: {
        title: "OSM Ready List"
      },
      breadcrumbs: [
        {
          text: "Home",
          disabled: false,
          href: "/"
        },
        {
          text: "OSM Ready List",
          disabled: false,
          href: "/osm/"
        }
      ]
    };
  },
  watch: {
    verified_marker_list(){
      this.loadingBar=false;
    }
  }
};
</script>

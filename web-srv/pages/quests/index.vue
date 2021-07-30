<template>
  <div class="questPage">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
      <v-col>
        <h3>
          <v-icon left>mdi-format-list-bulleted-square</v-icon> Quests List
        </h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            <!-- <v-menu
              v-model="questMenu"
              :close-on-content-click="false"
              :nudge-width="200"
              offset-x
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark v-bind="attrs" v-on="on">
                  Options
                </v-btn>
              </template>

              <v-card>
                <v-card-title>Table Options</v-card-title>
                <v-divider></v-divider>
                <v-list>
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="allQuest" color="primary"></v-switch>
                    </v-list-item-action>
                    <v-list-item-title>Show All Quests</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                        v-model="activeQuest"
                        color="primary"
                      ></v-switch>
                    </v-list-item-action>
                    <v-list-item-title
                      >Show Only Active Quests</v-list-item-title
                    >
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-action>
                      <v-switch
                        v-model="inactiveQuest"
                        color="primary"
                      ></v-switch>
                    </v-list-item-action>
                    <v-list-item-title
                      >Show Only Inactive Quests</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu> -->

            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="marker_list"
              :search="search"
              :loading="loadingBar"
            >
              <template slot="item.isActive" slot-scope="{ item }">

                <v-chip v-if="item.isActive == true" class="ma-2" color="green" text-color="white">
                  Active
                </v-chip>
                <v-chip v-else class="ma-2" color="red" text-color="white">
                  Disabled
                </v-chip>
              </template>

              <template slot="item.options" slot-scope="{ item }">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      v-bind="attrs"
                      v-on="on"
                      tile
                      x-small
                      :to="`/quests/${item.mid}`"
                      style="width:80px;"
                    >
                      <v-icon x-small left>mdi-open-in-new</v-icon>
                      View
                    </v-btn>
                  </template>
                  <span>View Details</span>
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
                      style="width:80px;"
                    >
                      <v-icon x-small left>mdi-delete</v-icon>
                      Delete
                    </v-btn>
                  </template>
                  <span>Delete Marker</span>
                </v-tooltip>
              </template>
            </v-data-table>
          </v-card-text>
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
    this.$store.dispatch("GET_MAP_MARKERS");
  },

  computed: {
    ...mapState({
      marker_list: state => state.marker_list
    })
  },
  data() {
    return {
      questMenu: false,
      allQuest: false,
      activeQuest: true,
      inactiveQuest: false,
      viewAllQuest: false,
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
        { text: "Status", value: "isActive" },
        { text: "Option", value: "options" }
      ],
      page: {
        title: "Quest List"
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
      ]
    };
  },
  watch: {
    marker_list() {
      this.loadingBar = false;
    }
  }
};
</script>

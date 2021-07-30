<template>
  <div class="osmEditor">
  <iframe src="https://www.openstreetmap.org/"></iframe>
  </div>
</template>
<script>
export default {
  middleware: "auth",
  data() {
    return {
      myIframe: null
    };
  },
  methods: {
    onLoad(frame) {
      this.myIframe = frame.contentWindow;
    }
  }
};
</script>

<style></style>

<template>
  <div class="popup" ref="popup">
    <div class="popup__overlay" @click="popupClosed($event)" />
    <div
      ref="popupWrapper"
      class="popup__wrapper"
      :class="{'popup__wrapper--disabled' : adjustmentX || adjustmentY}"
      :style="{left: `calc(50% + ${adjustmentX || 0}px)`, top: `calc(50% + ${adjustmentY || 0}px)`}"
    >
      <slot name="popup-content"></slot>
    </div>
  </div>
</template>

<script>
import { isTouchDevice } from "../common";
const OFFSET = 16; // using offset so the popup doesnt appear sticked to the edge
const WATERTANK_WRAPPER_HEIGHT = 90;
export default {
  name: "PopupDialog",
  data() {
    return { adjustmentY: null, adjustmentX: null };
  },
  mounted() {
    // getting the device dependant width and height values
    const touchDevice = isTouchDevice();
    const windowWidth = touchDevice ? window.outerWidth : window.innerWidth;
    const windowHeight = touchDevice ? window.outerHeight : window.innerHeight;

    // repositioning the popup dialog
    const popup = this.$refs.popup;
    const popupWrapper = this.$refs.popupWrapper;
    const popupRect = popupWrapper.getBoundingClientRect();
    const parentRect = popup.parentNode.getBoundingClientRect();
    const differenceY =
      windowHeight -
      parentRect.top -
      popupRect.height -
      WATERTANK_WRAPPER_HEIGHT / 2 -
      OFFSET;
    this.adjustmentY = differenceY < 0 ? differenceY : null;
    const differenceX = windowWidth - popupRect.right;
    this.adjustmentX =
      differenceX < 0
        ? differenceX - OFFSET
        : popupRect.left < 0
        ? -(popupRect.left - 5)
        : null;
  },
  methods: {
    popupClosed(event) {
      event.stopPropagation();
      this.$emit("popupClosed");
    }
  }
};
</script>


<style>
.popup__overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: auto;
  cursor: auto;
}

.popup__wrapper {
  padding: 16px 20px;
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 8px);
  border: solid 1px #00000060;
  z-index: 1000;
  min-width: 260px;
  box-shadow: 0px 0px 1px 0px #00000020;
  -ms-box-shadow: 0px 0px 1px 0px #00000020;
  border-radius: 2px;
  cursor: auto;
}

.popup__wrapper::before {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  transform: rotateZ(45deg) translateX(-50%);
  top: -3px;
  display: block;
  left: 50%;
  background-color: white;
  border-left: solid 1.5px #00000060;
  border-top: solid 1.5px #00000060;
}

.popup__wrapper--disabled::before {
  content: none; /* hide ::before when popup is adjusted in a viewport */
}
</style>

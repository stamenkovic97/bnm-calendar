<template>
  <td
    class="wt-wrapper parent-center"
    :class="{'wt-wrapper--selected': selected, 'wt-wrapper--not-available': actualTotal === 0}"
    @click="slotSelected"
  >
    <div
      v-show="custom"
      :title="custom > 0
    ? 'This shift has been reduced'
    : 'Shift disabled for this date by the clinic'"
      class="wt-wrapper__edit-pencil"
    >
      <i class="far fa-edit" />
    </div>
    <div
      class="wt-wrapper__water-tank parent-center"
      :class="{'wt-wrapper__water-tank--washed-out': booked ===0,
        'wt-wrapper__water-tank__description--not-available': actualTotal === 0}"
    >
      <div
        class="wt-wrapper__water-tank__description"
        :class="{'wt-wrapper__water-tank__description--washed-out': booked === 0}"
      >{{booked}}/{{actualTotal}}</div>
      <div
        class="wt-wrapper__water-tank__filled"
        :style="isIE ? {transform: `translate(0, ${percentEmpty})`} : {transform: `translate3d(0, ${percentEmpty}, 0)`}"
      />
      <!-- using translate over translate3d to get it working in ie9 -->
    </div>
    <slot name="watertank-popup"></slot>
  </td>
</template>

<script>
import { isIE } from "../common";
export default {
  name: "WaterTank",
  data() {
    return {
      isIE: isIE()
    };
  },
  props: {
    booked: {
      default: 0,
      required: true,
      type: Number
    },
    total: {
      default: 0,
      required: true,
      type: Number
    },
    custom: {
      default: null,
      required: true
    },
    selected: Boolean
  },
  computed: {
    percentEmpty() {
      if (this.actualTotal === 0) {
        return "100%";
      }

      return `${100 - (this.booked / this.actualTotal) * 100}%`;
    },
    actualTotal() {
      return this.custom !== null ? +this.custom : this.total; // for some reason custom is a string so we convert it to the number
    }
  },
  methods: {
    slotSelected() {
      this.$emit("slotSelected");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.parent-center {
  align-items: center;
}

.wt-wrapper {
  border-collapse: collapse;
  width: 140px;
  height: 90px;
  cursor: pointer;
  position: relative;
}

.wt-wrapper:hover {
  background-color: #f4f1f3;
}

.wt-wrapper--selected {
  background-color: #e1e1e1 !important;
}

.wt-wrapper--not-available {
  cursor: auto;
}

.wt-wrapper__edit-pencil {
  position: absolute;
  right: 6px;
  top: 6px;
  color: #e83d4d;
}

.wt-wrapper__water-tank {
  border: solid 1px #4d6b89;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  background-color: white;
}

.wt-wrapper__water-tank--washed-out {
  border-color: #e4e5e6;
}

.wt-wrapper__water-tank__description--not-available {
  border-color: #f39da5;
}

.wt-wrapper__water-tank__description {
  font-weight: bold;
  color: #393d41;
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wt-wrapper__water-tank__description--washed-out {
  color: #a9aaac;
}

.wt-wrapper__water-tank__filled {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #bdc8d3;
  -ms-transform: translate(0, -100%);
  transform: translate3d(0, -100%, 0);
  transition: transform ease-in-out 300ms;
}

@media all and (max-width: 767px) {
  .wt-wrapper {
    width: unset;
  }

  .wt-wrapper__water-tank {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

@media all and (max-width: 572px) {
  .wt-wrapper {
    width: calc(100% - 3px); /* 3px = 1px padding * 2 + 0.5px border * 2 */
  }

  .wt-wrapper__water-tank {
    width: 48px;
    height: 48px;
  }
}
</style>

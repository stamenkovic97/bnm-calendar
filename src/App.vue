<template>
  <div ref="forPrint" id="app">
    <div>
      <div class="date">
        <div class="date__elem date__elem--left">
          <button @click="gotoPreviousWeek" class="date__elem__button date__elem__button--previous">
            <i
              class="fas fa-chevron-left date__elem__button--previous__arrow date__elem__button__arrow"
            />
            <span class="date__elem__button__text">Previous</span>
          </button>
        </div>
        <div class="date__elem">
          <h2 class="date__title">{{dateTitle}}</h2>
          <div @click="printWeek" class="date__elem__print">Print weekly calendar</div>
        </div>
        <div class="date__elem date__elem--right">
          <button
            @click="gotoNextWeek"
            class="date__elem__button date__elem__button date__elem__button--next"
          >
            <span class="date__elem__button__text">Next</span>
            <i
              class="fas fa-chevron-right date__elem__button--next__arrow date__elem__button__arrow"
            />
          </button>
        </div>
      </div>
      <table class="calendar">
        <tbody>
          <tr class="calendar__row calendar-row--header">
            <th class="calendar__header calendar__header--shift" />
            <th
              class="calendar__header calendar__header--date"
              v-for="date in dateHeaders"
              :key="date "
            >
              <h4 class="calendar__header__title calendar__header--date__title">{{date}}</h4>
            </th>
          </tr>

          <tr class="calendar__row" v-for="shift in shifts" :key="shift.name + ' shift'">
            <th class="calendar__header calendar__header--shift">
              <h4 class="calendar__header__title">
                <span class="calendar__header--shift__name">{{shift.name}}</span>
                <br />shift
              </h4>
            </th>
            <WaterTank
              v-for="(item, index) in shift.availability"
              @slotSelected="onSlotSelected(item)"
              :selected="item === selectedSlot"
              :booked="item.booked"
              :total="item.total"
              :custom="item.custom"
              :key="index"
            >
              <PopupDialog
                @popupClosed="selectedSlot = null; editError = null"
                v-if="item === selectedSlot"
                slot="watertank-popup"
              >
                <div slot="popup-content">
                  <h4 class="popup__wrapper__title">Change availability</h4>
                  <div class="popup__wrapper__description">
                    <div class="popup__wrapper__description__elem">
                      <div class="popup__wrapper__description__title">Shift</div>
                      {{shift.name}}
                    </div>
                    <div class="popup__wrapper__description__elem">
                      <div class="popup__wrapper__description__title">Date</div>
                      {{parseDate(item.date)}}
                    </div>
                  </div>
                  <hr />
                  <div class="popup__wrapper__slot">
                    <div class="popup__wrapper__slot__label">Slots</div>
                    <NumberInput
                      :initialValue="item.custom !== null ? +item.custom : item.total"
                      :maxValue="item.custom !== null ? +item.custom : item.total"
                      :minValue="item.booked"
                      :maxLength="2"
                      @errored="editError = $event"
                      @succeeded="editError = null"
                      @change="editValue = $event"
                      class="popup__wrapper__slot__input"
                    />
                  </div>
                  <div class="popup__wrapper__warning">
                    <i
                      :class="`popup__wrapper__icon--warning
                      ${editError
                      ? 'fas fa-exclamation-circle popup__wrapper__icon--error'
                      : 'fas fa-info-circle'}`"
                    ></i>
                    <div
                      class="popup__wrapper__warning__elem popup__wrapper__warning__text"
                    >{{editError ? editError : 'Number of slots can only be decreased.'}}</div>
                  </div>
                  <hr />
                  <div class="popup__actions">
                    <!-- have to stop propagating the click event to prevent parent handler from executing -->
                    <button
                      @click="$event.stopPropagation(); selectedSlot = null"
                      class="popup__actions__button popup__actions__button--neutral"
                    >Cancel</button>
                    <button
                      @click="$event.stopPropagation(); editSlot(item, shift.name)"
                      :disabled="editError"
                      class="popup__actions__button popup__actions__button--positive"
                    >Apply</button>
                  </div>
                </div>
              </PopupDialog>
            </WaterTank>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {
  MONTHS,
  WEEKDAYS,
  DATE_UPPER_LIMIT,
  DATE_LOWER_LIMIT
} from "./constants";
import { isIE } from "./common";
import NumberInput from "./components/NumberInput.vue";
import WaterTank from "./components/WaterTank.vue";
import PopupDialog from "./components/PopupDialog.vue";
import AvailabilityService from "./services/AvailabilityService";

export default {
  name: "app",
  created() {
    this.initData();
  },
  data() {
    return {
      fetchingData: true,
      currentWeek: null,
      currentDate: null,
      selectedSlot: null,
      editError: null,
      editValue: null
    };
  },
  components: {
    WaterTank,
    PopupDialog,
    NumberInput
  },
  computed: {
    dateTitle() {
      return `${
        MONTHS[this.currentDate.getMonth()]
      } ${this.currentDate.getFullYear()}`;
    },
    dateHeaders() {
      if (!this.currentWeek) return [];
      return this.currentWeek
        .map(day => day.date)
        .map(dateString => {
          const date = new Date(dateString);
          return `${WEEKDAYS[date.getDay()].slice(0, 3)}, ${date.getDate()}`;
        });
    },
    shifts() {
      if (!this.currentWeek) return [];
      const shifts = Object.keys(this.currentWeek[0].info).map(
        (shift, ind) => ({
          name: shift,
          availability: this.currentWeek
            .map(day => day.info)
            .map((info, avInd) => ({
              ...Object.keys(info).map(key => info[key])[ind],
              date: this.currentWeek[avInd].date
              // id: this.generateIdForSlot() // generating tmp id to avoid problems with references
            }))
        })
      );
      return shifts;
    },
    firstDayInWeek() {
      return this.currentWeek.map(day => day.date)[0];
    },
    lastDayInWeek() {
      const dates = this.currentWeek.map(day => day.date);
      return dates[dates.length - 1];
    }
  },
  methods: {
    async getCurrentWeekByDate(dateString) {
      this.fetchingData = true;
      try {
        this.currentWeek = await AvailabilityService.getAvailabilityForDate(
          dateString
        );
      } catch (error) {
        // error handling for request
        alert("Could not connect to the server try refreshing your page.");
      }

      // this.dateNames[ind] = `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
      this.numberOfShifts = Object.keys(this.currentWeek[0].info);
      this.fetchingData = false;
    },
    initData() {
      this.currentDate = new Date();
      const todayString = this.currentDate.toISOString().slice(0, 10);
      this.getCurrentWeekByDate(todayString);
    },

    gotoPreviousWeek() {
      if (this.firstDayInWeek === DATE_LOWER_LIMIT) {
        alert("There are no more previous weeks");
        return;
      }
      const firstDayDate = new Date(this.firstDayInWeek);
      this.currentDate = new Date(
        firstDayDate.setDate(firstDayDate.getDate() - 1)
      );
      this.getCurrentWeekByDate(this.currentDate.toISOString().slice(0, 10));
    },
    gotoNextWeek() {
      if (this.lastDayInWeek === DATE_UPPER_LIMIT) {
        alert("There are no more weeks in the future");
        return;
      }
      const lastDay = new Date(this.lastDayInWeek);
      lastDay.setDate(lastDay.getDate() + 1);
      lastDay.setHours(23); // to ensure getting the next day
      this.currentDate = new Date(lastDay.getTime());
      this.getCurrentWeekByDate(this.currentDate.toISOString().slice(0, 10));
    },
    parseDate(dateString) {
      const date = new Date(dateString);
      return `${
        MONTHS[date.getMonth()]
      } ${date.getDate()}, ${date.getFullYear()}`;
    },
    onSlotSelected(slot) {
      if (+slot.custom || (slot.custom === null && slot.total)) {
        // again we convert 'custom' to a number
        this.editValue = slot.total; // init edit value
        this.selectedSlot = slot;
      }
    },
    async editSlot(slot, shift) {
      if (slot.total === this.editValue) {
        // if value is not changed dont send request
        this.selectedSlot = null;
        return;
      }

      const result = await AvailabilityService.setAvailability(
        slot.date,
        shift,
        this.editValue
      );

      this.shifts // find slot in the shifts object and update it
        .find(sh => sh.name === shift)
        .availability.find(sl => sl.date === slot.date).custom = result.custom;
      this.selectedSlot = null;
    },
    generateIdForSlot() {
      return Math.random()
        .toString(36)
        .substring(2, 15);
    },
    printWeek() {
      // opening new window so i cant remove elements there
      const newWindow = window.open(
        isIE() ? "Print" : "", // for some reason the ie browsers work with url
        "_blank",
        "left: 20px, top: 20px, width = 1000px, height = 800px",
        false
      );
      // elements i throw out
      const elementSelectors = [
        ".date__elem__print",
        ".date__elem__button",
        ".wt-wrapper__edit-pencil"
      ];

      const docEl = window.document.documentElement.cloneNode(true);
      elementSelectors.forEach(selector => {
        Array.from(docEl.querySelectorAll(selector)).forEach(node =>
          node.parentNode.removeChild(node)
        );
      });

      newWindow.frames.document.body.innerHTML = docEl.innerHTML;
      newWindow.frames.focus();
      newWindow.frames.print();
      newWindow.frames.close();
    }
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Nunito+Sans:300,400,600,700&display=swap");

html,
body {
  margin: 0;
}
#app {
  font-family: "Nunito Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 32px 0;
  padding: 0 16px;
  position: relative;
}

hr {
  border-style: solid;
  color: #00000020;
}

.date__title {
  margin-top: 0;
  margin-bottom: 6px;
}

.calendar {
  margin: 0 auto;
}

.calendar__header {
  border: 1px solid transparent;
}

.calendar__header--date {
  border-bottom: none;
}

.calendar__header__title {
  font-weight: 400;
}

.calendar__header--shift {
  border-right: none;
  text-align: left;
  width: 100px;
}

.calendar__header--shift__name {
  text-transform: capitalize;
}

.calendar,
.wt-wrapper {
  border: solid 1px #e3e3e3;
  border-collapse: collapse;
}

.date {
  display: table;
  width: 700px;
  margin: 0 auto 60px;
  text-align: center;
}

.date__elem {
  display: table-cell;
  vertical-align: middle;
}

.date__elem__print {
  color: #5495c4;
  font-weight: 600;
  cursor: pointer;
}

.date__elem__print:hover {
  text-decoration: underline;
}

.date__elem__button {
  background-color: #5495c4;
  color: white;
  border: none;
  border-radius: 3px;
  font-family: "Nunito Sans", sans-serif;
  font-size: 15px;
  padding: 10px 20px;
  width: 130px;
  cursor: pointer;
  position: relative;
}

.date__elem__button__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.date__elem__button--previous {
  text-align: right;
}

.date__elem__button--next {
  text-align: left;
}

.date__elem__button--previous__arrow {
  left: 20px;
}

.date__elem__button--next__arrow {
  right: 20px;
}

.popup__wrapper__title {
  margin-top: 0;
  font-size: 18px;
  margin-bottom: 16px;
}

.popup__wrapper__description {
  margin-bottom: 16px;
}

.popup__wrapper__description__elem {
  display: inline-block;
  width: 50%;
  text-transform: capitalize;
}

.popup__wrapper__description__title {
  color: #878f97;
}

.popup__wrapper__slot {
  margin: 32px 0;
}

.popup__wrapper__slot__label {
  display: inline-block;
}

.popup__wrapper__slot__input {
  float: right;
}

.popup__wrapper__warning {
  position: relative;
  margin-bottom: 16px;
}

.popup__wrapper__icon--warning {
  color: #f8af43;
  position: absolute;
  top: 0;
  left: 0;
}

.popup__wrapper__icon--error {
  color: red;
}

.popup__wrapper__warning__elem {
  font-size: 14px;
}

.popup__wrapper__warning__text {
  margin-left: 30px; /* icon 14px + standard margin left 16px*/
  font-weight: 600;
}

.popup__actions {
  text-align: right;
  margin-top: 16px;
}

.popup__actions__button {
  width: 45%;
  max-width: 120px;
  font-family: "Nunito Sans", sans-serif;
  border: none;
  border-radius: 2px;
  padding: 5px 0;
  font-weight: bold;
  cursor: pointer;
}

.popup__actions__button:focus {
  outline: none;
}

.popup__actions__button--neutral {
  margin-right: 10%;
  background-color: #ededed;
  color: #152635;
}

.popup__actions__button--positive {
  background-color: #e83d4d;
  color: white;
}

.popup__actions__button--positive:disabled {
  color: #80808090;
  background-color: #80808020;
  cursor: unset;
}

/* chrome && safari experimental */
@media print {
  * {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
}

@media all and (max-width: 767px) {
  .calendar__header__title {
    margin: auto;
    text-align: center;
  }

  .calendar__header--shift {
    width: calc(100% - 3px); /* to match the watertank width */
    height: 42px;
  }

  .calendar__header--date {
    height: 90px;
    position: relative;
  }

  .calendar__header--date__title {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    text-align: left;
  }

  .calendar__row {
    display: table-cell;
    width: 20%;
  }

  .calendar__row--header {
    width: 14%;
    padding-right: 10px;
  }

  .calendar {
    width: 100%;
    border: none;
  }
  .calendar__row > * {
    display: block;
  }

  .wt-wrapper {
    border: solid 0.5px #e3e3e3a0;
  }

  .date {
    box-sizing: border-box;
    width: 100%;
  }

  .date__elem--left {
    text-align: left;
  }

  .date__elem--right {
    text-align: right;
  }
}

@media all and (max-width: 572px) {
  .date__elem__button__text {
    display: none;
  }

  .date__elem__button {
    width: 40px;
    height: 40px;
  }

  .date__elem__button__arrow {
    right: unset;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  tbody {
    font-size: 14px;
  }
}
</style>
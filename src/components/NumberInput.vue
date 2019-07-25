<template>
  <input ref="numberInput" type="text" :value="initialValue || 0" />
</template>

<script>
const numberRegex = /[^\d]/;
export default {
  name: "NumberInput",
  props: {
    initialValue: Number,
    maxLength: Number,
    maxValue: Number,
    minValue: Number
  },
  mounted() {
    const input = this.$refs.numberInput;
    const that = this;

    const checkOutOfBoundries = () => {
      if (input.value > that.maxValue || input.value < that.minValue) {
        this.$emit(
          "errored",
          "Please keep the value between the number of boooked and total slots."
        );
      } else this.$emit("succeeded");
      this.$emit("change", input.value); // emitting here bcs this function occurs in both cases where the input value changes
    };

    input.addEventListener("input", function() {
      // this references input
      if (that.maxLength > 0 && this.value.length > that.maxLength) {
        this.value = this.value.slice(1, that.maxLength + 1);
      }
      this.value = this.value.replace(numberRegex, "");
      checkOutOfBoundries();
    });

    input.addEventListener("paste", event => {
      // disable pasting text in number input
      event.preventDefault();
    });

    input.addEventListener("keydown", function(event) {
      // allow increment/decerement on arrows
      if (event.key === "ArrowUp") {
        this.value = `${++this.value}`;
        event.preventDefault();
      }

      if (event.key === "ArrowDown") {
        this.value = `${--this.value}`;
        event.preventDefault();
      }

      checkOutOfBoundries();
    });
  }
};
</script>

<style scoped>
input {
  width: 24px;
  border: solid 1px #00000040;
  border-radius: 2px;
  padding: 4px;
  text-align: center;
  font-family: "Nunito Sans", sans-serif;
}
</style>

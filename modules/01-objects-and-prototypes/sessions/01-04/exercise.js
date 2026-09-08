export class Counter {
  constructor(initialValue = 0) {
    this.value = initialValue;
  }
}

Counter.prototype.increment = () => {
  this.value += 1;
  return this.value;
};

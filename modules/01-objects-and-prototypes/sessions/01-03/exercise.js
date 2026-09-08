function isObjectValue(value) {
  return (
    (typeof value === "object" && value !== null) ||
    typeof value === "function"
  );
}

export function manualNew(Constructor, args = []) {
  const candidatePrototype = Constructor.prototype;
  const prototype = isObjectValue(candidatePrototype)
    ? candidatePrototype
    : Object.prototype;
  const receiver = Object.create(prototype);
  const returned = Constructor.apply(receiver, args);

  return receiver;
}

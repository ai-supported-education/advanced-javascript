const defaults = {
  timeout: 3_000,
  mode: "safe"
};

const service = Object.create(defaults);
service.name = "billing";

console.log("initial timeout:", service.timeout);
console.log("initial own timeout:", Object.hasOwn(service, "timeout"));
console.log("initial timeout in chain:", "timeout" in service);
console.log(
  "prototype is defaults:",
  Object.getPrototypeOf(service) === defaults
);

service.timeout = 1_000;
console.log("shadowed timeout:", service.timeout);
console.log("defaults timeout:", defaults.timeout);
console.log("shadowed own timeout:", Object.hasOwn(service, "timeout"));

delete service.timeout;
console.log("revealed timeout:", service.timeout);
console.log("revealed own timeout:", Object.hasOwn(service, "timeout"));

service.retries = undefined;
console.log("own undefined value:", service.retries);
console.log("own undefined exists:", Object.hasOwn(service, "retries"));
console.log("missing value:", service.missing);
console.log("missing exists:", Object.hasOwn(service, "missing"));

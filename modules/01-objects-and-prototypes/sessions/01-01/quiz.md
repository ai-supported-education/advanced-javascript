# Quiz: маршрут поиска свойства

Сначала спрогнозируйте вывод каждого полного фрагмента, не запуская его. Затем
выберите один вариант и запишите в `answers.json` его букву и собственное
объяснение.

## q1. Доступное, но не собственное

```js
const defaults = { retries: 2 };
const job = Object.create(defaults);
job.name = "export";

console.log(
  job.retries,
  Object.hasOwn(job, "retries"),
  "retries" in job
);
```

Какую строку напечатает программа?

- A. `2 true true`
- B. `2 false true`
- C. `undefined false false`

## q2. Что открылось после delete

```js
const defaults = { format: "json" };
const request = Object.create(defaults);
request.format = "csv";

delete request.format;

console.log(
  request.format,
  Object.hasOwn(request, "format"),
  "format" in request
);
```

Какую строку напечатает программа?

- A. `csv true true`
- B. `undefined false false`
- C. `json false true`

## q3. Два одинаковых значения

```js
const record = { result: undefined };

console.log(
  record.result,
  record.missing,
  Object.hasOwn(record, "result"),
  Object.hasOwn(record, "missing")
);
```

Какую строку напечатает программа?

- A. `undefined undefined true false`
- B. `undefined undefined false false`
- C. `undefined null true false`

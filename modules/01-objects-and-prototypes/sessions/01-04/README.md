# 01-04. Class поверх prototype chain

Ожидаемое время: 50 минут.

После предыдущей карточки `new` уже не выглядит отдельной магией: он создаёт
объект, связывает его с `prototype`, вызывает функцию с новым `this` и учитывает
явно возвращённый объект. Синтаксис `class` делает запись компактнее, но не
заменяет эту модель другой системой объектов.

Исходный код создаёт класс `Counter`. Параметр `initialValue` метода
`constructor` содержит число, переданное в `new Counter(...)`; строка
`this.value = initialValue` записывает это число в собственное поле `value`
нового экземпляра. Затем `increment` добавляется в `Counter.prototype`, поэтому
экземпляры `first` и `second` действительно находят одну и ту же функцию.

Запись `() => {}` создаёт стрелочную функцию. В отличие от обычной функции,
стрелка не получает `this` из вызова слева от точки, а сохраняет `this`
окружающего кода. Файл упражнения является ES module, поэтому окружающий
top-level `this` равен `undefined`. Теперь можно заранее объяснить наблюдаемое
падение в исходном коде:

```js
class Counter {
  constructor(initialValue) {
    this.value = initialValue;
  }
}

Counter.prototype.increment = () => {
  this.value += 1;
};

const first = new Counter(1);
const second = new Counter(10);

console.log(first.increment === second.increment); // true
first.increment(); // TypeError: стрелка обращается не к first
```

До вызова `first` хранит собственное `value: 1`, а общий `increment` найден выше
по цепочке. Действие `first.increment()` всё же падает: lookup находит функцию,
но стрелка продолжает использовать сохранённый `undefined` вместо `first`.
Вопрос карточки: как оставить один общий метод в prototype и при этом направить
его на экземпляр слева от точки?

<!-- content-review:opening:end -->

## Результат и границы

Вы исправите `Counter`, а затем по наблюдаемым признакам докажете две вещи:
состояние принадлежит каждому экземпляру отдельно, а функция `increment` остаётся
общей через prototype. Приватные поля, decorators и transpilation class syntax в
эту карточку не входят.

## До начала

- Вы уже умеете проследить property lookup и шаги `new`.
- Рабочая среда: Node.js 24 LTS. Node.js 26 проверяет авторский compatibility
  gate; второй runtime не входит в задание или evidence этой карточки.
- Выполните `node --version` и запишите фактический вывод в `notes.md`. Если он
  начинается не с `v24.`, остановитесь и переключите Node.js до baseline.
- Starter намеренно красный. Запустите его до изменения и сохраните команду,
  exit code и релевантное падение в `notes.md`:

  ```bash
  pnpm exec vitest run modules/01-objects-and-prototypes/sessions/01-04/exercise.test.js
  ```

## Что именно добавляет `class`

Объявление класса создаёт функцию-конструктор и объект
`Counter.prototype`. Обычный нестатический публичный метод, записанный внутри
тела класса, становится свойством этого prototype. Статические и приватные
методы в этой карточке не рассматриваются. Экземпляр хранит собственные данные,
а метод получает `this` в момент вызова через объект-получатель.

```js
class Meter {
  constructor(value) {
    this.value = value;
  }

  read() {
    return this.value;
  }
}

const left = new Meter(3);
const right = new Meter(8);

console.log(left.read()); // 3
console.log(right.read()); // 8
console.log(left.read === right.read); // true
```

До вызова у `left` есть собственное `value: 3`, у `right` — собственное
`value: 8`; `read` у обоих найден в `Meter.prototype`. Выражение
`left.read()` создаёт вызов с receiver `left`, поэтому внутри общего метода
`this === left`. Во втором вызове receiver уже `right`.

Это можно увидеть без синтаксического сахара:

```js
function read() {
  return this.value;
}

const meterPrototype = { read };
const meter = Object.create(meterPrototype);
meter.value = 5;

console.log(meter.read()); // 5
console.log(Object.hasOwn(meter, "read")); // false
```

Property lookup находит `read` выше по цепочке, но receiver вызова остаётся
`meter`. Место хранения функции и значение `this` — разные вопросы.

## Почему стрелка меняет результат

Стрелочная функция не создаёт собственного `this`. В браузерном script и ES
module окружающие значения могут различаться, поэтому нельзя чинить этот код,
угадывая глобальный объект. В курсе файлы исполняются как ES modules; top-level
`this` там равен `undefined`.

```js
const box = { value: 10 };

box.readWithReceiver = function () {
  return this.value;
};
box.readLexically = () => this?.value;

console.log(box.readWithReceiver()); // 10
console.log(box.readLexically()); // undefined
```

В обоих случаях слева от точки стоит `box`, но только обычная функция принимает
его как `this`. Стрелка полезна, когда как раз нужно сохранить внешний `this`; для
receiver-зависимого prototype method это другая семантика.

Есть ещё одна граница. Если отделить обычный метод от receiver, сам lookup уже не
поможет:

```js
const detachedRead = box.readWithReceiver;

console.log(detachedRead.call({ value: 12 })); // 12
```

`call` явно задаёт receiver. Автоматически привязывать извлечённые методы сегодня
не требуется; пример лишь показывает, что `this` определяется вызовом, а не
файлом, где функция была объявлена.

## Два правдоподобных неверных пути

1. Создать новую стрелку `increment` внутри constructor. Вызовы заработают,
   потому что стрелка захватит `this` constructor, но каждый экземпляр получит
   собственную функцию. Это нарушит контракт общей функции в prototype и скроет
   изучаемый механизм.
2. Попытаться привязать текущую стрелку к `Counter.prototype` через `bind`.
   `bind` не меняет лексический `this` стрелки, поэтому останется прежний
   `TypeError`. Если сначала заменить стрелку обычной функцией, а затем привязать
   её к `Counter.prototype`, вызовы перестанут работать с receiver: они начнут
   менять общее состояние prototype вместо `first` или `second`.

## Задание

Измените только определение `Counter.prototype.increment` в `exercise.js`.
Сохраните публичные имена `Counter`, `value` и `increment`.

После исправления:

- `first.increment()` меняет `first.value`, не затрагивая `second.value`;
- экземпляры находят одну и ту же функцию через `Counter.prototype`;
- у экземпляров нет собственного свойства `increment`;
- метод можно вызвать с явно выбранным receiver через `call`.

Не переносите функцию в constructor и не меняйте test.

## Проверка и evidence

- Local check запускает поведенческий test командой из раздела «До начала».
- Agent review сверяет объяснение `this` с фактической формой вызова и проверяет,
  что решение не размножает функции по экземплярам.
- Evidence: изменённый `exercise.js` и `notes.md` с фактическими red/green
  запусками и коротким ответом о различии lookup метода и выбора `this`.

Сначала выполните `pnpm session:check`. Только после его зелёного результата
попросите Codex проверить активную сессию. Команда
`pnpm session:review` только печатает пакет для проверки и сама агента не
запускает; reviewer вернёт и запишет фактический `PASS` либо `NEEDS_WORK`.
При `NEEDS_WORK` исправьте решение или evidence и повторите check/review. Только
после записанного `PASS` выполните `pnpm session:finish`.

## DONE

- [ ] Красный starter был воспроизведён до изменения и записан в `notes.md`.
- [ ] Зелёный запуск записан в `notes.md`; все проверки `exercise.test.js`
  зелёные.
- [ ] `increment` остаётся унаследованным общим методом.
- [ ] В `notes.md` объяснение опирается на receiver конкретного вызова.
- [ ] `pnpm session:check` зелёный; agent review проверил evidence и записал
  `PASS`.
- [ ] `pnpm session:finish` завершил карточку.

## Куда дальше

Теперь вы умеете читать удобный `class` через обычную prototype chain. В
следующей карточке та же цепочка станет границей доверия: разберём, как копирование
непроверенных ключей меняет prototype объекта.

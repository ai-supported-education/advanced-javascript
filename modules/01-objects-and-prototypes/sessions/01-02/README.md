# 01-02. Descriptor меняет поведение поля

Ожидаемое время: 50 минут.

В 01-01 вы научились отвечать, на каком объекте закончился поиск свойства. Этого
ещё недостаточно, чтобы понять, что с найденным свойством разрешено делать.
Property descriptor (далее — descriptor) — это запись с правилами конкретного
свойства: какое значение хранится, можно ли перезаписать это значение, а само
свойство — увидеть при перечислении или удалить.

Представим объект задачи `task`. Поле `id` хранит постоянный идентификатор, а
`title` — редактируемое название. Запись `{ ...task }` создаёт новый объект и
копирует в него перечисляемые собственные поля `task`, а
`Object.hasOwn(task, "id")` проверяет, осталось ли `id` собственным полем:

```js
const task = { id: "T-17", title: "Проверить сборку" };

task.id = "T-18";
task.title = "Проверить package";

console.log(task); // { id: "T-18", title: "Проверить package" }
console.log({ ...task }); // оба поля попали в копию через object spread

delete task.id;
console.log(Object.hasOwn(task, "id")); // false
```

Object literal создал оба собственных свойства по одинаковым правилам: запись
меняет их, object spread перечисляет их, а `delete` удаляет. Публичный контракт
требует другого: `title` остаётся изменяемым, а `id` по-прежнему попадает в копию,
но его значение и само свойство нельзя изменить. Исходный код упражнения
(starter) воспроизводит одинаковое поведение обоих полей. Вопрос карточки: как
изменить descriptor одного свойства, не замораживая весь объект вместе с ним?

<!-- content-review:opening:end -->

## Результат и границы

Вы исправите фабрику `createTaskRecord`: её `id` останется видимым при
перечислении и копировании. `Reflect.set` и `Reflect.deleteProperty` сообщат
отказ значением `false`, а прямые операторы в текущем ES module бросят
`TypeError`; после любой попытки `id` останется прежним. `title` сохранит обычную
изменяемость. В scope входят собственные property descriptors; поведение
inherited setter и механика `Proxy` будут разобраны позже.

## До начала

- Вы умеете различать own property и результат поиска по prototype chain.
- Рабочая среда: Node.js 24 LTS. Node.js 26 проверяет авторский compatibility
  gate; второй runtime не входит в задание или evidence этой карточки.
- Выполните `node --version` и запишите фактический вывод в `evidence.md`. Если
  он начинается не с `v24.`, остановитесь и переключите Node.js до baseline.
- Starter намеренно нарушает контракт `id`. До изменения запустите команду ниже
  и сохраните фактический exit code и релевантное падение в `evidence.md`:

  ```bash
  pnpm exec vitest run modules/01-objects-and-prototypes/sessions/01-02/exercise.test.js
  ```

Красный результат этой команды будет фактическим baseline. Не переносите в
evidence ожидаемый текст ошибки из README вместо собственного запуска.

## У свойства есть не только значение

Собственное свойство описывается записью с атрибутами — property descriptor.
Для свойства, которое непосредственно хранит значение, важны четыре поля:

- `value` — хранимое значение;
- `writable` — может ли обычная запись заменить значение;
- `enumerable` — попадёт ли ключ в `Object.keys`, object spread и другие операции
  перечисления;
- `configurable` — можно ли удалить свойство или заново изменить существенные
  части descriptor.

`Object.getOwnPropertyDescriptor(object, key)` возвращает descriptor собственного
свойства. Для показанного обычного data property `Reflect.set(object, key,
value)` сообщает успех записи значением `true` или обычный отказ из-за
`writable: false` значением `false`. `Reflect.deleteProperty` так же возвращает
`false` для собственного свойства с `configurable: false`. Эти методы всё ещё
могут бросить исключение при других входах или поведении объекта; такие случаи в
упражнение не входят.

Важно не переносить boolean-контракт `Reflect.*` на синтаксис операторов. Файлы
курса являются ES modules, а module code всегда выполняется в strict mode. В
этой среде прямое `task.id = "T-18"` для non-writable свойства и
`delete task.id` для non-configurable свойства не возвращают доступный программе
`false`, а бросают `TypeError`. Ниже мы наблюдаем обе формы отказа отдельно.

### Сценарий 1: что создаёт object literal

```js
const task = { id: "T-17" };
const descriptor = Object.getOwnPropertyDescriptor(task, "id");

console.log(descriptor);
// { value: "T-17", writable: true, enumerable: true, configurable: true }

console.log(Reflect.set(task, "id", "T-18")); // true
console.log(task.id); // "T-18"
console.log(Reflect.deleteProperty(task, "id")); // true
console.log(Object.hasOwn(task, "id")); // false
```

Исходно literal создаёт обычное data property со всеми тремя флагами `true`.
Действие `Reflect.set` действительно заменяет `value`, а удаление убирает ключ.
Именно такое поведение сейчас получает `id` в starter.

### Сценарий 2: видимое свойство без права переписать его

`Object.defineProperty(object, key, descriptor)` создаёт либо перенастраивает
собственное свойство. При создании нового data property пропущенный `value`
становится `undefined`, а пропущенные булевы флаги `writable`, `enumerable` и
`configurable` — `false`; поэтому полезно задавать нужный контракт явно.

```js
const task = { title: "Проверить сборку" };

Object.defineProperty(task, "id", {
  value: "T-17",
  writable: false,
  enumerable: true,
  configurable: false
});

console.log(Object.keys(task)); // ["title", "id"]
console.log({ ...task }); // { title: "Проверить сборку", id: "T-17" }
console.log(Reflect.set(task, "id", "T-18")); // false
console.log(Reflect.deleteProperty(task, "id")); // false
console.log(task.id); // "T-17"

task.title = "Проверить package";
console.log(task.title); // "Проверить package"

try {
  task.id = "T-18";
} catch (error) {
  console.log(error.name); // "TypeError"
}

try {
  delete task.id;
} catch (error) {
  console.log(error.name); // "TypeError"
}

console.log(task.id); // "T-17"
```

До двух попыток `id` существует и перечисляется. Обе операции возвращают
`false`, а следующее чтение показывает прежнее значение. Две прямые попытки
бросают `TypeError`, потому что этот файл — strict ES module; пойманные исключения
не меняют объект. Ограничение относится только к `id`: descriptor уже
существующего `title` не менялся.

### Другая форма descriptor: accessor property

Descriptor может не хранить `value`, а предоставить функции `get` и `set`.
Такое accessor property выполняет функцию при чтении или записи. Смешивать
`value`/`writable` с `get`/`set` в одном descriptor нельзя.

```js
let seconds = 120;
const timer = {};

Object.defineProperty(timer, "minutes", {
  enumerable: true,
  get() {
    return seconds / 60;
  },
  set(nextMinutes) {
    seconds = nextMinutes * 60;
  }
});

console.log(timer.minutes); // 2
timer.minutes = 3;
console.log(seconds); // 180
```

Здесь поиск находит `minutes` у `timer`, но чтение не извлекает сохранённое
число: оно вызывает `get`. В упражнении accessor не нужен; пример показывает,
почему место находки из 01-01 и поведение найденного свойства — два разных шага.

## Два правдоподобных неверных пути

1. Вернуть `Object.freeze({ id, title })`. `id` станет защищённым, но вместе с ним
   перестанет изменяться `title`. Глобальное ограничение объекта шире публичного
   контракта одного поля.
2. Указать только `{ value: id }` в `Object.defineProperty`. Запись и удаление
   действительно будут запрещены благодаря значениям по умолчанию, но
   `enumerable` тоже окажется `false`. Тогда `id` пропадёт из spread и
   сериализуемого набора полей.

## Задание

Измените только реализацию `createTaskRecord` в `exercise.js`. Сохраните имя
функции, её параметры и формат возвращаемого объекта.

После исправления:

- `id` читается и попадает в `Object.keys`, object spread и `JSON.stringify`;
- `Reflect.set` другого `id` возвращает `false`, а прямое присваивание в этом
  ES module бросает `TypeError`; исходное значение сохраняется;
- `Reflect.deleteProperty` возвращает `false`, а прямой `delete` бросает
  `TypeError`; свойство сохраняется;
- `title` по-прежнему можно менять обычным присваиванием.

Не меняйте acceptance test. Не замораживайте весь объект: это ломает изменяемость
`title`. Не запечатывайте его: `Object.seal` оставит записываемыми оба
существующих data property, поэтому вообще не защитит `id` от присваивания.
Кроме того, он запретит расширение объекта и удаление всех его существующих
полей — это шире локального контракта `id`.

## Проверка и evidence

- Local check запускает `exercise.test.js` командой из «До начала» и проверяет
  чтение, копирование, boolean-отказ `Reflect.*` и `TypeError` прямых операторов.
- Agent review сверяет область ограничения: защищён `id`, но не весь record.
- Evidence: изменённый `exercise.js`, заполненный `evidence.md` с фактическими
  red/green запусками и неизменённый test.

После зелёного check попросите Codex проверить активную сессию. Команда
`pnpm session:review` только печатает пакет для проверки и сама агента не
запускает; reviewer вернёт и запишет фактический `PASS` либо `NEEDS_WORK`.
При `NEEDS_WORK` исправьте решение или evidence и повторите check/review. Только
после записанного `PASS` выполните `pnpm session:finish`.

## DONE

- [ ] Красный starter воспроизведён до изменения и записан в `evidence.md`.
- [ ] `id` остаётся видимым; `Reflect.*` возвращают `false`, прямые операторы
  бросают `TypeError`, а значение и свойство сохраняются.
- [ ] `title` остаётся изменяемым.
- [ ] Зелёный запуск записан в `evidence.md`; `exercise.test.js` и
  `pnpm session:check` зелёные.
- [ ] Agent review проверил неизменённый test и решение и записал `PASS`.
- [ ] `pnpm session:finish` завершил карточку.

## Куда дальше

Теперь вы знаете, что prototype связывает объекты, а descriptor задаёт поведение
отдельного свойства. В следующей карточке мы вернёмся к первой из этих идей и
разберём, как `new Constructor(...)` связывает новый объект с prototype.
Descriptor снова понадобится в заключительной диагностике главы.

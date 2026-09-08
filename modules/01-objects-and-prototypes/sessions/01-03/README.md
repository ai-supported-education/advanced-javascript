# 01-03. Что именно делает `new`

Ожидаемое время: 50 минут.

В 01-01 вы использовали `[[Prototype]]` как внутреннюю ссылку одного объекта на
следующий объект поиска. У объявленной через `function` функции-конструктора
`Ticket` есть другое, публичное свойство `.prototype`: выражение
`Ticket.prototype` возвращает объект, который станет следующим объектом поиска
для будущих экземпляров. Во время
`new Ticket(...)` JavaScript создаёт новый объект и устанавливает его внутренний
`[[Prototype]]` равным именно объекту из `Ticket.prototype`, а при вызове функции
новый объект становится значением `this`.

Возьмём функцию-конструктор `Ticket`. Параметр `id` будет содержать строковый
идентификатор билета, а запись `this.id = id` создаст одноимённое собственное
поле у нового экземпляра. Общую для билетов метку `kind` разместим не в каждом
экземпляре, а в объекте `Ticket.prototype`. Переменная `ticket` получит результат
`new Ticket("T-17")`.

Связь между внутренним `[[Prototype]]` экземпляра `ticket` и конкретным объектом
`Ticket.prototype` можно проверить методом `Object.getPrototypeOf`, который
возвращает внутренний `[[Prototype]]` переданного объекта:

```js
function Ticket(id) {
  this.id = id;
}

Ticket.prototype.kind = "support";

const ticket = new Ticket("T-17");

console.log(ticket.id); // "T-17" — функция записала поле через this
console.log(ticket.kind); // "support" — поиск дошёл до Ticket.prototype
console.log(Object.getPrototypeOf(ticket) === Ticket.prototype); // true
```

До выражения `new` существует функция `Ticket` и объект в её свойстве
`.prototype`, но `ticket` ещё нет. `new` создаёт `ticket`, вызывает `Ticket` с ним
как `this` и возвращает созданный объект. Первый `console.log` читает собственное
поле, записанное через `this`; второй находит унаследованную метку `kind`; третий
напрямую сравнивает установленный `[[Prototype]]` с объектом `Ticket.prototype`.
Правило выбора возвращаемого объекта мы изолируем в следующем сценарии.

Есть одна развилка, которую легко не заметить, пока функции-конструкторы только
записывают поля в `this`: функция вправе явно вернуть другой объект, и тогда
результат всего выражения `new` меняется. Исходный код упражнения уже
воспроизводит создание, установку `[[Prototype]]` и вызов, но всегда отдаёт
первоначальный объект. Назовём такой объект объектом-получателем (`receiver`).
Вопрос карточки: в какой момент `new` оставляет созданный receiver, а в какой —
заменяет его значением из `return`?

<!-- content-review:opening:end -->

## Результат и границы

Вы завершите учебную функцию `manualNew` и проверите пять наблюдаемых свойств:
prototype результата, значение `this` при вызове, передачу аргументов,
однократность вызова и правило явного `return`. Модель рассчитана на объявленные через `function`
функции-конструкторы, у которых свойство `.apply` не переопределено и наследуется
от `Function.prototype`.
Проверка constructability, `class`, bound functions, `new.target`, realms,
изменённых function intrinsics и полный абстрактный алгоритм спецификации
остаются за пределами карточки.

`manualNew` — инструмент для объяснения, а не полифилл и не замена оператору
`new` в production-коде.

## До начала

- Вы умеете читать prototype chain и знаете, что `.prototype`
  функции-конструктора — публичное свойство, отличное от внутренней ссылки
  `[[Prototype]]` объекта.
- Вы знакомы с `this`, обычными функциями и rest/spread для массива аргументов.
- Рабочая среда: Node.js 24 LTS. Node.js 26 проверяет авторский compatibility
  gate; второй runtime не входит в задание или evidence этой карточки.
- Выполните `node --version` и запишите фактический вывод в `evidence.md`. Если
  он начинается не с `v24.`, остановитесь и переключите Node.js до baseline.
- До изменения воспроизведите целевое падение и сохраните фактический exit code и
  релевантное падающее ожидание в `evidence.md`:

  ```bash
  pnpm exec vitest run modules/01-objects-and-prototypes/sessions/01-03/exercise.test.js
  ```

## Четыре решения, скрытые в одной записи

У объявленной через `function` функции-конструктора есть объект в свойстве
`.prototype`. Оператор `new` использует его как `[[Prototype]]` создаваемого
объекта. Это связь для будущего property lookup, а не копирование методов в
экземпляр.

Дальше полезно читать `new Constructor(...args)` как последовательность
наблюдаемых решений:

| Шаг | Что происходит | Что можно проверить |
| --- | --- | --- |
| 1 | Выбирается prototype будущего объекта | `Object.getPrototypeOf(result)` |
| 2 | Создаётся объект-получатель | До вызова constructor ещё не записал в него собственные поля |
| 3 | `Constructor` один раз вызывается с этим объектом как `this` и получает `args` | Записи `this.key = value` появляются у объекта, а счётчик вызовов увеличивается на один |
| 4 | Выбирается итог: явный объект из `return` либо созданный получатель | Identity и prototype возвращённого значения |

Если значение `Constructor.prototype` не является объектом, настоящий `new`
использует `Object.prototype` как запасной вариант. Starter уже учитывает эту
границу. Для шагов 1–2 он вызывает `Object.create(prototype)`: метод создаёт новый
объект и устанавливает переданный `prototype` как его внутренний `[[Prototype]]`.
Затем starter вызывает функцию методом `apply`: выражение
`Constructor.apply(receiver, args)` задаёт `receiver` как `this` и передаёт
элементы массива `args` отдельными аргументами.

### Сценарий 1: constructor заполняет созданный объект

```js
function Ticket(id) {
  this.id = id;
}

Ticket.prototype.label = function label() {
  return `ticket:${this.id}`;
};

const ticket = new Ticket("T-17");

console.log(ticket.id); // "T-17"
console.log(ticket.label()); // "ticket:T-17"
console.log(Object.getPrototypeOf(ticket) === Ticket.prototype); // true
console.log(Object.hasOwn(ticket, "label")); // false
```

До `new` объект метода существует в `Ticket.prototype`, но экземпляра ещё нет.
Во время вызова `this.id = id` создаёт собственный `id` у нового получателя.
После вызова функция не возвращает объект явно, поэтому получатель становится
результатом. Метод `label` находится уже через prototype chain.

### Сценарий 2: явный return меняет результат

```js
function KeepCreatedObject(name) {
  this.name = name;
  return 42;
}

function ReplaceCreatedObject(name) {
  this.name = "не будет видно";
  return { name, source: "explicit return" };
}

const kept = new KeepCreatedObject("Ada");
const replaced = new ReplaceCreatedObject("Grace");

console.log(kept.name); // "Ada"
console.log(Object.getPrototypeOf(kept) === KeepCreatedObject.prototype); // true
console.log(replaced.name); // "Grace"
console.log(replaced.source); // "explicit return"
console.log(Object.getPrototypeOf(replaced) === ReplaceCreatedObject.prototype);
// false
```

Число `42` — primitive, поэтому первый constructor не заменяет созданный объект.
Второй constructor возвращает объект, и именно он становится результатом; ранний
receiver вместе с записанным `this.name` больше недоступен вызывающему коду.

Функция тоже считается объектным значением для этой развилки:

```js
function CreatePlugin() {
  return function plugin() {
    return "ready";
  };
}

const plugin = new CreatePlugin();

console.log(typeof plugin); // "function"
console.log(plugin()); // "ready"
```

Напротив, `null` является primitive и не заменяет созданный receiver, хотя
исторический результат `typeof null` равен строке `"object"`.

## Два правдоподобных неверных пути

1. Выбрать `returned || receiver`. Такая проверка отвечает на вопрос об
   истинности (`truthiness`), а `new` отвечает на вопрос о типе значения. Например,
   truthy-число `42` ошибочно стало бы результатом вместо receiver.
2. Проверить только `typeof returned === "object"`. Условие ошибочно принимает
   `null` за объект и пропускает функции, хотя настоящее правило действует
   наоборот для обоих случаев.

## Задание

В `exercise.js` завершите только финальный выбор результата `manualNew`.
Сохраните уже реализованные шаги выбора prototype, создания receiver и вызова
`Constructor`. Не используйте внутри решения оператор `new` или
`Reflect.construct`: они выполнят изучаемую работу вместо вашей реализации.

Публичный контракт:

- без явного объектного результата возвращается созданный receiver;
- primitive из `return`, включая `null`, не заменяет receiver;
- явно возвращённый object или function становится итогом без копирования;
- аргументы, `this` и prototype link продолжают работать как в starter;
- `Constructor` вызывается ровно один раз.

Не меняйте acceptance test и экспорт `manualNew`.

## Проверка и evidence

- Local check запускает `exercise.test.js` командой из «До начала» и наблюдает
  identity, prototype, число вызовов, собственные поля и вызываемость
  function-result.
- Agent review проверяет, что код реализует решение по типу значения, а не по
  truthiness, не повторяет вызов и не делегирует задачу готовому механизму
  construction.
- Evidence: изменённый `exercise.js`, заполненный `evidence.md` с фактическими
  red/green запусками и неизменённый test.

Сначала выполните `pnpm session:check`. Только после его зелёного результата
попросите Codex проверить активную сессию. Команда
`pnpm session:review` только печатает пакет для проверки и сама агента не
запускает; reviewer вернёт и запишет фактический `PASS` либо `NEEDS_WORK`.
При `NEEDS_WORK` исправьте решение или evidence и повторите check/review. Только
после записанного `PASS` выполните `pnpm session:finish`.

## DONE

- [ ] Целевое падение starter воспроизведено до изменения и записано в
  `evidence.md`.
- [ ] Object и function из явного `return` заменяют receiver.
- [ ] Primitive и `null` не заменяют receiver.
- [ ] Инициализация через `this`, аргументы и prototype link сохранены;
  constructor вызывается ровно один раз.
- [ ] Зелёный запуск записан в `evidence.md`; `exercise.test.js` и
  `pnpm session:check` зелёные.
- [ ] Agent review записал `PASS`, а `pnpm session:finish` завершил карточку.

## Куда дальше

После этой карточки `new` можно объяснить через prototype link, вызов и выбор
результата. В следующей карточке вы проверите, какие из этих отношений сохраняет
синтаксис `class` и почему стрелка в prototype method меняет значение `this`.

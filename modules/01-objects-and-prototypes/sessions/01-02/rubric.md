# Rubric: 01-02 — Descriptor меняет поведение поля

## Invariants

- [ ] Возвращаемый record содержит собственные `id` и `title` с переданными
  значениями.
- [ ] `id` участвует в перечислении, object spread и JSON-сериализации.
- [ ] `Reflect.set` и `Reflect.deleteProperty` возвращают `false`; прямое
  присваивание и `delete` в ES module бросают `TypeError`; ни одна попытка не
  меняет и не убирает `id`.
- [ ] `title` можно изменить независимо от `id`.
- [ ] Ограничение относится только к `id`: несвязанное собственное поле можно
  добавить и удалить.
- [ ] Исправление ограничено `createTaskRecord`; acceptance test не изменён.

## Valid alternatives

- Предпочтителен data descriptor с явно заданными флагами, но другой descriptor
  допустим, если он сохраняет весь наблюдаемый контракт без внешнего mutable
  state.
- Порядок ключей в object не оценивается отдельно.

## Evidence and safety

- [ ] Test проверяет boolean-результаты `Reflect.*`, ошибки прямых strict-mode
  операторов и итоговое состояние, а не имя выбранного API.
- [ ] В `evidence.md` есть версия Node.js, команды, exit codes и релевантные
  фактические результаты запуска starter и решения; вывод не переписан из
  ожидаемого примера.

## Optional improvements

- Дополнительное исследование descriptor через
  `Object.getOwnPropertyDescriptor` не блокирует PASS.

## NEEDS_WORK

Верните `NEEDS_WORK`, если `id` можно заменить или удалить, если он исчезает из
обычного копирования, если решение блокирует изменение `title` либо обходит test.
